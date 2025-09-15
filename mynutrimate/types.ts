

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export type Gender = 'female' | 'male' | 'other';
export type ActivityLevel = 'sedentary' | 'lightly_active' | 'active' | 'very_active';

export type SafetyVerdict = {
    isSafe: boolean;
    reason: string;
};

export interface ParsedPrescriptionContent {
    diagnoses: string[];
    medications: { name: string; dosage: string }[];
}

export interface NutritionInfo {
  calories: number;
  proteinGrams: number;
  fatGrams: number;
  carbohydratesGrams: number;
  sugarGrams: number;
  sodiumMilligrams: number;
  micronutrients: {
    ironMg: number | null;
    calciumMg: number | null;
    potassiumMg: number | null;
    vitaminAIU: number | null;
    vitaminCMg: number | null;
    vitaminDIU: number | null;
  } | null;
}

export interface FoodAnalysis {
  type: 'food';
  id: number;
  date: string;
  foodName: string;
  estimatedWeightGrams: number;
  nutrition: NutritionInfo;
  user_id: string;
  dietaryWarnings: string[] | null;
  safetyVerdict?: SafetyVerdict;
}

export interface LabelAnalysis {
  type: 'label';
  id: number;
  date: string;
  user_id: string;
  productName: string;
  servingSizeGrams: number;
  nutrition: NutritionInfo;
  healthStars: number;
  healthSummary: string;
  expiryDate: string | null;
  dietaryWarnings: string[] | null;
  safetyVerdict?: SafetyVerdict;
}

export type AnalysisResult = FoodAnalysis | LabelAnalysis;


// --- NEW DATA MODEL ---
// UserProfile is for the Patient
export interface UserProfile {
  id: string; 
  username: string | null;
  fullName: string | null;
  phoneNumber: string | null;
  gender: Gender;
  dob: string | null;
  age: number | null;
  heightCm: number | null;
  weightKg: number | null;
  activityLevel: ActivityLevel;
  medicalHistory: string | null;
  updated_at?: string;
  healthStarRating: number | null;
  dailyCalorieGoal: number | null;
  dailyProteinGoal: number | null;
  dailyCarbohydratesGoal: number | null;
  dailyFatGoal: number | null;
  dailySugarGoal: number | null;
  dailySodiumGoal: number | null;
  dailyHydrationGoalMl: number | null;
}

// DoctorProfile is for Doctors and stores their professional info.
export interface DoctorProfile {
    id: string; // This is the user's UUID from auth.users
    username: string;
    fullName: string;
    phoneNumber: string | null;
    medicalRegistrationId: string;
    specialization: string | null;
    doctorCode: string;
}

export interface DoctorConnection {
    id: number;
    created_at: string;
    doctor_id: string;
    user_id: string;
    doctor_note: string | null;
    doctors: {
        full_name: string | null;
        phone_number: string | null;
    } | null;
}

export interface Prescription {
    id: number;
    user_id: string;
    created_at: string;
    raw_text: string | null;
    parsed_content: ParsedPrescriptionContent | null;
    image_url: string | null;
}

export interface SafeFood {
    id: number;
    doctor_id: string;
    user_id: string;
    created_at: string;
    food_name: string;
    brand_name: string | null;
    notes: string | null;
}

export interface RestrictedFood {
    id: number;
    doctor_id: string;
    user_id: string;
    created_at: string;
    food_name: string;
    brand_name: string | null;
    reason: string;
}

export interface GroceryListItem {
    id: number;
    user_id: string;
    created_at: string;
    product_name: string;
    brand_name: string | null;
    nutrition_info: NutritionInfo | null;
    health_stars: number | null;
    is_purchased: boolean;
}

export type View = 'dashboard' | 'analyze' | 'history' | 'profile' | 'prescription' | 'doctor_clients' | 'grocery' | 'grocery_list' | 'medical_files';
export type Theme = 'light' | 'dark';
export type UserRole = 'patient' | 'doctor';

