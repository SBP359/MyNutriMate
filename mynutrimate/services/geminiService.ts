

import { GoogleGenAI, Type, Chat } from "@google/genai";
import type { UserProfile, FoodAnalysis, AnalysisResult, NutritionInfo, HealthInsight, DailyIntake, LabelAnalysis, MealSuggestion, SafeFood, RestrictedFood, Prescription, ParsedPrescriptionContent } from "./types";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY })


const micronutrientsSchema = {
    type: Type.OBJECT,
    nullable: true,
    properties: {
        ironMg: { type: Type.NUMBER, nullable: true },
        calciumMg: { type: Type.NUMBER, nullable: true },
        potassiumMg: { type: Type.NUMBER, nullable: true },
        vitaminAIU: { type: Type.NUMBER, nullable: true },
        vitaminCMg: { type: Type.NUMBER, nullable: true },
        vitaminDIU: { type: Type.NUMBER, nullable: true },
    },
};

const nutritionSchema = {
    type: Type.OBJECT,
    properties: {
        calories: { type: Type.NUMBER },
        proteinGrams: { type: Type.NUMBER },
        fatGrams: { type: Type.NUMBER },
        carbohydratesGrams: { type: Type.NUMBER },
        sugarGrams: { type: Type.NUMBER },
        sodiumMilligrams: { type: Type.NUMBER },
        micronutrients: micronutrientsSchema,
    },
    required: ['calories', 'proteinGrams', 'fatGrams', 'carbohydratesGrams', 'sugarGrams', 'sodiumMilligrams']
};

const safetyVerdictSchema = {
    type: Type.OBJECT,
    description: "A verdict on whether the food is safe for the user based on their profile.",
    properties: {
        isSafe: { type: Type.BOOLEAN, description: "True if the food is safe, false if it's risky." },
        reason: { type: Type.STRING, description: "A brief, one-sentence explanation for the verdict." }
    },
    required: ['isSafe', 'reason']
};


const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    type: { type: Type.STRING, enum: ['food', 'label'] },
    foodName: { type: Type.STRING, nullable: true },
    estimatedWeightGrams: { type: Type.NUMBER, nullable: true },
    productName: { type: Type.STRING, nullable: true },
    servingSizeGrams: { type: Type.NUMBER, nullable: true },
    healthStars: { type: Type.NUMBER, nullable: true },
    healthSummary: { type: Type.STRING, nullable: true },
    expiryDate: { type: Type.STRING, nullable: true, description: "Format YYYY-MM-DD" },
    dietaryWarnings: { type: Type.ARRAY, nullable: true, items: { type: Type.STRING } },
    nutrition: nutritionSchema,
    safetyVerdict: safetyVerdictSchema,
  },
  required: ['type', 'nutrition', 'safetyVerdict']
};

