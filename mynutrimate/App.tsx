

import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { Session } from '@supabase/supabase-js';
import { analyzeFoodImage, refineImageAnalysis, generateHealthInsight, generateMealSuggestion, analyzePrescription, startHealthChat } from './services/geminiService';
import type { AnalysisResult, UserProfile, View, Theme, FoodAnalysis, LabelAnalysis, NutritionInfo, DailyIntake, HealthInsight, DoctorProfile, Database, MealSuggestion, SafeFood, Prescription, RestrictedFood, DoctorConnection, GroceryListItem, SafetyVerdict, Json, ParsedPrescriptionContent } from './types';
import type { Chat } from '@google/genai';
import { ImageUploader } from './components/ImageUploader';
import { NutritionDisplay } from './components/NutritionDisplay';
import { LabelAnalysisDisplay } from './components/LabelAnalysisDisplay';
import { Spinner } from './components/Spinner';
import { AppLogo, AlertTriangleIcon, UserIcon, CameraIcon, BookOpenIcon, SunIcon, MoonIcon, LogOutIcon, HomeIcon, UsersIcon, FileTextIcon, ShoppingCartIcon, FolderHeartIcon, FooterBanner, GlobeIcon, ChevronDownIcon, CheckIcon } from './components/icons';
import { HistoryView } from './components/HistoryView';
import { UserProfilePage } from './components/UserProfilePage';
import { isSupabaseConfigured, supabase } from './services/supabaseClient';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { DoctorDashboard } from './components/DoctorDashboard';
import { PrescriptionAnalysis } from './components/PrescriptionAnalysis';
import { calculateNutritionalGoals, calculateHealthStars } from './utils/helpers';
import { getMyDoctorConnections } from './services/doctorService';
import { DoctorProfilePage } from './components/DoctorProfilePage';
import { ChatBot } from './components/ChatBot';
import { GroceryList } from './components/GroceryList';
import { MedicalFiles } from './components/MedicalFiles';
import { useI18n } from './i18n';


