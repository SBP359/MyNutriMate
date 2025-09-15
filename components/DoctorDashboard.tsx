

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { PatientData, DoctorProfile, SafeFood, RestrictedFood } from '../types';
import { getDoctorPatients, disconnectUserFromDoctor } from '../services/doctorService';
import { exportToExcel } from '../services/excelExportService';
import { Spinner } from './Spinner';
import { AlertTriangleIcon, UsersIcon, DownloadIcon, PhoneIcon, BookOpenIcon, ClipboardIcon, CheckIcon, ShieldIcon, XIcon, PlusIcon, UserIcon } from './icons';
import { HistoryView } from './HistoryView';
import { getFormattedAgeString, calculateBmi, getBmiStatus } from '../utils/helpers';
import { supabase } from '../services/supabaseClient';
import { PatientManagementModal } from './PatientManagementModal';
import { useI18n } from '../i18n';


const PatientCalorieStatus: React.FC<{ client: PatientData }> = ({ client }) => {
    const { t } = useI18n();
    const { status, color, hint } = useMemo(() => {
        const goal = client.profile.dailyCalorieGoal;
        if (!goal || client.history.length === 0) {
            return { status: t('na'), color: "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300", hint: t('doctorDashboardNoData') };
        }

        const recentHistory = client.history.slice(0, 7);
        const uniqueDays = new Set(recentHistory.map(item => new Date(item.date).toDateString())).size;
        const avgCalories = recentHistory.reduce((sum, h) => sum + h.nutrition.calories, 0) / Math.max(1, uniqueDays);
        const ratio = avgCalories / goal;
        
        if (ratio < 0.75) return { status: t('statusLow'), color: "bg-status-medium-bg text-status-medium-text", hint: t('doctorDashboardHintLow') };
        if (ratio > 1.25) return { status: t('statusHigh'), color: "bg-status-bad-bg text-status-bad-text", hint: t('doctorDashboardHintHigh') };
        return { status: t('statusNormal'), color: "bg-status-ok-bg text-status-ok-text", hint: t('doctorDashboardHintNormal') };
    }, [client.history, client.profile.dailyCalorieGoal, t]);

    return (
        <div className="p-2 bg-slate-100 dark:bg-slate-700/50 rounded-md" title={hint}>
            <p className="text-xs text-ui-text-secondary dark:text-slate-400">{t('doctorDashboardCalorieStatus')}</p>
            <p className={`font-bold px-2 py-0.5 rounded-full inline-block text-center text-xs ${color}`}>{status}</p>
        </div>
    );
};


const PatientCard: React.FC<{ 
    client: PatientData, 
    onManagePatient: (patient: PatientData) => void,
    index: number 
}> = ({ client, onManagePatient, index }) => {
    const { t } = useI18n();
    const { profile, history } = client;
    const formattedAge = useMemo(() => getFormattedAgeString(profile.dob, t), [profile.dob, t]);
    const bmi = useMemo(() => calculateBmi(profile.weightKg, profile.heightCm), [profile.weightKg, profile.heightCm]);
    const bmiStatus = useMemo(() => getBmiStatus(bmi), [bmi]);
    const lastLogDate = history.length > 0 ? new Date(history[0].date).toLocaleDateString() : t('na');
    const isInactive = history.length > 0 && (new Date().getTime() - new Date(history[0].date).getTime()) > 3 * 24 * 60 * 60 * 1000;
    const hasRisk = bmiStatus?.isRisk || isInactive;
    const riskHint = isInactive 
        ? t('doctorDashboardInactiveHint') 
        : (bmiStatus ? t('doctorDashboardBmiHint', { status: t(bmiStatus.status) }) : '');

    return (
        <div 
            className="bg-ui-card dark:bg-slate-800 p-4 rounded-xl shadow-md border border-ui-border dark:border-slate-700 space-y-3 animate-slide-up flex flex-col transform hover:-translate-y-1"
            style={{ animationDelay: `${index * 50}ms` }}
        >
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-bold text-ui-text dark:text-slate-100">{index + 1}. {profile.fullName || t('doctorDashboardUnnamed')}</h3>
                    <p className="text-sm text-ui-text-secondary dark:text-slate-400 capitalize">{formattedAge}, {t(profile.gender)}</p>
                </div>
                {hasRisk && (
                    <div className="flex-shrink-0" title={riskHint}>
                        <AlertTriangleIcon className="h-6 w-6 text-yellow-500" />
                    </div>
                )}
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
                <PatientCalorieStatus client={client} />
                <div className="p-2 bg-slate-100 dark:bg-slate-700/50 rounded-md">
                    <p className="text-xs text-ui-text-secondary dark:text-slate-400">BMI</p>
                    <p className={`font-bold ${bmiStatus?.colorClass}`}>{bmi ? bmi.toFixed(1) : t('na')}</p>
                </div>
            </div>
            <div className="flex flex-col gap-2 pt-3 border-t border-ui-border dark:border-slate-700 mt-auto">
                <button onClick={() => onManagePatient(client)} className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-brand-primary text-white text-sm font-semibold rounded-lg hover:bg-brand-secondary">
                    <UserIcon className="h-4 w-4" /> {t('doctorDashboardManage')}
                </button>
            </div>
        </div>
    );
};

