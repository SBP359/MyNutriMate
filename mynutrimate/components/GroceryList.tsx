


import React, { useState, useEffect, useCallback } from 'react';
import type { UserProfile, View, GroceryListItem, NutritionInfo, Database } from '../types';
import { supabase } from '../services/supabaseClient';
import { Spinner } from './Spinner';
import { ShoppingCartIcon, StarIcon, FlameIcon, CheckIcon, RefreshCwIcon, ArrowLeftIcon } from './icons';
import { useI18n } from '../i18n';

interface GroceryListProps {
  userProfile: UserProfile;
  setView: (view: View) => void;
}

const GroceryItemCard: React.FC<{ item: GroceryListItem; onToggle: (id: number, isPurchased: boolean) => void; }> = ({ item, onToggle }) => {
    const { product_name, brand_name, health_stars, nutrition_info, is_purchased, id } = item;
    const typed_nutrition_info = nutrition_info;
    const { t } = useI18n();
    
    return (
        <div className={`p-3 sm:p-4 rounded-lg border flex gap-4 items-center transition-all duration-300 ${is_purchased ? 'bg-slate-100 dark:bg-slate-800 opacity-60' : 'bg-ui-card dark:bg-slate-800/50'}`}>
            <button
                onClick={() => onToggle(id, !is_purchased)}
                className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                    is_purchased ? 'bg-brand-primary border-brand-primary' : 'border-slate-300 dark:border-slate-600 hover:border-brand-primary'
                }`}
            >
                {is_purchased && <CheckIcon className="w-5 h-5 text-white" />}
            </button>
            <div className="flex-grow">
                <p className={`font-bold capitalize text-ui-text dark:text-slate-200 ${is_purchased ? 'line-through' : ''}`}>
                    {product_name}
                </p>
                {brand_name && <p className="text-sm text-ui-text-secondary dark:text-slate-400">{brand_name}</p>}
            </div>
            <div className="flex-shrink-0 flex items-center gap-2 sm:gap-4 text-sm text-ui-text-secondary dark:text-slate-400">
                {health_stars && (
                    <div className="flex items-center gap-1" title={t('groceryStarsHint', { stars: health_stars.toFixed(1) })}>
                        <StarIcon className="h-5 w-5 text-yellow-400" filled />
                        <span className="font-semibold">{health_stars.toFixed(1)}</span>
                    </div>
                )}
                {typed_nutrition_info && (
                     <div className="flex items-center gap-1" title={t('groceryCaloriesHint', { calories: typed_nutrition_info.calories.toFixed(0) })}>
                        <FlameIcon className="h-5 w-5 text-orange-400" />
                        <span className="font-semibold">{typed_nutrition_info.calories.toFixed(0)}</span>
                    </div>
                )}
            </div>
        </div>
    );
};


export const GroceryList: React.FC<GroceryListProps> = ({ userProfile, setView }) => {
    const [items, setItems] = useState<GroceryListItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { t } = useI18n();

    const fetchItems = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { data, error: fetchError } = await supabase
                .from('grocery_list_items')
                .select('*')
                .eq('user_id', userProfile.id)
                .order('is_purchased', { ascending: true })
                .order('created_at', { ascending: false });
            
            if (fetchError) throw fetchError;
            const mappedItems = (data || []).map((item): GroceryListItem => ({
                ...item,
                nutrition_info: item.nutrition_info as NutritionInfo | null,
            }));
            setItems(mappedItems);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch grocery list.");
        } finally {
            setIsLoading(false);
        }
    }, [userProfile.id]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const handleTogglePurchased = async (id: number, isPurchased: boolean) => {
        setItems(prev => prev.map(item => item.id === id ? { ...item, is_purchased: isPurchased } : item));

        const updatePayload = { is_purchased: isPurchased };
        
        const { error } = await supabase
            .from('grocery_list_items')
            .update(updatePayload)
            .eq('id', id);
        
        if (error) {
            alert(t('groceryUpdateError'));
            fetchItems(); // Re-fetch to revert optimistic update
        }
    };

    const handleClearPurchased = async () => {
        if (!window.confirm(t('groceryClearConfirm'))) return;

        const purchasedIds = items.filter(item => item.is_purchased).map(item => item.id);
        if (purchasedIds.length === 0) return;

        const { error } = await supabase
            .from('grocery_list_items')
            .delete()
            .in('id', purchasedIds);

        if (error) {
            alert(t('groceryClearError'));
        } else {
            fetchItems();
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto animate-fade-in space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-ui-text dark:text-slate-50 flex items-center justify-center gap-3">
                    <ShoppingCartIcon className="h-8 w-8 text-brand-primary" />
                    {t('groceryTitle')}
                </h1>
                <p className="text-ui-text-secondary dark:text-slate-400">{t('grocerySubtitle')}</p>
            </div>

            <div className="flex justify-between items-center">
                 <button onClick={() => setView('grocery')} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-ui-card dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                    <ArrowLeftIcon className="h-4 w-4" />
                    {t('groceryBackToScanner')}
                </button>
                <button
                    onClick={handleClearPurchased}
                    disabled={!items.some(i => i.is_purchased)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 dark:text-red-400 rounded-lg bg-red-100 dark:bg-red-900/40 hover:bg-red-200 dark:hover:bg-red-800/60 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {t('groceryClearPurchased')}
                </button>
            </div>

            <div className="bg-ui-card dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-lg border border-ui-border dark:border-slate-700">
                {isLoading ? (
                    <div className="flex justify-center p-8"><Spinner /></div>
                ) : error ? (
                    <p className="text-red-500 text-center p-8">{error}</p>
                ) : items.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-ui-text-secondary dark:text-slate-400">{t('groceryEmpty')}</p>
                        <button onClick={() => setView('grocery')} className="mt-4 font-semibold text-brand-primary hover:text-brand-secondary">
                            {t('groceryScanToStart')}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {items.map(item => (
                            <GroceryItemCard key={item.id} item={item} onToggle={handleTogglePurchased} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};