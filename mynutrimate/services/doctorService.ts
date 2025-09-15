


import { supabase } from './supabaseClient';
import type { UserProfile, FoodAnalysis, Database, NutritionInfo, DoctorConnection, DoctorProfile, PatientData, RestrictedFood, SafetyVerdict, Json } from '../types';

// Generates a random 6-character alphanumeric string for the Doctor code.
export const generateDoctorCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const getMyDoctorConnections = async (userId: string): Promise<{ data: DoctorConnection[] | null, error: string | null }> => {
    const { data, error } = await supabase
        .from('doctor_connections')
        .select(`
            id,
            created_at,
            doctor_id,
            user_id,
            doctor_note,
            doctors (
                full_name,
                phone_number
            )
        `)
        .eq('user_id', userId);

    if (error) {
        console.error("Error fetching connections:", error);
        return { data: null, error: 'Failed to fetch Doctor connections.' };
    }
    return { data: data as DoctorConnection[], error: null };
};

export const connectUserToDoctor = async (userId: string, doctorCode: string, doctorFirstName: string): Promise<{ data: { success: boolean } | null, error: string | null }> => {
    const trimmedCode = doctorCode.trim().toUpperCase();
    const trimmedName = doctorFirstName.trim().toLowerCase();

    if (!trimmedCode || !trimmedName) {
        return { data: null, error: "Doctor Code and First Name are required." };
    }

    // Step 1: Find the doctor by their unique code.
    const findDoctorResponse = await supabase
        .from('doctors')
        .select('id, full_name')
        .eq('doctor_code', trimmedCode)
        .maybeSingle();

    const { data: doctor, error: findError } = findDoctorResponse;

    if (findError) {
        console.error("Database error while finding doctor:", findError);
        return { data: null, error: 'A database error occurred. Please try again later.' };
    }
    
    if (!doctor) {
        return { data: null, error: 'Invalid Doctor Code. Please double-check the code and try again.' };
    }

    // Step 2: Verify the doctor's name (more robust check).
    if (!doctor.full_name || !doctor.full_name.toLowerCase().includes(trimmedName)) {
        return { data: null, error: "The Doctor's first name does not seem to match the provided code. Please verify both details." };
    }

    // Step 3: Check if the patient is already connected to this doctor.
    const checkConnectionResponse = await supabase
        .from('doctor_connections')
        .select('id')
        .eq('user_id', userId)
        .eq('doctor_id', doctor.id)
        .maybeSingle();
        
    const { data: existingConnection, error: checkError } = checkConnectionResponse;

    if (checkError) {
        console.error("Database error checking existing connection:", checkError);
        return { data: null, error: "Could not verify existing connections due to a database error." };
    }

    if (existingConnection) {
        return { data: null, error: 'You are already connected with this Doctor.' };
    }

    // Step 4: Create the new connection.
    const newConnection = { user_id: userId, doctor_id: doctor.id };
    
    const { error: insertError } = await supabase
        .from('doctor_connections')
        .insert([newConnection]);
        
    if (insertError) {
        console.error("Database error inserting connection:", insertError);
        return { data: null, error: 'Failed to create the connection due to a database error.' };
    }

    return { data: { success: true }, error: null };
};

export const disconnectUserFromDoctor = async (connectionId: number): Promise<{ data: { success: boolean } | null, error: string | null }> => {
    const { error } = await supabase
        .from('doctor_connections')
        .delete()
        .eq('id', connectionId);

    if (error) {
        console.error("Error disconnecting:", error);
        return { data: null, error: 'Failed to disconnect.' };
    }
    return { data: { success: true }, error: null };
};