export interface DailyIntake {
  [key: string]: number;
  calories: number;
  proteinGrams: number;
  carbohydratesGrams: number;
  fatGrams: number;
  sugarGrams: number;
  sodiumMilligrams: number;
}


// Type for ASHA Client Data (now Doctor's Patient Data)
export interface PatientData {
    profile: UserProfile;
    history: FoodAnalysis[];
    connection: DoctorConnection;
    safeFoods: SafeFood[];
    restrictedFoods: RestrictedFood[];
}

// Type for AI Health Insight on Dashboard
export type HealthInsight = {
  emoji: string;
  title: string;
  message: string;
};

export interface MealSuggestion {
  mealName: string;
  description: string;
  reason: string;
}

// --- Supabase Types ---

export type Database = {
  public: {
    Tables: {
      daily_metrics: {
        Row: {
            id: number;
            user_id: string;
            date: string;
            hydration_goal_completed: boolean;
            created_at: string;
        };
        Insert: {
            id?: number;
            user_id: string;
            date: string;
            hydration_goal_completed: boolean;
            created_at?: string;
        };
        Update: {
            id?: number;
            user_id?: string;
            date?: string;
            hydration_goal_completed?: boolean;
            created_at?: string;
        };
      };
      food_history: {
        Row: {
          id: number;
          user_id: string;
          created_at: string;
          food_name: string | null;
          estimated_weight_grams: number | null;
          nutrition: Json | null;
          dietary_warnings: string[] | null;
          safety_verdict: Json | null;
        };
        Insert: {
          id?: number;
          user_id: string;
          created_at?: string;
          food_name?: string | null;
          estimated_weight_grams?: number | null;
          nutrition?: Json | null;
          dietary_warnings?: string[] | null;
          safety_verdict?: Json | null;
        };
        Update: {
          id?: number;
          user_id?: string;
          created_at?: string;
          food_name?: string | null;
          estimated_weight_grams?: number | null;
          nutrition?: Json | null;
          dietary_warnings?: string[] | null;
          safety_verdict?: Json | null;
        };
      };
      profiles: {
        Row: {
          id: string;
          updated_at: string | null;
          username: string | null;
          full_name: string | null;
          phone_number: string | null;
          gender: "female" | "male" | "other" | null;
          dob: string | null;
          height_cm: number | null;
          weight_kg: number | null;
          activity_level: "sedentary" | "lightly_active" | "active" | "very_active" | null;
          medical_history: string | null;
          health_star_rating: number | null;
          daily_calorie_goal: number | null;
          daily_protein_goal: number | null;
          daily_carbohydrates_goal: number | null;
          daily_fat_goal: number | null;
          daily_sugar_goal: number | null;
          daily_sodium_goal: number | null;
          daily_hydration_goal_ml: number | null;
        };
        Insert: {
          id: string;
          updated_at?: string | null;
          username?: string | null;
          full_name?: string | null;
          phone_number?: string | null;
          gender?: "female" | "male" | "other" | null;
          dob?: string | null;
          height_cm?: number | null;
          weight_kg?: number | null;
          activity_level?: "sedentary" | "lightly_active" | "active" | "very_active" | null;
          medical_history?: string | null;
          health_star_rating?: number | null;
          daily_calorie_goal?: number | null;
          daily_protein_goal?: number | null;
          daily_carbohydrates_goal?: number | null;
          daily_fat_goal?: number | null;
          daily_sugar_goal?: number | null;
          daily_sodium_goal?: number | null;
          daily_hydration_goal_ml?: number | null;
        };
        Update: {
          id?: string;
          updated_at?: string | null;
          username?: string | null;
          full_name?: string | null;
          phone_number?: string | null;
          gender?: "female" | "male" | "other" | null;
          dob?: string | null;
          height_cm?: number | null;
          weight_kg?: number | null;
          activity_level?: "sedentary" | "lightly_active" | "active" | "very_active" | null;
          medical_history?: string | null;
          health_star_rating?: number | null;
          daily_calorie_goal?: number | null;
          daily_protein_goal?: number | null;
          daily_carbohydrates_goal?: number | null;
          daily_fat_goal?: number | null;
          daily_sugar_goal?: number | null;
          daily_sodium_goal?: number | null;
          daily_hydration_goal_ml?: number | null;
        };
      };
      doctors: {
        Row: {
            id: string; // FK to auth.users.id
            created_at: string;
            username: string;
            full_name: string;
            phone_number: string | null;
            medical_registration_id: string;
            specialization: string | null;
            doctor_code: string;
        };
        Insert: {
            id: string;
            created_at?: string;
            username: string;
            full_name: string;
            phone_number?: string | null;
            medical_registration_id: string;
            specialization?: string | null;
            doctor_code: string;
        };
        Update: {
            id?: string;
            created_at?: string;
            username?: string;
            full_name?: string;
            phone_number?: string | null;
            medical_registration_id?: string;
            specialization?: string | null;
            doctor_code?: string;
        };
      };
      doctor_connections: {
        Row: {
          id: number;
          created_at: string;
          doctor_id: string;
          user_id: string; // Patient's ID
          doctor_note: string | null;
        };
        Insert: {
          id?: number;
          created_at?: string;
          doctor_id: string;
          user_id: string;
          doctor_note?: string | null;
        };
        Update: {
          id?: number;
          created_at?: string;
          doctor_id?: string;
          user_id?: string;
          doctor_note?: string | null;
        };
      };
      prescriptions: {
        Row: {
            id: number;
            user_id: string;
            created_at: string;
            raw_text: string | null;
            parsed_content: Json | null;
            image_url: string | null;
        };
        Insert: {
            id?: number;
            user_id: string;
            created_at?: string;
            raw_text?: string | null;
            parsed_content?: Json | null;
            image_url?: string | null;
        };
        Update: {
            id?: number;
            user_id?: string;
            created_at?: string;
            raw_text?: string | null;
            parsed_content?: Json | null;
            image_url?: string | null;
        };
      };
      safe_foods: {
        Row: {
            id: number;
            doctor_id: string;
            user_id: string;
            created_at: string;
            food_name: string;
            brand_name: string | null;
            notes: string | null;
        };
        Insert: {
            id?: number;
            doctor_id: string;
            user_id: string;
            created_at?: string;
            food_name: string;
            brand_name?: string | null;
            notes?: string | null;
        };
        Update: {
            id?: number;
            doctor_id?: string;
            user_id?: string;
            created_at?: string;
            food_name?: string;
            brand_name?: string | null;
            notes?: string | null;
        };
      };
      restricted_foods: {
        Row: {
            id: number;
            doctor_id: string;
            user_id: string;
            created_at: string;
            food_name: string;
            brand_name: string | null;
            reason: string;
        };
        Insert: {
            id?: number;
            doctor_id: string;
            user_id: string;
            created_at?: string;
            food_name: string;
            brand_name?: string | null;
            reason: string;
        };
        Update: {
            id?: number;
            doctor_id?: string;
            user_id?: string;
            created_at?: string;
            food_name?: string;
            brand_name?: string | null;
            reason?: string;
        };
      };
      grocery_list_items: {
          Row: {
              id: number;
              user_id: string;
              created_at: string;
              product_name: string;
              brand_name: string | null;
              nutrition_info: Json | null;
              health_stars: number | null;
              is_purchased: boolean;
          };
          Insert: {
              id?: number;
              user_id: string;
              created_at?: string;
              product_name: string;
              brand_name?: string | null;
              nutrition_info?: Json | null;
              health_stars?: number | null;
              is_purchased?: boolean;
          };
          Update: {
              id?: number;
              user_id?: string;
              created_at?: string;
              product_name?: string;
              brand_name?: string | null;
              nutrition_info?: Json | null;
              health_stars?: number | null;
              is_purchased?: boolean;
          };
      };
    };
    Views: {
      [_: string]: never;
    };
    Functions: {
      [_: string]: never;
    };
    CompositeTypes: {
      [_: string]: never;
    };
  };
}