

import type { UserProfile, ActivityLevel, DailyIntake } from './types';

export const calculateAge = (dob: string | null): number | null => {
    if (!dob || !/^\d{4}-\d{2}-\d{2}$/.test(dob)) return null;
    try {
        const birthDate = new Date(dob);
        if (isNaN(birthDate.getTime())) return null;
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    } catch {
        return null;
    }
};

export const getFormattedAgeString = (dob: string | null, t?: (key: string, options?: any) => string): string => {
    const age = calculateAge(dob);
    if (age === null) return t ? t('na') : "N/A";

    if (t) {
        return t('ageYearsOld', { age: age });
    }
    return `${age} years old`;
};


export const getBmiStatus = (bmi: number | null): { status: string; colorClass: string; isRisk: boolean } | null => {
    if (bmi === null) return null;
    
    if (bmi < 18.5) return { status: 'bmiUnderweight', colorClass: 'text-blue-500 dark:text-blue-400', isRisk: true };
    if (bmi < 25) return { status: 'bmiNormal', colorClass: 'text-green-500 dark:text-green-400', isRisk: false };
    if (bmi < 30) return { status: 'bmiOverweight', colorClass: 'text-yellow-500 dark:text-yellow-400', isRisk: true };
    return { status: 'bmiObesity', colorClass: 'text-red-500 dark:text-red-400', isRisk: true };
};

export const calculateBmi = (weightKg: number | null, heightCm: number | null): number | null => {
    if (!weightKg || !heightCm || heightCm === 0) return null;
    const heightM = heightCm / 100;
    return weightKg / (heightM * heightM);
};

export const calculateNutritionalGoals = (profile: UserProfile): DailyIntake | null => {
    const age = calculateAge(profile.dob);
    const { weightKg, heightCm, gender, activityLevel } = profile;

    if (!weightKg || !heightCm || !age || !gender || !activityLevel) {
        return null;
    }

    // Mifflin-St Jeor Equation for BMR
    const bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) + (gender === 'male' ? 5 : -161);

    const activityMultipliers: Record<ActivityLevel, number> = {
        sedentary: 1.2,
        lightly_active: 1.375,
        active: 1.55,
        very_active: 1.725
    };

    const tdee = bmr * activityMultipliers[activityLevel];

    // Standard macronutrient distribution
    const calories = Math.round(tdee / 10) * 10;
    const proteinGrams = Math.round((calories * 0.20) / 4); // 20% from protein
    const carbohydratesGrams = Math.round((calories * 0.50) / 4); // 50% from carbs
    const fatGrams = Math.round((calories * 0.30) / 9); // 30% from fat

    // General guidelines for sugar and sodium for elderly
    const sugarGrams = 25; // American Heart Association recommendation
    const sodiumMilligrams = 1500; // American Heart Association recommendation

    return {
        calories,
        proteinGrams,
        carbohydratesGrams,
        fatGrams,
        sugarGrams,
        sodiumMilligrams,
    };
};

export const calculateHealthStars = (averageCalories: number, calorieGoal: number | null): number | null => {
    if (calorieGoal === null || calorieGoal === 0) return 3; // Default to neutral if no goal is set
    const ratio = averageCalories / calorieGoal;
    
    if (ratio > 1.5) return 1;        // Very high intake
    if (ratio > 1.25) return 2;       // High intake
    if (ratio < 0.7) return 3;        // Low intake
    if (ratio > 1.1) return 4;        // Slightly high intake
    if (ratio >= 0.8) return 5;       // Ideal range
    return 4;                         // Slightly low but acceptable
};
