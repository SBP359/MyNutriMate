

import React, { useState, useMemo } from 'react';
import type { LabelAnalysis, NutritionInfo, GroceryListItem, Json } from '../types';
import { RefreshCwIcon, FlameIcon, WeightIcon, ZapIcon, WindIcon, DropletsIcon, WavesIcon, BookOpenIcon, LeafIcon, BoneIcon, ShieldIcon, StarIcon, EditIcon, SunIcon, EyeIcon, CitrusIcon, AlertTriangleIcon, UtensilsCrossedIcon, CheckCircleIcon, ShoppingCartIcon } from './icons';
import { Spinner } from './Spinner';
import { useI18n } from '../i18n';

interface LabelAnalysisDisplayProps {
  analysis: LabelAnalysis;
  imagePreview: string;
  onReset: () => void;
  onRefine: (customPrompt: string) => void;
  isLoading: boolean;
  mode: 'diary' | 'grocery';
  onAddToDiary?: () => void;
  onAddToGroceryList?: (item: Omit<GroceryListItem, 'id' | 'user_id' | 'created_at' | 'is_purchased'>) => void;
}


const HealthStars: React.FC<{ rating: number | null }> = ({ rating }) => {
  const finalRating = typeof rating === 'number' ? rating : 0;
  const getColor = (r: number) => {
    if (r <= 2) return 'text-red-500';
    if (r < 4) return 'text-yellow-500';
    return 'text-green-500';
  };
  const colorClass = getColor(finalRating);

  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <StarIcon key={i} className={`h-6 w-6 sm:h-8 sm:w-8 ${colorClass}`} filled={i < finalRating} />
      ))}
    </div>
  );
};


const NutrientItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit: string;
  color: string;
  style?: React.CSSProperties;
}> = ({ icon, label, value, unit, color, style }) => (
  <div 
    className={`flex flex-col items-center justify-center p-2 sm:p-4 rounded-lg bg-ui-bg dark:bg-slate-800/50 text-center animate-slide-up transform hover:scale-105 hover:shadow-lg`}
    style={style}
  >
    <div className={`mb-2 ${color}`}>{icon}</div>
    <p className="text-xs sm:text-sm text-ui-text-secondary dark:text-slate-400">{label}</p>
    <p className="text-lg sm:text-xl font-bold text-ui-text dark:text-slate-50">{value}</p>
    <p className="text-xs text-ui-text-secondary/80 dark:text-slate-500">{unit}</p>
  </div>
);

const ExpiryWarning: React.FC<{ expiryDate: string }> = ({ expiryDate }) => {
    const { t } = useI18n();
    const formattedDate = useMemo(() => {
        try {
            const [year, month, day] = expiryDate.split('-').map(num => parseInt(num, 10));
            const dateObj = new Date(year, month - 1, day);
            return dateObj.toLocaleDateString('en-US');
        } catch {
            return expiryDate;
        }
    }, [expiryDate]);

    return (
        <div className="p-4 my-4 bg-status-bad-bg dark:bg-red-900/40 text-status-bad-text dark:text-red-200 rounded-lg flex items-start gap-3 border border-red-300 dark:border-red-600 animate-fade-in">
            <AlertTriangleIcon className="h-8 w-8 flex-shrink-0 mt-1" />
            <div>
                <h4 className="font-bold">{t('labelExpiredTitle')}</h4>
                <p className="text-sm">{t('labelExpiredMessage', { date: formattedDate })}</p>
            </div>
        </div>
    );
};