export async function analyzeFoodImage(base64Image: string, userProfile: UserProfile, safeFoods: SafeFood[], restrictedFoods: RestrictedFood[], languageName: string): Promise<AnalysisResult> {
  const imagePart = { inlineData: { mimeType: 'image/jpeg', data: base64Image } };
  const safeFoodsList = safeFoods.map(f => `${f.food_name} (${f.brand_name || 'any brand'})`).join(', ');
  const restrictedFoodsList = restrictedFoods.map(f => `${f.food_name} (${f.brand_name || 'any brand'}) - Reason: ${f.reason}`).join('; ');

  const userProfileContext = `The user is ${userProfile.age ?? 'N/A'} years old, with a '${userProfile.activityLevel}' activity level. Their specified medical history: "${userProfile.medicalHistory || 'None'}".`;
  
  const foodSafetyContext = `
    - Doctor-Approved Safe Foods: [${safeFoodsList || 'None'}].
    - Doctor-Restricted (MUST NOT EAT) Foods: [${restrictedFoodsList || 'None'}].
  `;

  const prompt = `
    ${userProfileContext}
    ${foodSafetyContext}
    Analyze the image which is either a prepared food meal or a nutrition label. Determine the 'type' first.

    1.  **SPOILED/EXPIRED FOOD:** If food looks spoiled, set nutritional values to 0 and add a 'spoiled' warning. If a label shows an expiry date in the past, extract data normally but provide the correct 'expiryDate'.

    2.  **TYPE-SPECIFIC ANALYSIS (CRITICAL):**
        - If the image is a **'food'** meal:
          - Provide 'foodName' and 'estimatedWeightGrams'.
          - Set 'productName', 'servingSizeGrams', 'healthStars', 'healthSummary', 'expiryDate' to null.
        - If the image is a **'label'**:
          - Provide 'productName', 'servingSizeGrams', and a brief 'healthSummary'.
          - **Calculate 'healthStars' (a number from 1.0 to 5.0).** Base this score on the nutritional data. High stars for low sugar/sodium and high protein/fiber. Low stars for high sugar/sodium. **You MUST provide a numerical value for healthStars.** Estimate if necessary, do not return null.
          - Set 'foodName' and 'estimatedWeightGrams' to null.

    3.  **NUTRITION:** For both types, provide a detailed nutritional breakdown for all fields in the nutrition schema. If a value is not present, estimate it or return 0. Do not return null for top-level nutrition fields.

    4.  **SAFETY VERDICT (CRITICAL):** Based on the user's profile and doctor's lists, provide a 'safetyVerdict'.
        - **MUST BE UNSAFE**: If the food is on the "Doctor-Restricted" list, 'isSafe' MUST be false. The 'reason' must state it's doctor-restricted and mention why (e.g., "Risky because it is on your doctor's restricted list due to high sodium.").
        - Otherwise, 'isSafe' is true ONLY if the item does NOT conflict with their medical history and is generally healthy.
        - 'reason' must clearly explain the verdict in one sentence.
    
    5.  **DIETARY WARNINGS:** Separately, list allergens like "Contains meat", "Contains dairy", "Contains egg". Null if none.
    
    Respond ONLY with a valid JSON object in ${languageName}.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [imagePart, { text: prompt }] },
    config: {
      responseMimeType: "application/json",
      responseSchema: analysisSchema,
      systemInstruction: `You are a world-class nutritionist. Adhere strictly to the JSON schema. All text must be in ${languageName}.`
    },
  });
  
  try {
    return JSON.parse(response.text.trim()) as AnalysisResult;
  } catch (e) {
    console.error("Failed to parse AI response:", response.text, e);
    throw new Error('The AI returned an invalid JSON response. Please try again.');
  }
}

export async function refineImageAnalysis(
    base64Image: string, 
    userProfile: UserProfile,
    previousAnalysis: AnalysisResult,
    customPrompt: string,
    safeFoods: SafeFood[],
    restrictedFoods: RestrictedFood[],
    languageName: string
): Promise<AnalysisResult> {
  const imagePart = { inlineData: { mimeType: 'image/jpeg', data: base64Image } };
  const safeFoodsList = safeFoods.map(f => `${f.food_name} (${f.brand_name || 'any brand'})`).join(', ');
  const restrictedFoodsList = restrictedFoods.map(f => `${f.food_name} (${f.brand_name || 'any brand'}) - Reason: ${f.reason}`).join('; ');

  const prompt = `Refine the previous analysis based on new info.
  User Profile: Age ${userProfile.age ?? 'N/A'}, medical history: "${userProfile.medicalHistory || 'None'}".
  Doctor-Approved Safe Foods: [${safeFoodsList || 'None'}].
  Doctor-Restricted (MUST NOT EAT) Foods: [${restrictedFoodsList || 'None'}].
  Previous JSON: ${JSON.stringify(previousAnalysis)}
  User says: '${customPrompt}'
  
  Recalculate the entire analysis based on the user's feedback. If they say 'I only ate half', halve all nutritional values. If they correct the food name, update it and recalculate everything, including the safety verdict (which must check the restricted list again).
  Respond ONLY with the completely updated JSON object. All text in ${languageName}.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [imagePart, { text: prompt }] },
    config: {
      responseMimeType: "application/json",
      responseSchema: analysisSchema,
      systemInstruction: `You are an expert nutritionist. Update analysis based on user feedback. Respond only with the updated JSON. All text in ${languageName}.`
    },
  });

  try {
    return JSON.parse(response.text.trim()) as AnalysisResult;
  } catch (e) {
    console.error("Failed to parse refined AI response:", response.text, e);
    throw new Error('The AI returned an invalid JSON response for the refinement.');
  }
}

const prescriptionSchema = {
    type: Type.OBJECT,
    properties: {
        diagnoses: {
            type: Type.ARRAY,
            description: "List of medical diagnoses found.",
            items: { type: Type.STRING }
        },
        medications: {
            type: Type.ARRAY,
            description: "List of medications found with their dosages.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "Name of the medication." },
                    dosage: { type: Type.STRING, description: "Dosage instructions (e.g., '500mg, twice a day')." }
                },
                required: ['name', 'dosage']
            }
        }
    },
    required: ['diagnoses', 'medications']
};

