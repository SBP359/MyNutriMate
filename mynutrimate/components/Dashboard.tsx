
import React from 'react';
import type { UserProfile, DailyIntake, HealthInsight, View, MealSuggestion, DoctorConnection } from '../types';
import { CircularProgressBar } from './CircularProgressBar';
import { WeightIcon, DropletsIcon, ZapIcon, CameraIcon, LightbulbIcon, UtensilsCrossedIcon, SparklesIcon, AlertTriangleIcon, WindIcon, WavesIcon, FileTextIcon, UserIcon } from './icons';
import { Spinner } from './Spinner';
import { calculateBmi, getBmiStatus } from '../utils/helpers';
import { useI18n } from '../i18n';

interface DashboardProps {
  userProfile: UserProfile;
  todaysIntake: DailyIntake;
  healthInsight: HealthInsight | null;
  isLoadingInsight: boolean;
  mealSuggestion: MealSuggestion | null;
  isSuggestingMeal: boolean;
  onSuggestMeal: () => void;
  setView: (view: View) => void;
  error: string | null;
  doctorConnections: DoctorConnection[];
}

const NutrientBar: React.FC<{
    label: string;
    icon: React.ReactNode;
    current: number;
    goal: number;
    color: string;
    unit?: string;
    style?: React.CSSProperties;
}> = ({ label, icon, current, goal, color, unit = 'g', style }) => {
  const percentage = goal > 0 ? (current / goal) * 100 : 0;
  const visualPercentage = Math.min(percentage, 100);
  const isOver = percentage > 100;

  const barColor = isOver ? 'bg-red-500' : color;
  const textColor = isOver ? 'text-red-500 dark:text-red-400' : 'text-ui-text-secondary dark:text-slate-400';

  return (
    <div className="animate-slide-up" style={style}>
        <div className="flex justify-between items-center mb-1 text-sm">
            <div className="flex items-center gap-2 font-semibold text-ui-text dark:text-slate-200">
                {icon}
                <span>{label}</span>
            </div>
            <span className={`${textColor}`}>
                {current.toFixed(0)} / {goal.toFixed(0)}{unit}
            </span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
            <div 
                className={`${barColor} h-2.5 rounded-full`} 
                style={{ width: `${visualPercentage}%`, transition: 'width 0.5s ease-in-out' }}>
            </div>
        </div>
    </div>
  );
};

const HealthInsightCard: React.FC<{insight: HealthInsight | null, isLoading: boolean}> = ({ insight, isLoading }) => {
    const { t } = useI18n();
    if (isLoading) {
        return (
            <div className="glass-card p-4 flex items-center justify-center gap-3 animate-pulse-fast min-h-[80px]">
               <Spinner className="h-8 w-8"/>
               <p className="text-ui-text-secondary dark:text-slate-300">{t('dashboardGeneratingTip')}</p>
            </div>
        );
    }

    if (!insight) {
         return (
            <div className="glass-card p-4 flex items-center gap-3 animate-fade-in min-h-[80px]">
                <LightbulbIcon className="h-8 w-8 text-brand-primary flex-shrink-0" />
                <div>
                    <h4 className="font-bold text-ui-text dark:text-slate-100">{t('dashboardLogFirstMeal')}</h4>
                    <p className="text-sm text-ui-text-secondary dark:text-slate-300">{t('dashboardGetInsights')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-card p-4 flex items-center gap-3 animate-fade-in min-h-[80px]">
            <span className="text-4xl flex-shrink-0">{insight.emoji}</span>
             <div>
                <h4 className="font-bold text-ui-text dark:text-slate-100">{insight.title}</h4>
                <p className="text-sm text-ui-text-secondary dark:text-slate-300">{insight.message}</p>
            </div>
        </div>
    );
}

const MealSuggestionCard: React.FC<{
  suggestion: MealSuggestion | null;
  isLoading: boolean;
  onSuggest: () => void;
  error: string | null;
}> = ({ suggestion, isLoading, onSuggest, error }) => {
  const { t } = useI18n();
  return (
    <div className="glass-card p-6 flex flex-col justify-between h-full">
      <div>
        <h3 className="text-xl font-bold text-ui-text dark:text-slate-100 mb-2 flex items-center gap-2">
          <UtensilsCrossedIcon className="h-6 w-6 text-brand-primary" />
          {t('dashboardAiMealSuggestion')}
        </h3>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-4">
            <Spinner />
            <p className="mt-2 text-sm text-ui-text-secondary dark:text-slate-400">{t('dashboardThinkingMeal')}</p>
          </div>
        ) : error ? (
            <div className="p-3 bg-red-100 dark:bg-red-900/40 rounded-lg text-red-700 dark:text-red-200 text-sm flex items-start gap-2">
                <AlertTriangleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
            </div>
        ) : suggestion ? (
          <div className="space-y-3 animate-fade-in">
            <h4 className="text-lg font-bold text-brand-secondary capitalize">{suggestion.mealName}</h4>
            <p className="text-sm text-ui-text-secondary dark:text-slate-300">{suggestion.description}</p>
            <div className="p-3 bg-brand-primary/10 dark:bg-brand-primary/20 rounded-lg">
              <p className="text-xs font-semibold text-brand-primary dark:text-brand-accent mb-1">{t('dashboardWhyThisMeal')}</p>
              <p className="text-sm text-brand-primary/80 dark:text-brand-accent/90">{suggestion.reason}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-ui-text-secondary dark:text-slate-400">{t('dashboardGetSuggestion')}</p>
        )}
      </div>
      <button
        onClick={onSuggest}
        disabled={isLoading}
        className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-secondary disabled:bg-slate-400"
      >
        <SparklesIcon className="h-5 w-5" />
        {suggestion ? t('dashboardSuggestAnother') : t('dashboardSuggestMeal')}
      </button>
    </div>
  );
};