function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key “${key}”:`, error);
      return initialValue;
    }
  });

  const setValue = useCallback<React.Dispatch<React.SetStateAction<T>>>((value) => {
    try {
      setStoredValue(currentStoredValue => {
        const valueToStore = value instanceof Function ? value(currentStoredValue) : value;
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        return valueToStore;
      });
    } catch (error) {
      console.error(`Error setting localStorage key “${key}”:`, error);
    }
  }, [key]);

  return [storedValue, setValue];
}

const UserMenu: React.FC<{
    onLogout: () => void;
    onToggleTheme: () => void;
    theme: Theme;
    setView: (view: View) => void;
    isDoctor: boolean;
}> = ({ onLogout, onToggleTheme, theme, setView, isDoctor }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const { language, setLanguage, t } = useI18n();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuRef]);
    
    const langOptions: { code: 'en' | 'hi' | 'ml'; label: string }[] = [
        { code: 'en', label: 'English' },
        { code: 'hi', label: 'हिन्दी' },
        { code: 'ml', label: 'മലയാളം' },
    ];

    return (
        <div className="relative" ref={menuRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-600 flex items-center gap-2">
                <UserIcon className="h-6 w-6" />
                <ChevronDownIcon className="h-4 w-4 text-ui-text-secondary" />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-ui-card dark:bg-slate-700 rounded-md shadow-lg z-20 border border-ui-border dark:border-slate-600 animate-scale-in origin-top-right">
                    <div className="p-2">
                         {!isDoctor && (
                            <button onClick={() => { setView('profile'); setIsOpen(false); }} className="w-full flex items-center gap-3 p-2 text-sm rounded-md hover:bg-slate-100 dark:hover:bg-slate-600">
                               <UserIcon className="h-5 w-5 text-ui-text-secondary" />
                               <span>{t('navProfile')}</span>
                           </button>
                         )}
                        <button onClick={onToggleTheme} className="w-full flex items-center justify-between p-2 text-sm rounded-md hover:bg-slate-100 dark:hover:bg-slate-600">
                           <span className="flex items-center gap-3">
                             {theme === 'light' ? <MoonIcon className="h-5 w-5 text-ui-text-secondary"/> : <SunIcon className="h-5 w-5 text-ui-text-secondary"/>}
                             <span>Theme</span>
                           </span>
                           <span className="capitalize text-xs font-semibold text-ui-text-secondary">{theme}</span>
                        </button>
                    </div>
                    <div className="border-t border-ui-border dark:border-slate-600 p-2">
                        <p className="text-xs text-ui-text-secondary px-2 mb-1 font-semibold">Language</p>
                        {langOptions.map(lang => (
                             <button key={lang.code} onClick={() => { setLanguage(lang.code); setIsOpen(false); }} className={`w-full flex items-center justify-between p-2 text-sm rounded-md hover:bg-slate-100 dark:hover:bg-slate-600 ${language === lang.code ? 'font-bold text-brand-primary' : ''}`}>
                               <span>{lang.label}</span>
                               {language === lang.code && <CheckIcon className="h-4 w-4 text-brand-primary" />}
                           </button>
                        ))}
                    </div>
                    <div className="border-t border-ui-border dark:border-slate-600 p-2">
                         <button onClick={onLogout} className="w-full flex items-center gap-3 p-2 text-sm rounded-md text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40">
                            <LogOutIcon className="h-5 w-5"/>
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const Sidebar: React.FC<{ navItems: any[]; activeView: View; setView: (v: View) => void }> = ({ navItems, activeView, setView }) => {
    return (
        <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:w-64 bg-ui-card dark:bg-slate-800 border-r border-ui-border dark:border-slate-700 z-40">
            <div className="flex items-center justify-center h-16 border-b border-ui-border dark:border-slate-700 flex-shrink-0 px-4">
                <AppLogo className="h-9" />
            </div>
            <nav className="flex-1 px-4 py-4 space-y-2">
                {navItems.map(item => (
                    <button
                        key={item.view}
                        onClick={() => setView(item.view)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                            activeView === item.view 
                                ? 'bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20' 
                                : 'text-ui-text-secondary hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                    >
                        {React.cloneElement(item.icon, { className: 'h-6 w-6' })}
                        <span>{item.label}</span>
                    </button>
                ))}
            </nav>
        </aside>
    );
};

const BottomNav: React.FC<{ navItems: any[]; activeView: View; setView: (v: View) => void }> = ({ navItems, activeView, setView }) => {
    return (
        <nav className="md:hidden fixed bottom-0 inset-x-0 bg-ui-card dark:bg-slate-800 border-t border-ui-border dark:border-slate-700 p-2 z-40">
            <div className="flex justify-around items-center">
                {navItems.map(item => (
                    <button
                        key={item.view}
                        onClick={() => setView(item.view)}
                        className={`flex flex-col items-center justify-center p-1 rounded-md w-16 h-14 transition-colors ${
                            activeView === item.view ? 'text-brand-primary' : 'text-ui-text-secondary'
                        }`}
                        aria-label={item.label}
                    >
                        {React.cloneElement(item.icon, { className: 'h-6 w-6' })}
                        <span className="text-[10px] font-medium mt-1 text-center">{item.label}</span>
                    </button>
                ))}
            </div>
        </nav>
    );
};

export const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [activeView, setActiveView] = useLocalStorage<View>('active-view', 'dashboard');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);
  const [isDoctor, setIsDoctor] = useState<boolean>(false);
  const [isProfileComplete, setIsProfileComplete] = useState<boolean>(false);
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);
  
  const [history, setHistory] = useState<FoodAnalysis[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [safeFoods, setSafeFoods] = useState<SafeFood[]>([]);
  const [restrictedFoods, setRestrictedFoods] = useState<RestrictedFood[]>([]);
  const [doctorConnections, setDoctorConnections] = useState<DoctorConnection[]>([]);
  
  const [theme, setTheme] = useLocalStorage<Theme>('theme', 'light');

  const [todaysIntake, setTodaysIntake] = useState<DailyIntake>({ calories: 0, proteinGrams: 0, carbohydratesGrams: 0, fatGrams: 0, sugarGrams: 0, sodiumMilligrams: 0 });
  const [healthInsight, setHealthInsight] = useState<HealthInsight | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState<boolean>(false);
  const [mealSuggestion, setMealSuggestion] = useState<MealSuggestion | null>(null);
  const [isSuggestingMeal, setIsSuggestingMeal] = useState(false);
  const [lastInsightCalories, setLastInsightCalories] = useState<number>(-1);
  const [healthChat, setHealthChat] = useState<Chat | null>(null);
  
  const { t, languageName } = useI18n();


  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-ui-bg dark:bg-slate-900">
        <div className="max-w-md bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-500 p-8 rounded-lg">
          <AlertTriangleIcon className="h-12 w-12 text-red-500 dark:text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-800 dark:text-red-200 mb-2">{t('configNeeded')}</h1>
          <p className="text-red-700 dark:text-red-300">
            {t('supabaseWarning')}
          </p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
       if (_event === 'SIGNED_OUT') {
        setIsProfileComplete(false);
        setProfile(null);
        setDoctorProfile(null);
        setIsDoctor(false);
        setActiveView('dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, [setActiveView]);
  
  const fetchData = useCallback(async () => {
    if (!session) {
        setIsLoadingData(false);
        return;
    };
    
    setError(null);
    setIsLoadingData(true);
    
    try {
        // Check if the user is a doctor first
        let { data: doctorData, error: doctorError } = await supabase
            .from('doctors')
            .select('id, username, full_name, phone_number, medical_registration_id, specialization, doctor_code')
            .eq('id', session.user.id)
            .maybeSingle();
            
        if (doctorError) throw doctorError;

        if (doctorData) {
            const mappedDoctorProfile: DoctorProfile = {
              id: doctorData.id,
              username: doctorData.username,
              fullName: doctorData.full_name,
              phoneNumber: doctorData.phone_number,
              medicalRegistrationId: doctorData.medical_registration_id,
              specialization: doctorData.specialization,
              doctorCode: doctorData.doctor_code,
            };
            setDoctorProfile(mappedDoctorProfile);
            setIsDoctor(true);
            setActiveView('doctor_clients');
            setProfile(null); // Doctors don't have a patient profile
            setIsLoadingData(false);
            return;
        }

        // If not a doctor, proceed as a patient
        setIsDoctor(false);
        let { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

        if (profileError) {
            throw profileError;
        }

        if (!profileData) {
            // This can happen if the profile insertion failed after signup.
            // We'll create a default profile and send the user to the setup page.
            const defaultProfile: UserProfile = {
                id: session.user.id,
                username: session.user.user_metadata.username || null,
                fullName: session.user.user_metadata.full_name || null,
                phoneNumber: session.user.user_metadata.phone_number || null,
                gender: 'other',
                dob: null,
                age: null,
                heightCm: null,
                weightKg: null,
                activityLevel: 'sedentary',
                medicalHistory: null,
                healthStarRating: null,
                dailyCalorieGoal: null,
                dailyProteinGoal: null,
                dailyCarbohydratesGoal: null,
                dailyFatGoal: null,
                dailySugarGoal: null,
                dailySodiumGoal: null,
                dailyHydrationGoalMl: null,
            };
            setProfile(defaultProfile);
            setIsProfileComplete(false);
            setActiveView('profile');
            setIsLoadingData(false);
            return;
        }
        
        const mappedProfile: UserProfile = {
            id: profileData.id,
            username: profileData.username,
            fullName: profileData.full_name,
            phoneNumber: profileData.phone_number,
            gender: profileData.gender || 'other',
            dob: profileData.dob,
            age: null, // this is calculated dynamically
            heightCm: profileData.height_cm,
            weightKg: profileData.weight_kg,
            activityLevel: profileData.activity_level || 'sedentary',
            medicalHistory: profileData.medical_history,
            updated_at: profileData.updated_at,
            healthStarRating: profileData.health_star_rating,
            dailyCalorieGoal: profileData.daily_calorie_goal,
            dailyProteinGoal: profileData.daily_protein_goal,
            dailyCarbohydratesGoal: profileData.daily_carbohydrates_goal,
            dailyFatGoal: profileData.daily_fat_goal,
            dailySugarGoal: profileData.daily_sugar_goal,
            dailySodiumGoal: profileData.daily_sodium_goal,
            dailyHydrationGoalMl: profileData.daily_hydration_goal_ml,
        };

        const isComplete = !!(mappedProfile.dob && mappedProfile.gender && mappedProfile.heightCm && mappedProfile.weightKg && mappedProfile.activityLevel);
        setIsProfileComplete(isComplete);
        
        if (!isComplete) {
            setActiveView('profile');
        }

        if (!mappedProfile.dailyCalorieGoal) {
            const goals = calculateNutritionalGoals(mappedProfile);
            if (goals) {
                mappedProfile.dailyCalorieGoal = goals.calories;
                mappedProfile.dailyProteinGoal = goals.proteinGrams;
                mappedProfile.dailyCarbohydratesGoal = goals.carbohydratesGrams;
                mappedProfile.dailyFatGoal = goals.fatGrams;
                mappedProfile.dailySugarGoal = goals.sugarGrams;
                mappedProfile.dailySodiumGoal = goals.sodiumMilligrams;
            }
        }
        
        setProfile(mappedProfile);
        
        // Fetch all user data
        const historyRes = await supabase.from('food_history').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false });
        const prescriptionRes = await supabase.from('prescriptions').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false });
        const connectionsRes = await getMyDoctorConnections(session.user.id);
        
        if (historyRes.error) throw historyRes.error;
        if (prescriptionRes.error) throw prescriptionRes.error;
        if (connectionsRes.error) throw new Error(connectionsRes.error);

        const mappedHistory = (historyRes.data || [])
            .filter(item => item.nutrition)
            .map((item): FoodAnalysis => ({
                id: item.id,
                user_id: item.user_id,
                date: item.created_at,
                foodName: item.food_name || 'Unnamed Food',
                estimatedWeightGrams: item.estimated_weight_grams || 0,
                nutrition: item.nutrition as NutritionInfo,
                type: 'food',
                dietaryWarnings: item.dietary_warnings as string[] | null,
                safetyVerdict: item.safety_verdict ? (item.safety_verdict as SafetyVerdict) : undefined,
            }));
        setHistory(mappedHistory);
        setPrescriptions(
            (prescriptionRes.data || []).map((p): Prescription => ({
                id: p.id,
                user_id: p.user_id,
                created_at: p.created_at,
                raw_text: p.raw_text,
                image_url: p.image_url,
                parsed_content: p.parsed_content as ParsedPrescriptionContent | null,
            }))
        );
        setDoctorConnections(connectionsRes.data || []);
        
        if (connectionsRes.data && connectionsRes.data.length > 0) {
            const { data: safeFoodsData } = await supabase.from('safe_foods').select('*').eq('user_id', session.user.id);
            setSafeFoods(safeFoodsData as SafeFood[]);

            const { data: restrictedFoodsData } = await supabase.from('restricted_foods').select('*').eq('user_id', session.user.id);
            setRestrictedFoods(restrictedFoodsData as RestrictedFood[]);
        }


    } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Failed to fetch your data.');
    } finally {
        setIsLoadingData(false);
    }
  }, [session, setActiveView]);

  useEffect(() => {
    if (session) {
      fetchData();
    } else {
      setIsLoadingData(false);
    }
  }, [session, fetchData]);
  
  useEffect(() => {
    if (profile && isProfileComplete && !isDoctor) {
        const chatSession = startHealthChat(profile, history, prescriptions, languageName);
        setHealthChat(chatSession);
    } else {
        setHealthChat(null);
    }
  }, [profile, isProfileComplete, isDoctor, history, prescriptions, languageName]);

  useEffect(() => {
    const todayStr = new Date().toDateString();
    const todaysHistory = history.filter(item => new Date(item.date).toDateString() === todayStr);
    const currentIntake: DailyIntake = todaysHistory.reduce((acc, item) => {
        acc.calories += item.nutrition.calories;
        acc.proteinGrams += item.nutrition.proteinGrams;
        acc.carbohydratesGrams += item.nutrition.carbohydratesGrams;
        acc.fatGrams += item.nutrition.fatGrams;
        acc.sugarGrams += item.nutrition.sugarGrams;
        acc.sodiumMilligrams += item.nutrition.sodiumMilligrams;
        return acc;
    }, { calories: 0, proteinGrams: 0, carbohydratesGrams: 0, fatGrams: 0, sugarGrams: 0, sodiumMilligrams: 0 });
    setTodaysIntake(currentIntake);
  }, [history]);

  useEffect(() => {
      if (!profile || !isProfileComplete || !session || !profile.dailyCalorieGoal) return;
      if (todaysIntake.calories > 0 && Math.abs(todaysIntake.calories - lastInsightCalories) > 50) {
          setIsLoadingInsight(true);
          setLastInsightCalories(todaysIntake.calories);
          generateHealthInsight(todaysIntake, profile, languageName)
              .then(setHealthInsight).catch(e => console.error("Insight error", e))
              .finally(() => setIsLoadingInsight(false));
      } else if (todaysIntake.calories === 0) {
          setHealthInsight(null);
          setLastInsightCalories(-1);
      }
  }, [profile, isProfileComplete, todaysIntake, session, lastInsightCalories, languageName]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));

  const handleImageAnalysis = useCallback(async (file: File) => {
    if (!profile) return setError('User profile not loaded.');
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    setImagePreview(URL.createObjectURL(file));

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const currentBase64Image = (reader.result as string).split(',')[1];
      setBase64Image(currentBase64Image); 
      if (currentBase64Image) {
        try {
          const result = await analyzeFoodImage(currentBase64Image, profile, safeFoods, restrictedFoods, languageName);
          const commonData = { id: -1, date: new Date().toISOString(), user_id: profile.id };
          const analysisWithMetadata: AnalysisResult = { ...commonData, ...result };
          setAnalysis(analysisWithMetadata);
        } catch (err) {
          setError(err instanceof Error ? `Failed to analyze image. ${err.message}`: 'An unknown error occurred.');
        } finally {
          setIsLoading(false);
        }
      }
    };
  }, [profile, safeFoods, restrictedFoods, languageName]);
  
  const handleGroceryScan = useCallback(async (file: File) => {
    await handleImageAnalysis(file);
    setActiveView('grocery');
  }, [handleImageAnalysis, setActiveView]);


  const handleRefineAnalysis = async (customPrompt: string) => {
    if (!base64Image || !profile || !analysis) return setError('Cannot refine analysis.');
    setIsLoading(true);
    setError(null);
    try {
      const result = await refineImageAnalysis(base64Image, profile, analysis, customPrompt, safeFoods, restrictedFoods, languageName);
      const analysisWithMetadata: AnalysisResult = { ...analysis, ...result, date: new Date().toISOString() };
      setAnalysis(analysisWithMetadata);
    } catch (err) {
      setError(err instanceof Error ? `Refinement failed. ${err.message}`: 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setAnalysis(null);
    setImagePreview(null);
    setError(null);
    setIsLoading(false);
    setBase64Image(null);
    setActiveView(isDoctor ? 'doctor_clients' : 'dashboard');
  };
  
  const handleAddToDiary = async () => {
    if (analysis && session && profile) {
      setIsLoading(true);
      setError(null);
      
      const newHistoryItem = {
        user_id: session.user.id,
        nutrition: analysis.nutrition,
        food_name: analysis.type === 'food' ? analysis.foodName : analysis.productName,
        estimated_weight_grams: analysis.type === 'food' ? analysis.estimatedWeightGrams : analysis.servingSizeGrams,
        dietary_warnings: analysis.dietaryWarnings,
        safety_verdict: analysis.safetyVerdict ?? null,
      };

      const { error } = await supabase.from('food_history').insert([newHistoryItem]);
      if (error) setError(`Failed to save to diary: ${error.message}`);
      else {
        await fetchData();
        handleReset();
      }
      setIsLoading(false);
    }
  };

  const handleAddToGroceryList = async (item: Omit<GroceryListItem, 'id' | 'user_id' | 'created_at' | 'is_purchased'>) => {
    if (analysis && session && profile) {
      setIsLoading(true);
      setError(null);
      
      const newGroceryItem = {
        user_id: session.user.id,
        product_name: item.product_name,
        brand_name: item.brand_name,
        nutrition_info: item.nutrition_info,
        health_stars: item.health_stars
      };

      const { error } = await supabase.from('grocery_list_items').insert([newGroceryItem]);
      if (error) {
        setError(`Failed to save to grocery list: ${error.message}`);
        alert(`Error: ${error.message}`);
      } else {
        alert('Item added to your grocery list!');
        handleReset();
      }
      setIsLoading(false);
    }
  };


  const handleProfileSave = async (newProfile: UserProfile, oldProfile: UserProfile) => {
    if (!session) return;
    setIsSavingProfile(true);
    setError(null);

    const goals = calculateNutritionalGoals(newProfile);
    
    const updatePayload: Database['public']['Tables']['profiles']['Update'] = {
        username: newProfile.username,
        full_name: newProfile.fullName,
        phone_number: newProfile.phoneNumber,
        gender: newProfile.gender,
        dob: newProfile.dob,
        height_cm: newProfile.heightCm,
        weight_kg: newProfile.weightKg,
        activity_level: newProfile.activityLevel,
        medical_history: newProfile.medicalHistory,
        daily_calorie_goal: goals?.calories ?? null,
        daily_protein_goal: goals?.proteinGrams ?? null,
        daily_carbohydrates_goal: goals?.carbohydratesGrams ?? null,
        daily_fat_goal: goals?.fatGrams ?? null,
        daily_sugar_goal: goals?.sugarGrams ?? null,
        daily_sodium_goal: goals?.sodiumMilligrams ?? null,
    };

    const { error } = await supabase
        .from('profiles')
        .update(updatePayload)
        .eq('id', session.user.id);
    
    if (error) {
        setError(`Failed to save profile: ${error.message}`);
    } else {
        await fetchData(); // Refetch all data
        setActiveView('dashboard');
    }
    setIsSavingProfile(false);
  };
  
  const handleDoctorProfileSave = async (newProfile: DoctorProfile) => {
    if (!session) return;
    setIsSavingProfile(true);
    setError(null);
    
    const updatePayload: Database['public']['Tables']['doctors']['Update'] = {
        full_name: newProfile.fullName,
        phone_number: newProfile.phoneNumber,
        specialization: newProfile.specialization,
    };

    const { error } = await supabase
        .from('doctors')
        .update(updatePayload)
        .eq('id', session.user.id);
        
    if (error) {
        setError(`Failed to save profile: ${error.message}`);
    } else {
        await fetchData();
        alert('Profile saved successfully!');
    }
    setIsSavingProfile(false);
  };
  
  const handleSuggestMeal = async () => {
    if (!profile) return;
    setIsSuggestingMeal(true);
    setError(null);
    try {
        const suggestion = await generateMealSuggestion(todaysIntake, profile, languageName);
        setMealSuggestion(suggestion);
    } catch(err) {
        setError(err instanceof Error ? err.message : 'Could not generate suggestion.');
    } finally {
        setIsSuggestingMeal(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }
  
  if (!isProfileComplete && !isDoctor) {
    return (
      <div className="min-h-screen bg-ui-bg dark:bg-slate-900 py-12 px-4">
        {profile && <UserProfilePage currentProfile={profile} onSave={handleProfileSave} isSetupMode={true} isSaving={isSavingProfile} />}
      </div>
    );
  }

  const renderContent = () => {
      // Doctor Views
      if(isDoctor && doctorProfile) {
          switch(activeView) {
              case 'doctor_clients':
                  return <DoctorDashboard doctorProfile={doctorProfile} />;
              case 'profile':
                  return <DoctorProfilePage currentProfile={doctorProfile} onSave={handleDoctorProfileSave} isSaving={isSavingProfile} />;
              default:
                  setActiveView('doctor_clients');
                  return null;
          }
      }

      // Patient Views
      if (profile) {
          if (analysis) {
             if (analysis.type === 'food') {
                return <NutritionDisplay analysis={analysis as FoodAnalysis} imagePreview={imagePreview!} onAddToDiary={handleAddToDiary} onReset={handleReset} onRefine={handleRefineAnalysis} isLoading={isLoading} />;
             }
             if (analysis.type === 'label') {
                return <LabelAnalysisDisplay analysis={analysis as LabelAnalysis} imagePreview={imagePreview!} onReset={handleReset} onRefine={handleRefineAnalysis} isLoading={isLoading} mode={activeView === 'grocery' ? 'grocery' : 'diary'} onAddToDiary={handleAddToDiary} onAddToGroceryList={handleAddToGroceryList} />;
             }
          }

          switch (activeView) {
            case 'dashboard':
              return <Dashboard userProfile={profile} todaysIntake={todaysIntake} healthInsight={healthInsight} isLoadingInsight={isLoadingInsight} mealSuggestion={mealSuggestion} isSuggestingMeal={isSuggestingMeal} onSuggestMeal={handleSuggestMeal} setView={setActiveView} error={error} doctorConnections={doctorConnections}/>;
            case 'analyze':
              return <ImageUploader onFileSelect={handleImageAnalysis} disabled={isLoading} />;
            case 'grocery':
              return <ImageUploader onFileSelect={handleGroceryScan} disabled={isLoading} />;
            case 'grocery_list':
              return <GroceryList userProfile={profile} setView={setActiveView} />;
            case 'prescription':
              return <PrescriptionAnalysis userProfile={profile} onProfileUpdate={fetchData} setView={setActiveView} />;
            case 'history':
              return <HistoryView history={history} userProfile={profile} setView={setActiveView} />;
            case 'medical_files':
              return <MedicalFiles userId={profile.id} isDoctorView={false} />;
            case 'profile':
              return <UserProfilePage currentProfile={profile} onSave={handleProfileSave} isSaving={isSavingProfile} safeFoods={safeFoods} restrictedFoods={restrictedFoods}/>;
            default:
              return <div>View not found</div>;
          }
      }
      return <Spinner />; // Default case while profile is loading
  };

  const navItems: { view: View; icon: JSX.Element; label: string }[] = isDoctor ? [
    { view: 'doctor_clients', icon: <UsersIcon />, label: t('navMyPatients') },
    { view: 'profile', icon: <UserIcon />, label: t('navProfile') },
  ] : [
    { view: 'dashboard', icon: <HomeIcon />, label: t('navDashboard') },
    { view: 'analyze', icon: <CameraIcon />, label: t('navLogMeal') },
    { view: 'grocery', icon: <ShoppingCartIcon />, label: t('navGrocery') },
    { view: 'prescription', icon: <FileTextIcon />, label: t('navPrescription') },
    { view: 'history', icon: <BookOpenIcon />, label: t('navHistory') },
    { view: 'medical_files', icon: <FolderHeartIcon />, label: t('navMyFiles') },
  ];
  
  const allNavItems = isDoctor ? navItems : [...navItems, { view: 'profile', icon: <UserIcon />, label: t('navProfile') }];
  const currentViewLabel = allNavItems.find(item => item.view === activeView)?.label || 'MyNutriMate';

  return (
    <div className="min-h-screen bg-ui-bg dark:bg-slate-900">
      <Sidebar navItems={navItems} activeView={activeView} setView={setActiveView} />

      <div className="md:pl-64 flex flex-col min-h-screen">
         <header className="sticky top-0 bg-ui-card/80 dark:bg-slate-800/80 backdrop-blur-lg z-30 border-b border-ui-border dark:border-slate-700">
            <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 flex items-center h-16">
                <div className="flex items-center gap-4 md:hidden">
                    <AppLogo className="h-8"/>
                    <span className="font-bold text-lg">{currentViewLabel}</span>
                </div>
                <div className="flex-1" />
                <div className="flex items-center gap-2">
                    <UserMenu onLogout={handleLogout} onToggleTheme={toggleTheme} theme={theme} setView={setActiveView} isDoctor={isDoctor} />
                </div>
            </div>
        </header>

        <main className="flex-grow w-full max-w-6xl mx-auto py-6 sm:py-8 px-4 sm:px-6 pb-24 md:pb-8">
            {isLoading && !analysis && (
              <div className="flex flex-col items-center justify-center text-center p-8 space-y-4">
                  <Spinner />
                  <p className="text-ui-text-secondary dark:text-slate-400 font-semibold">{t(activeView === 'grocery' ? 'scanningLabel' : 'analyzing')}</p>
              </div>
            )}
            {!isLoading && error && (
                <div className="p-4 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-200 rounded-lg text-center">
                    <p><span className="font-bold">Error:</span> {error}</p>
                    <button onClick={handleReset} className="mt-2 font-semibold underline">Try again</button>
                </div>
            )}
            {!error && renderContent()}
        </main>
        
        <footer className="w-full px-4 sm:px-6 flex flex-col items-center justify-center gap-4 text-center border-t border-ui-border dark:border-slate-800 pt-8 pb-24 md:py-8">
            <FooterBanner className="h-auto max-w-[280px] sm:max-w-xs" />
            <p className="text-xs text-ui-text-secondary dark:text-slate-400">
            {t('footerCredit')}{' '}
            <a href="https://abdm.gov.in/" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">{t('footerAbdm')}</a>
            {t('footerAnd')}
            <a href="https://pmjay.gov.in/" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">{t('footerPmjay')}</a>
            </p>
        </footer>
      </div>
      
      <BottomNav navItems={navItems} activeView={activeView} setView={setActiveView} />
      
      {!isDoctor && <ChatBot healthChat={healthChat} />}
    </div>
  );
};