export async function analyzePrescription(base64Image: string | null, text: string | null, languageName: string) {
    const textPart = { text: `Extract all medical diagnoses and all medications (with their full dosage instructions) from the following prescription. If no diagnoses or medications are found, return empty arrays for the respective keys. The prescription content is: \n\n${text || ''}`};
    
    const parts: ({text: string} | {inlineData: {mimeType: string, data: string}})[] = [textPart];
    if(base64Image) {
        parts.unshift({ inlineData: { mimeType: 'image/jpeg', data: base64Image.split(',')[1] } });
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts },
        config: {
            responseMimeType: "application/json",
            responseSchema: prescriptionSchema,
            systemInstruction: `You are a medical data extraction specialist. Your task is to accurately extract diagnoses and medications from prescriptions and return them in the specified JSON format. All text must be in ${languageName}.`
        }
    });
    
    try {
        return JSON.parse(response.text.trim());
    } catch(e) {
        console.error("Failed to parse prescription response:", response.text, e);
        throw new Error("Could not understand the prescription. Please try a clearer image or text.");
    }
}

const healthInsightSchema = {
    type: Type.OBJECT,
    properties: {
        emoji: { type: Type.STRING },
        title: { type: Type.STRING },
        message: { type: Type.STRING }
    },
    required: ['emoji', 'title', 'message']
};

export async function generateHealthInsight(todaysIntake: DailyIntake, userProfile: UserProfile, languageName: string): Promise<HealthInsight> {
    const prompt = `A user (age ${userProfile.age ?? 'N/A'}) has a daily calorie goal of ${userProfile.dailyCalorieGoal} kcal and has consumed ${todaysIntake.calories} kcal so far. Their medical history is: "${userProfile.medicalHistory || 'None'}". Provide a single, brief, encouraging, and actionable health insight as a JSON object, relevant to their progress and medical history. All text in ${languageName}.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: healthInsightSchema,
            systemInstruction: `You are a friendly health coach. Provide short, positive health tips. Respond only with JSON. All text must be in ${languageName}.`
        },
    });

    try {
        return JSON.parse(response.text.trim()) as HealthInsight;
    } catch (e) {
        console.error("Failed to parse health insight response:", e);
        throw new Error('AI returned an invalid JSON for health insight.');
    }
}

const mealSuggestionSchema = {
    type: Type.OBJECT,
    properties: {
        mealName: { type: Type.STRING },
        description: { type: Type.STRING },
        reason: { type: Type.STRING }
    },
    required: ['mealName', 'description', 'reason']
};

export async function generateMealSuggestion(todaysIntake: DailyIntake, userProfile: UserProfile, languageName: string): Promise<MealSuggestion> {
    const prompt = `A user (age ${userProfile.age ?? 'N/A'}) needs a meal suggestion.
    Daily goals: Calories: ${userProfile.dailyCalorieGoal} kcal, Protein: ${userProfile.dailyProteinGoal}g.
    Today's intake: Calories: ${todaysIntake.calories} kcal, Protein: ${todaysIntake.proteinGrams}g.
    Medical history: "${userProfile.medicalHistory || 'None'}".
    Suggest a single, healthy meal appropriate for them, considering their progress and health profile. Prefer common Indian dishes. Provide the response as a JSON object. All text in ${languageName}.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: mealSuggestionSchema,
            systemInstruction: `You are a nutritionist suggesting simple, healthy meals. Respond only with JSON. All text in ${languageName}.`
        },
    });

    try {
        return JSON.parse(response.text.trim()) as MealSuggestion;
    } catch (e) {
        console.error("Failed to parse meal suggestion response:", e);
        throw new Error('AI returned an invalid JSON for meal suggestion.');
    }
}

export function startHealthChat(
    userProfile: UserProfile,
    history: FoodAnalysis[],
    prescriptions: Prescription[],
    languageName: string
): Chat {
    const historySummary = history.length > 0
        ? history.slice(0, 5).map(h => `${h.foodName} (${h.nutrition.calories.toFixed(0)} kcal)`).join(', ')
        : 'None logged recently.';

    const prescriptionSummary = prescriptions.length > 0
        ? prescriptions.flatMap(p => (p.parsed_content)?.medications.map(m => m.name) ?? []).join(', ')
        : 'None.';


    const systemInstruction = `You are MyNutriMate, a friendly and knowledgeable AI health assistant.
Your goal is to provide helpful, general health and nutrition advice based on the user's profile and data.

USER DATA:
- Profile: Age ${userProfile.age ?? 'N/A'}, Gender: ${userProfile.gender}, Height: ${userProfile.heightCm}cm, Weight: ${userProfile.weightKg}kg, Activity: ${userProfile.activityLevel}.
- Medical History: "${userProfile.medicalHistory || 'None'}".
- Recent Meals Logged: ${historySummary}
- Known Medications: ${prescriptionSummary}

RULES:
- Use simple Markdown for formatting. Use \`**bold text**\` for emphasis, \`*italic text*\` for italics, and create lists by starting lines with \`-\`, \`*\`, or \`1.\`.
- You are NOT a doctor. For any medical diagnosis, prescription changes, or serious health concerns, you MUST advise the user to consult their real-world doctor.
- Do not provide information outside the scope of health, fitness, and nutrition.
- Keep your answers concise, encouraging, and easy to understand.
- Do not mention that you are a language model.
- All text must be in ${languageName}.
`;

    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: systemInstruction,
        }
    });

    return chat;
}

const medicineAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        medicineName: { type: Type.STRING, description: "The name of the medicine. If unidentifiable from the image, this MUST be the string 'UNIDENTIFIABLE'." },
        description: { type: Type.STRING, description: "A brief description of the medicine's use. If unidentifiable, this should be an empty string." },
        safetyVerdict: {
            ...safetyVerdictSchema,
            description: "A verdict on whether the medicine is safe for the user, based on their profile. This is not medical advice."
        },
        sideEffects: {
            type: Type.ARRAY,
            description: "A list of common potential side effects. If unidentifiable, this should be an empty array.",
            items: { type: Type.STRING }
        }
    },
    required: ['medicineName', 'description', 'safetyVerdict', 'sideEffects']
};

export async function analyzeMedicineImage(
    base64Image: string,
    userProfile: UserProfile,
    prescriptions: Prescription[],
    languageName: string
): Promise<MedicineAnalysis> {
    const imagePart = { inlineData: { mimeType: 'image/jpeg', data: base64Image } };
    const prescriptionSummary = prescriptions.length > 0
        ? prescriptions.flatMap(p => (p.parsed_content)?.medications.map(m => m.name) ?? []).join(', ')
        : 'None.';

    const userProfileContext = `Analyze the provided image of a medicine for a user with the following profile.
- Age: ${userProfile.age ?? 'N/A'}
- Medical History/Conditions: "${userProfile.medicalHistory || 'None'}"
- Current known medications: "${prescriptionSummary}"`;

    const instructions = `
    1.  **Identify the Medicine**: From the image, identify the medicine's name. If you cannot identify it, set 'medicineName' to 'UNIDENTIFIABLE' and all other fields to their empty equivalents (e.g., empty string, empty array, safe verdict with a generic disclaimer).
    2.  **Describe Use Case**: Briefly explain the primary use case of this medicine (e.g., "Primarily used to treat epilepsy and bipolar disorder.").
    3.  **List Side Effects**: Provide a list of 3-5 common side effects.
    4.  **Provide Safety Verdict (CRITICAL)**: This is the most important step. Analyze the medicine's use case against the user's medical history.
        - **Rule A (Mismatch):** If the medicine's primary use case DOES NOT match any of the user's known 'Medical History/Conditions', set 'isSafe' to **false**. The 'reason' MUST state this mismatch clearly, for example: "This medication is for epilepsy, which does not match your profile's listed condition of diabetes. Please verify with your doctor that this is the correct medication for you."
        - **Rule B (Contraindication):** If the use case matches OR is for a general purpose, check for contraindications. If a clear risk is found between the medicine and a condition in the user's history (e.g., a drug known to affect kidneys and user has kidney disease), set 'isSafe' to **false**. The 'reason' MUST state the specific risk.
        - **Rule C (Likely Safe):** If the use case matches the user's profile and there are no obvious contraindications, set 'isSafe' to **true**. The 'reason' MUST be a disclaimer: "This medication appears to align with your profile, but this is not medical advice. Always consult your doctor before taking any medication."
    5.  **Disclaimer**: Your entire analysis is for informational purposes and is not a substitute for professional medical advice.

    Respond ONLY with a valid JSON object in ${languageName}.`;
    
    const prompt = `${userProfileContext}\n\n${instructions}`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, { text: prompt }] },
        config: {
            responseMimeType: "application/json",
            responseSchema: medicineAnalysisSchema,
            systemInstruction: `You are a helpful AI assistant providing preliminary information about medications. You are NOT a doctor. Your analysis MUST NOT be considered medical advice. Always include disclaimers and urge users to consult a healthcare professional. All text must be in ${languageName}.`
        },
    });

    try {
        return JSON.parse(response.text.trim()) as MedicineAnalysis;
    } catch (e) {
        console.error("Failed to parse medicine analysis response:", response.text, e);
        throw new Error('The AI returned an invalid response. Please try with a clearer image.');
    }
}