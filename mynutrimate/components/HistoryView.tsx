
import React, { useState, useMemo, useEffect } from 'react';
import type { FoodAnalysis, UserProfile, View } from '../types';
import { ArrowLeftIcon, AlertTriangleIcon, PrintIcon } from './icons';
import { Spinner } from './Spinner';
import { useI18n } from '../i18n';

interface HistoryViewProps {
  history: FoodAnalysis[];
  userProfile: UserProfile;
  setView: (view: View) => void;
  onBack?: () => void;
  userName?: string;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ history, userProfile, setView, onBack, userName }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const { t } = useI18n();

    const filteredHistory = useMemo(() => {
        return history.filter(item => 
            item.foodName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [history, searchTerm]);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="w-full max-w-4xl mx-auto animate-fade-in space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4 no-print">
                {onBack ? (
                    <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-ui-card dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                        <ArrowLeftIcon className="h-4 w-4" />
                        {t('historyBackToList')}
                    </button>
                ) : <div />}
                <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-brand-primary text-white hover:bg-brand-secondary transition-colors ml-auto">
                    <PrintIcon className="h-4 w-4" />
                    {t('historyPrint')}
                </button>
            </div>

            <div className="bg-ui-card dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-lg border border-ui-border dark:border-slate-700 printable-report">
                <div className="print-only-header">
                    <h1 className="text-xl font-bold mb-2">{t('historyReportTitle')}</h1>
                    <div className="grid grid-cols-2 gap-x-4 text-sm">
                        <p><strong>{t('historyReportPatient')}</strong> {userName || userProfile.fullName}</p>
                        <p><strong>{t('historyReportDate')}</strong> {new Date().toLocaleDateString()}</p>
                        <p><strong>{t('historyReportGoal')}</strong> {userProfile.dailyCalorieGoal || t('na')} kcal</p>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-ui-text dark:text-slate-100 mb-4">
                    {userName ? t('historyPatientHistory', { name: userName }) : t('historyMyHistory')}
                </h2>
                
                <div className="mb-4 no-print">
                    <input
                        type="text"
                        placeholder={t('historySearchPlaceholder')}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 border border-ui-border dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    />
                </div>

                <div className="space-y-4">
                    {filteredHistory.length > 0 ? (
                        filteredHistory.map(item => {
                            const isRisky = item.safetyVerdict && !item.safetyVerdict.isSafe;
                            return (
                                <div 
                                    key={item.id} 
                                    className={`p-4 rounded-lg border transition-colors ${
                                        isRisky 
                                        ? 'bg-status-bad-bg dark:bg-red-900/40 border-red-300 dark:border-red-600' 
                                        : 'bg-slate-100 dark:bg-slate-900/50 border-transparent'
                                    }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className={`font-bold capitalize ${isRisky ? 'text-status-bad-text dark:text-red-200' : 'text-ui-text dark:text-slate-200'}`}>{item.foodName}</p>
                                            <p className="text-sm text-ui-text-secondary dark:text-slate-400">
                                                {new Date(item.date).toLocaleString()} - {item.nutrition.calories.toFixed(0)} kcal
                                            </p>
                                        </div>
                                        {isRisky && (
                                            <div className="flex-shrink-0 flex items-center gap-2 text-status-bad-text dark:text-red-200" title={item.safetyVerdict.reason}>
                                                <AlertTriangleIcon className="h-5 w-5"/>
                                                <span className="text-sm font-semibold hidden sm:inline">{t('historyRisky')}</span>
                                            </div>
                                        )}
                                    </div>
                                    {isRisky && (
                                        <div className="mt-2 p-2 bg-red-100/50 dark:bg-red-800/30 rounded-md">
                                            <p className="text-sm text-status-bad-text dark:text-red-200">
                                                <span className="font-semibold">{t('historyReason')}</span> {item.safetyVerdict.reason}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )
                        })
                    ) : (
                        <p className="text-center text-ui-text-secondary dark:text-slate-400 py-8">
                            {history.length === 0 ? t('historyNoItems') : t('historyNoMatch')}
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
};