export const getDoctorPatients = async (doctorId: string): Promise<{ data: PatientData[] | null, error: string | null }> => {
    // 1. Get all connections for this Doctor
    const { data: connections, error: connError } = await supabase
        .from('doctor_connections')
        .select('id, created_at, doctor_id, user_id, doctor_note, doctors(full_name, phone_number)')
        .eq('doctor_id', doctorId);

    if (connError) {
        return { data: null, error: "Could not fetch patient list." };
    }
    if (!connections || connections.length === 0) {
        return { data: [], error: null };
    }
    
    const patientIds = connections.map(c => c.user_id);

    // 2. Fetch all profiles for those user IDs from the 'profiles' table
    const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', patientIds);

    if (profileError) {
        return { data: null, error: "Could not fetch patient profiles." };
    }
    if (!profiles) {
        return { data: [], error: null };
    }

    // 3. Fetch all food history for those user IDs
    const { data: histories, error: historyError } = await supabase
        .from('food_history')
        .select('*')
        .in('user_id', patientIds)
        .order('created_at', { ascending: false });

    if (historyError) {
        return { data: null, error: "Could not fetch patient food histories." };
    }

    // 4. Fetch all restricted foods for those user IDs
    const { data: restrictedFoods, error: restrictedFoodsError } = await supabase
        .from('restricted_foods')
        .select('*')
        .in('user_id', patientIds);

    if (restrictedFoodsError) {
        return { data: null, error: "Could not fetch patient restricted foods." };
    }

    // 4b. Fetch all safe foods for those user IDs
    const { data: safeFoods, error: safeFoodsError } = await supabase
        .from('safe_foods')
        .select('*')
        .in('user_id', patientIds);

    if (safeFoodsError) {
        return { data: null, error: "Could not fetch patient safe foods." };
    }


    // 5. Combine the data
    const patientsData = profiles.map(profile_row => {
        const patientHistory = (histories || [])
            .filter(h => h.user_id === profile_row.id && h.nutrition)
            .map((h): FoodAnalysis => ({
                id: h.id,
                user_id: h.user_id,
                date: h.created_at,
                foodName: h.food_name || 'Unnamed Food',
                estimatedWeightGrams: h.estimated_weight_grams || 0,
                nutrition: h.nutrition as NutritionInfo,
                type: 'food',
                dietaryWarnings: h.dietary_warnings ? h.dietary_warnings as string[] : null,
                safetyVerdict: h.safety_verdict ? h.safety_verdict as SafetyVerdict : undefined,
            }));
        
        const patientRestrictedFoods = restrictedFoods
            ?.filter(f => f.user_id === profile_row.id)
            .map(f => ({ ...f, reason: f.reason || '' })) || [];
        
        const patientSafeFoods = safeFoods
            ?.filter(f => f.user_id === profile_row.id) || [];

        const connection = connections.find(c => c.user_id === profile_row.id)!;
        
        const mappedProfile: UserProfile = {
            id: profile_row.id,
            username: profile_row.username,
            fullName: profile_row.full_name,
            phoneNumber: profile_row.phone_number,
            gender: profile_row.gender ?? 'other',
            dob: profile_row.dob,
            age: null, // will be calculated in component
            heightCm: profile_row.height_cm,
            weightKg: profile_row.weight_kg,
            activityLevel: profile_row.activity_level ?? 'sedentary',
            medicalHistory: profile_row.medical_history,
            updated_at: profile_row.updated_at,
            healthStarRating: profile_row.health_star_rating,
            dailyCalorieGoal: profile_row.daily_calorie_goal,
            dailyProteinGoal: profile_row.daily_protein_goal,
            dailyCarbohydratesGoal: profile_row.daily_carbohydrates_goal,
            dailyFatGoal: profile_row.daily_fat_goal,
            dailySugarGoal: profile_row.daily_sugar_goal,
            dailySodiumGoal: profile_row.daily_sodium_goal,
            dailyHydrationGoalMl: profile_row.daily_hydration_goal_ml,
        };

        return {
            profile: mappedProfile,
            history: patientHistory,
            connection: connection as DoctorConnection,
            safeFoods: patientSafeFoods,
            restrictedFoods: patientRestrictedFoods,
        };
    });

    return { data: patientsData, error: null };
};


export const updateDoctorNote = async (connectionId: number, note: string): Promise<{ data: { success: boolean } | null, error: string | null }> => {
    const noteUpdate = { doctor_note: note };

    const { error } = await supabase
        .from('doctor_connections')
        .update(noteUpdate)
        .eq('id', connectionId);

    if (error) {
        console.error("Error updating doctor note:", error);
        return { data: null, error: 'Failed to save the note.' };
    }
    return { data: { success: true }, error: null };
};