const DoctorNoteCard: React.FC<{ connections: DoctorConnection[] }> = ({ connections }) => {
    const { t } = useI18n();
    const notes = connections.filter(c => c.doctor_note && c.doctor_note.trim() !== '');
    if (notes.length === 0) {
        return null;
    }
    return (
        <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <h3 className="text-xl font-bold text-ui-text dark:text-slate-100 mb-3">{t('dashboardDoctorNotes')}</h3>
            <div className="space-y-4">
                {notes.map(note => (
                    <div key={note.id} className="p-4 bg-blue-100 dark:bg-blue-900/40 rounded-lg border border-blue-200 dark:border-blue-700">
                        <div className="flex items-center gap-2 mb-2">
                            <UserIcon className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                            <p className="font-semibold text-blue-800 dark:text-blue-200">{t('dashboardNoteFrom', {name: note.doctors?.full_name?.split(' ').pop() || ''})}</p>
                        </div>
                        <p className="text-blue-700 dark:text-blue-300 whitespace-pre-wrap text-sm">{note.doctor_note}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const BmiCard: React.FC<{profile: UserProfile, style?: React.CSSProperties}> = ({ profile, style }) => {
    const { t } = useI18n();
    const bmi = calculateBmi(profile.weightKg, profile.heightCm);
    const bmiStatus = getBmiStatus(bmi);

    return (
        <div className="glass-card p-6 flex flex-col justify-center items-center animate-slide-up" style={style}>
            <h3 className="text-lg font-bold text-ui-text dark:text-slate-100 mb-2">{t('dashboardBmi')}</h3>
            {bmi && bmiStatus ? (
                <>
                    <p className={`text-5xl font-bold ${bmiStatus.colorClass}`}>{bmi.toFixed(1)}</p>
                    <p className={`font-semibold ${bmiStatus.colorClass}`}>{bmiStatus.status}</p>
                </>
            ) : (
                <p className="text-ui-text-secondary dark:text-slate-400">{t('dashboardEnterBmi')}</p>
            )}
        </div>
    );
};

export const Dashboard: React.FC<DashboardProps> = ({ 
    userProfile, 
    todaysIntake, 
    healthInsight,
    isLoadingInsight,
    mealSuggestion,
    isSuggestingMeal,
    onSuggestMeal,
    setView,
    error,
    doctorConnections,
 }) => {
  const calorieGoal = userProfile.dailyCalorieGoal ?? 2000;
  const proteinGoal = userProfile.dailyProteinGoal ?? 50;
  const carbsGoal = userProfile.dailyCarbohydratesGoal ?? 250;
  const fatGoal = userProfile.dailyFatGoal ?? 65;
  const sugarGoal = userProfile.dailySugarGoal ?? 25;
  const sodiumGoal = userProfile.dailySodiumGoal ?? 1500;

  const caloriePercentage = calorieGoal > 0 ? (todaysIntake.calories / calorieGoal) * 100 : 0;
  const { t } = useI18n();
  
  return (
    <div className="w-full max-w-6xl mx-auto animate-fade-in space-y-6 sm:space-y-8">
      <div className="text-center animate-slide-up">
        <h1 className="text-2xl sm:text-3xl font-bold text-ui-text dark:text-slate-50">{t('dashboardTitle')}</h1>
        <p className="text-ui-text-secondary dark:text-slate-400 mt-1">{t('dashboardGreeting', { name: userProfile.fullName?.split(' ')[0] || t('patient')})}</p>
      </div>
      
      <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <button
            onClick={() => setView('analyze')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-secondary to-brand-primary text-white font-bold rounded-full hover:shadow-lg hover:-translate-y-0.5 shadow-md"
        >
            <CameraIcon className="h-6 w-6"/>
            {t('dashboardScanFood')}
        </button>
         <button
            onClick={() => setView('prescription')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-full hover:shadow-lg hover:-translate-y-0.5 shadow-md"
        >
            <FileTextIcon className="h-6 w-6"/>
            {t('dashboardAnalyzePrescription')}
        </button>
      </div>

      <DoctorNoteCard connections={doctorConnections} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            <div className="flex justify-center items-center glass-card p-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
                {calorieGoal > 0 ? (
                    <CircularProgressBar 
                        percentage={caloriePercentage}
                        label={t('dashboardCalories')}
                        value={todaysIntake.calories}
                        goal={calorieGoal}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full w-48 h-48">
                        <Spinner />
                        <p className="text-xs text-ui-text-secondary dark:text-slate-400 mt-2">{t('dashboardLoadingGoals')}</p>
                    </div>
                )}
            </div>
            
            <BmiCard profile={userProfile} style={{ animationDelay: '300ms' }}/>

            <div className="sm:col-span-2 glass-card p-6 space-y-6 animate-slide-up" style={{ animationDelay: '400ms' }}>
              <h3 className="text-xl font-bold text-ui-text dark:text-slate-100">{t('dashboardMacros')}</h3>
              {proteinGoal > 0 ? (
                  <div className="space-y-4">
                      <NutrientBar label={t('nutrientProtein')} icon={<WeightIcon className="h-5 w-5"/>} current={todaysIntake.proteinGrams} goal={proteinGoal} color="bg-red-500" style={{ animationDelay: '450ms' }} />
                      <NutrientBar label={t('nutrientCarbs')} icon={<ZapIcon className="h-5 w-5"/>} current={todaysIntake.carbohydratesGrams} goal={carbsGoal} color="bg-blue-500" style={{ animationDelay: '500ms' }}/>
                      <NutrientBar label={t('nutrientFat')} icon={<DropletsIcon className="h-5 w-5"/>} current={todaysIntake.fatGrams} goal={fatGoal} color="bg-yellow-500" style={{ animationDelay: '550ms' }}/>
                  </div>
              ) : (
                  <p className="text-ui-text-secondary dark:text-slate-400 text-sm">{t('dashboardLoadingMacros')}</p>
              )}
            </div>
        </div>

        <div className="space-y-6 sm:space-y-8">
             <div className="glass-card p-6 space-y-4 animate-slide-up" style={{ animationDelay: '300ms' }}>
                <h3 className="text-xl font-bold text-ui-text dark:text-slate-100">{t('dashboardDailyLimits')}</h3>
                <NutrientBar label={t('nutrientSugar')} icon={<WindIcon className="h-5 w-5"/>} current={todaysIntake.sugarGrams} goal={sugarGoal} color="bg-purple-500" style={{ animationDelay: '350ms' }} />
                <NutrientBar label={t('nutrientSodium')} icon={<WavesIcon className="h-5 w-5"/>} current={todaysIntake.sodiumMilligrams} goal={sodiumGoal} color="bg-pink-500" unit="mg" style={{ animationDelay: '400ms' }} />
            </div>
            <div className="animate-slide-up" style={{ animationDelay: '400ms' }}>
                 <div className="glass-card p-6">
                    <h3 className="text-xl font-bold text-ui-text dark:text-slate-100 mb-2">{t('dashboardAiTip')}</h3>
                    <HealthInsightCard insight={healthInsight} isLoading={isLoadingInsight} />
                 </div>
            </div>
        </div>
      </div>
      
       <div className="grid grid-cols-1">
          <div className="animate-slide-up" style={{ animationDelay: '500ms' }}>
            <MealSuggestionCard 
                suggestion={mealSuggestion}
                isLoading={isSuggestingMeal}
                onSuggest={onSuggestMeal}
                error={error}
            />
          </div>
       </div>
    </div>
  );
};