export const LabelAnalysisDisplay: React.FC<LabelAnalysisDisplayProps> = ({ 
    analysis, 
    imagePreview, 
    onReset, 
    onRefine, 
    isLoading,
    mode,
    onAddToDiary,
    onAddToGroceryList
}) => {
  const { productName, servingSizeGrams, nutrition, healthStars, healthSummary, expiryDate, dietaryWarnings, safetyVerdict } = analysis;
  const [isEditing, setIsEditing] = useState(false);
  const { t } = useI18n();
  
  const isSpoiled = useMemo(() => 
    dietaryWarnings?.some(w => w.toLowerCase().includes('spoiled') || w.toLowerCase().includes('unsafe')),
    [dietaryWarnings]
  );

  const isExpired = useMemo(() => {
    if (!expiryDate || !/^\d{4}-\d{2}-\d{2}$/.test(expiryDate)) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [year, month, day] = expiryDate.split('-').map(num => parseInt(num, 10));
    const expiry = new Date(year, month - 1, day);
    return today > expiry;
  }, [expiryDate]);

  const nutrientData = [
    { icon: <FlameIcon />, label: t('dashboardCalories'), key: 'calories', unit: 'kcal', color: 'text-orange-400' },
    { icon: <WeightIcon />, label: t('nutrientProtein'), key: 'proteinGrams', unit: 'g', color: 'text-red-400' },
    { icon: <DropletsIcon />, label: t('nutrientFat'), key: 'fatGrams', unit: 'g', color: 'text-yellow-400' },
    { icon: <ZapIcon />, label: t('nutrientCarbs'), key: 'carbohydratesGrams', unit: 'g', color: 'text-blue-400' },
    { icon: <WindIcon />, label: t('nutrientSugar'), key: 'sugarGrams', unit: 'g', color: 'text-purple-400' },
    { icon: <WavesIcon />, label: t('nutrientSodium'), key: 'sodiumMilligrams', unit: 'mg', color: 'text-green-400' },
  ];

  const micronutrientData = nutrition.micronutrients ? [
    { icon: <ShieldIcon />, label: t('nutrientIron'), key: 'ironMg', unit: 'mg', color: 'text-red-500' },
    { icon: <BoneIcon />, label: t('nutrientCalcium'), key: 'calciumMg', unit: 'mg', color: 'text-slate-400' },
    { icon: <LeafIcon />, label: t('nutrientPotassium'), key: 'potassiumMg', unit: 'mg', color: 'text-green-500' },
    { icon: <CitrusIcon />, label: t('nutrientVitaminC'), key: 'vitaminCMg', unit: 'mg', color: 'text-orange-500' },
    { icon: <EyeIcon />, label: t('nutrientVitaminA'), key: 'vitaminAIU', unit: 'IU', color: 'text-yellow-500' },
    { icon: <SunIcon />, label: t('nutrientVitaminD'), key: 'vitaminDIU', unit: 'IU', color: 'text-blue-500' },
  ].filter(item => nutrition.micronutrients?.[item.key as keyof typeof nutrition.micronutrients] != null) : [];

  const handleAdd = () => {
    if (mode === 'diary' && onAddToDiary) {
        onAddToDiary();
    } else if (mode === 'grocery' && onAddToGroceryList) {
        onAddToGroceryList({
            product_name: analysis.productName,
            brand_name: null, // The AI doesn't consistently provide a separate brand name for labels
            nutrition_info: analysis.nutrition,
            health_stars: analysis.healthStars
        });
    }
  };

  const getNutrientValue = (nutrientKey: keyof NutritionInfo | keyof NonNullable<NutritionInfo['micronutrients']>) => {
    if (['ironMg', 'calciumMg', 'potassiumMg', 'vitaminAIU', 'vitaminCMg', 'vitaminDIU'].includes(nutrientKey)) {
        const value = nutrition.micronutrients?.[nutrientKey as keyof typeof nutrition.micronutrients];
        return typeof value === 'number' ? value.toFixed(1) : t('na');
    }
    const value = nutrition[nutrientKey as keyof NutritionInfo];
    return typeof value === 'number' ? value.toFixed(1) : t('na');
  };

  const addButtonLabel = mode === 'diary' ? t('labelAddToDiary') : t('labelAddToGrocery');
  const addButtonIcon = mode === 'diary' ? <BookOpenIcon className="h-4 w-4" /> : <ShoppingCartIcon className="h-4 w-4" />;

  return (
    <div className="w-full animate-fade-in flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
      <div className="w-full lg:w-1/3 flex-shrink-0 animate-slide-up">
        <div className="bg-ui-card dark:bg-slate-800 p-4 rounded-xl shadow-lg border border-ui-border dark:border-slate-700">
          <img
            src={imagePreview}
            alt="Analyzed nutrition label"
            className="w-full h-auto object-cover rounded-lg mb-4"
          />
          <h2 className="text-xl sm:text-2xl font-bold text-ui-text dark:text-slate-100 capitalize">{productName}</h2>
          <p className="text-sm sm:text-base text-ui-text-secondary dark:text-slate-400">
            {t('labelServingSize')}<span className="font-semibold text-brand-primary">{typeof servingSizeGrams === 'number' ? servingSizeGrams.toFixed(0) : t('na')} g</span>
          </p>
          
          {isExpired && <ExpiryWarning expiryDate={expiryDate!} />}

          {safetyVerdict && (
            <div className={`p-4 my-4 rounded-lg flex items-start gap-3 border animate-fade-in ${
              safetyVerdict.isSafe 
                ? 'bg-status-ok-bg dark:bg-green-900/40 text-status-ok-text dark:text-green-200 border-green-300 dark:border-green-600'
                : 'bg-status-bad-bg dark:bg-red-900/40 text-status-bad-text dark:text-red-200 border-red-300 dark:border-red-600'
            }`}>
              {safetyVerdict.isSafe ? <CheckCircleIcon className="h-8 w-8 flex-shrink-0 mt-1"/> : <AlertTriangleIcon className="h-8 w-8 flex-shrink-0 mt-1" />}
              <div>
                  <h4 className="font-bold">{safetyVerdict.isSafe ? t('safetyVerdictSafe') : t('safetyVerdictRisky')}</h4>
                  <p className="text-sm">{safetyVerdict.reason}</p>
              </div>
            </div>
          )}

          <div className="mt-4 flex flex-col gap-2">
            <button 
              onClick={handleAdd} 
              disabled={isLoading || isExpired || isSpoiled}
              title={isSpoiled ? t('labelAddSpoiledError') : (isExpired ? t('labelAddExpiredError') : undefined)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-secondary disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
              {addButtonIcon}
              {addButtonLabel}
            </button>
            <button 
              onClick={onReset} 
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200 font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 disabled:bg-slate-400"
            >
              <RefreshCwIcon className="h-4 w-4" />
              {t('labelAnalyzeNew')}
            </button>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-2/3 space-y-6">
         <div className="bg-ui-card dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-lg border border-ui-border dark:border-slate-700 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <h3 className="text-lg sm:text-xl font-bold mb-3 text-ui-text dark:text-slate-100 flex items-center gap-2"><ShieldIcon className="h-6 w-6 text-brand-primary"/> {t('labelHealthAssessment')}</h3>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-3">
                <HealthStars rating={healthStars} />
                <span className="text-xl sm:text-2xl font-bold text-ui-text dark:text-slate-200">{typeof healthStars === 'number' ? t('labelStarsOutOf5', { stars: healthStars.toFixed(1) }) : t('na')}</span>
            </div>
            <p className="text-ui-text-secondary dark:text-slate-300 text-sm sm:text-base">{healthSummary}</p>
        </div>
        <div className="bg-ui-card dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-lg border border-ui-border dark:border-slate-700 animate-slide-up" style={{animationDelay: '200ms'}}>
            <h3 className="text-lg sm:text-xl font-bold mb-4 text-ui-text dark:text-slate-100">{t('labelNutritionalBreakdown', { size: typeof servingSizeGrams === 'number' ? servingSizeGrams.toFixed(0) : t('na') })}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
            {nutrientData.map((item, index) => (
                <NutrientItem
                    key={item.key}
                    icon={item.icon}
                    label={item.label}
                    value={getNutrientValue(item.key as keyof NutritionInfo)}
                    unit={item.unit}
                    color={item.color}
                    style={{ animationDelay: `${index * 50}ms` }}
                />
            ))}
            </div>
            
            {micronutrientData.length > 0 && (
            <>
                <h3 className="text-lg sm:text-xl font-bold mt-6 sm:mt-8 mb-4 text-ui-text dark:text-slate-100">{t('labelMicronutrients')}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
                {micronutrientData.map((item, index) => (
                    <NutrientItem
                        key={item.key}
                        icon={item.icon}
                        label={item.label}
                        value={getNutrientValue(item.key as keyof NonNullable<NutritionInfo['micronutrients']>)}
                        unit={item.unit}
                        color={item.color}
                        style={{ animationDelay: `${index * 50}ms` }}
                    />
                ))}
                </div>
            </>
            )}
        </div>
      </div>
    </div>
  );
};