export const DoctorDashboard: React.FC<{ doctorProfile: DoctorProfile }> = ({ doctorProfile }) => {
    const [patients, setPatients] = useState<PatientData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [managingPatient, setManagingPatient] = useState<PatientData | null>(null);
    const [isCopied, setIsCopied] = useState(false);
    const { t } = useI18n();

    const fetchPatients = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        const { data, error: fetchError } = await getDoctorPatients(doctorProfile.id);
        if (fetchError) setError(fetchError);
        else if(data) setPatients(data);
        setIsLoading(false);
    }, [doctorProfile.id]);

    useEffect(() => {
        fetchPatients();
    }, [fetchPatients]);
    
    const handleExport = () => {
        if (patients.length > 0) exportToExcel(patients, doctorProfile.fullName || 'Doctor');
        else alert(t('doctorDashboardExportEmpty'));
    };
    
    const handleCopyCode = () => {
        navigator.clipboard.writeText(doctorProfile.doctorCode);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };


    return (
        <div className="w-full max-w-6xl mx-auto animate-fade-in space-y-6">
            {managingPatient && (
                <PatientManagementModal 
                    patient={managingPatient} 
                    doctorId={doctorProfile.id}
                    onClose={() => setManagingPatient(null)}
                    onDataChange={fetchPatients}
                />
            )}
            
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-ui-text dark:text-slate-50">{t('doctorDashboardTitle')}</h1>
                    <p className="text-ui-text-secondary dark:text-slate-400">{t('doctorDashboardSubtitle')}</p>
                </div>
                <button onClick={handleExport} disabled={patients.length === 0} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-secondary disabled:bg-slate-400 disabled:cursor-not-allowed">
                    <DownloadIcon className="h-5 w-5" />
                    {t('doctorDashboardExport')}
                </button>
            </div>
            <div className="bg-ui-card dark:bg-slate-800 p-4 rounded-xl shadow-md border border-ui-border dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h3 className="font-semibold text-ui-text dark:text-slate-200">{t('doctorDashboardCodeTitle')}</h3>
                    <p className="text-sm text-ui-text-secondary dark:text-slate-400">{t('doctorDashboardCodeSubtitle')}</p>
                </div>
                <div className="p-3 bg-slate-100 dark:bg-slate-900/50 rounded-lg flex items-center gap-4">
                    <p className="text-xl sm:text-3xl font-bold font-mono text-brand-primary tracking-widest">{doctorProfile.doctorCode}</p>
                    <button onClick={handleCopyCode} title={t('doctorDashboardCopyCode')} className="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700">
                        {isCopied ? <CheckIcon className="h-5 w-5 text-green-500"/> : <ClipboardIcon className="h-5 w-5 text-ui-text-secondary"/>}
                    </button>
                </div>
            </div>
            <div className="p-4 sm:p-6 bg-ui-card dark:bg-slate-800 rounded-xl shadow-md border border-ui-border dark:border-slate-700">
                <h2 className="text-xl font-bold text-ui-text dark:text-slate-100 mb-4 flex items-center gap-2"><UsersIcon/> {t('doctorDashboardAllPatients', { count: patients.length })}</h2>
                {isLoading ? <div className="flex justify-center p-8"><Spinner /></div>
                : error ? <p className="text-red-500 text-center p-8">{error}</p>
                : patients.length === 0 ? (
                    <div className="text-center py-8 px-4">
                        <p className="text-ui-text-secondary dark:text-slate-400">{t('doctorDashboardNoPatients')}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {patients.map((client, index) => (
                            <PatientCard 
                                key={client.profile.id} 
                                client={client} 
                                onManagePatient={setManagingPatient}
                                index={index} 
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
