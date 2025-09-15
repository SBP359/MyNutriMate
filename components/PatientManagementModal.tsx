

import React, { useState, useEffect, useCallback } from 'react';
import type { PatientData, SafeFood, RestrictedFood, Database } from '../types';
import { supabase } from '../services/supabaseClient';
import { updateDoctorNote, disconnectUserFromDoctor } from '../services/doctorService';
import { Spinner } from './Spinner';
import { XIcon, UserIcon, SaveIcon, BookOpenIcon, ShieldIcon, AlertTriangleIcon, FolderHeartIcon, PlusIcon, CheckIcon, FileTextIcon } from './icons';
import { HistoryView } from './HistoryView';
import { MedicalFiles } from './MedicalFiles';
import { useI18n } from '../i18n';

interface ManagerProps {
    patient: PatientData;
    doctorId: string;
    onDataChange: () => void;
}

const SafeFoodManager: React.FC<ManagerProps> = ({ patient, doctorId, onDataChange }) => {
    const [safeFoods, setSafeFoods] = useState<SafeFood[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newFoodName, setNewFoodName] = useState('');
    const [newBrandName, setNewBrandName] = useState('');
    const { t } = useI18n();
    
    const fetchFoods = useCallback(async () => {
        setIsLoading(true);
        const { data } = await supabase.from('safe_foods').select('*').eq('user_id', patient.profile.id).eq('doctor_id', doctorId);
        setSafeFoods(data || []);
        setIsLoading(false);
    }, [patient.profile.id, doctorId]);

    useEffect(() => { fetchFoods(); }, [fetchFoods]);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newFoodName.trim()) return;

        type SafeFoodInsert = Database['public']['Tables']['safe_foods']['Insert'];
        const newFood: SafeFoodInsert = { 
            user_id: patient.profile.id, 
            doctor_id: doctorId, 
            food_name: newFoodName, 
            brand_name: newBrandName || null 
        };

        await supabase.from('safe_foods').insert(newFood as any);
        setNewFoodName('');
        setNewBrandName('');
        await fetchFoods();
        onDataChange();
    };

    const handleDelete = async (id: number) => {
        await supabase.from('safe_foods').delete().eq('id', id);
        await fetchFoods();
        onDataChange();
    };
    
    return (
        <div>
            <h4 className="font-semibold mb-2 text-green-600 dark:text-green-400 flex items-center gap-2"><ShieldIcon/> {t('modalSafeFoods')}</h4>
            <form onSubmit={handleAdd} className="flex flex-col sm:flex-row items-end gap-2 mb-2">
                 <input value={newFoodName} onChange={e => setNewFoodName(e.target.value)} placeholder={t('modalFoodName')} className="w-full text-sm mt-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-900/50 border border-ui-border dark:border-slate-600 rounded-lg"/>
                 <input value={newBrandName} onChange={e => setNewBrandName(e.target.value)} placeholder={t('modalBrand')} className="w-full text-sm mt-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-900/50 border border-ui-border dark:border-slate-600 rounded-lg"/>
                 <button type="submit" className="px-3 py-1.5 bg-brand-primary text-white rounded-lg flex-shrink-0"><PlusIcon/></button>
            </form>
            <div className="max-h-32 overflow-y-auto space-y-1 pr-2">
                {isLoading ? <Spinner className="h-6 w-6"/> : safeFoods.map(f => (
                    <div key={f.id} className="flex justify-between items-center text-sm p-1.5 pl-3 bg-slate-100 dark:bg-slate-700/50 rounded-md">
                        <span>{f.food_name} {f.brand_name && `(${f.brand_name})`}</span>
                        <button onClick={() => handleDelete(f.id)} className="p-1 text-red-500 hover:bg-red-100 rounded-full"><XIcon className="h-4 w-4"/></button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const RestrictedFoodManager: React.FC<ManagerProps> = ({ patient, doctorId, onDataChange }) => {
    const [foods, setFoods] = useState<RestrictedFood[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newFoodName, setNewFoodName] = useState('');
    const [newBrandName, setNewBrandName] = useState('');
    const [newReason, setNewReason] = useState('');
    const { t } = useI18n();

    const fetchFoods = useCallback(async () => {
        setIsLoading(true);
        const { data } = await supabase.from('restricted_foods').select('*').eq('user_id', patient.profile.id).eq('doctor_id', doctorId);
        setFoods(data || []);
        setIsLoading(false);
    }, [patient.profile.id, doctorId]);

    useEffect(() => { fetchFoods(); }, [fetchFoods]);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newFoodName.trim() || !newReason.trim()) return;

        type RestrictedFoodInsert = Database['public']['Tables']['restricted_foods']['Insert'];
        const newFood: RestrictedFoodInsert = { 
            user_id: patient.profile.id, 
            doctor_id: doctorId, 
            food_name: newFoodName, 
            brand_name: newBrandName || null, 
            reason: newReason 
        };

        await supabase.from('restricted_foods').insert(newFood as any);
        setNewFoodName(''); setNewBrandName(''); setNewReason('');
        await fetchFoods();
        onDataChange();
    };

    const handleDelete = async (id: number) => {
        await supabase.from('restricted_foods').delete().eq('id', id);
        await fetchFoods();
        onDataChange();
    };
    
    return (
        <div>
            <h4 className="font-semibold mb-2 text-red-600 dark:text-red-400 flex items-center gap-2"><AlertTriangleIcon/> {t('modalRestrictedFoods')}</h4>
            <form onSubmit={handleAdd} className="space-y-2 mb-2">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input value={newFoodName} onChange={e => setNewFoodName(e.target.value)} placeholder={t('modalFoodName')} className="w-full text-sm px-3 py-1.5 bg-slate-100 dark:bg-slate-900/50 border border-ui-border dark:border-slate-600 rounded-lg"/>
                    <input value={newBrandName} onChange={e => setNewBrandName(e.target.value)} placeholder={t('modalBrand')} className="w-full text-sm px-3 py-1.5 bg-slate-100 dark:bg-slate-900/50 border border-ui-border dark:border-slate-600 rounded-lg"/>
                 </div>
                 <input value={newReason} onChange={e => setNewReason(e.target.value)} placeholder={t('modalReason')} className="w-full text-sm px-3 py-1.5 bg-slate-100 dark:bg-slate-900/50 border border-ui-border dark:border-slate-600 rounded-lg"/>
                 <button type="submit" className="w-full px-3 py-1.5 bg-brand-primary text-white rounded-lg flex items-center justify-center"><PlusIcon/></button>
            </form>
             <div className="max-h-32 overflow-y-auto space-y-1 pr-2">
                {isLoading ? <Spinner className="h-6 w-6"/> : foods.map(f => (
                    <div key={f.id} className="flex justify-between items-center text-sm p-1.5 pl-3 bg-red-100 dark:bg-red-900/40 rounded-md">
                        <span>{f.food_name} - <i className="text-red-700 dark:text-red-300">{f.reason}</i></span>
                        <button onClick={() => handleDelete(f.id)} className="p-1 text-red-500 hover:bg-red-200 rounded-full"><XIcon className="h-4 w-4"/></button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const TabButton: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
    <button 
        onClick={onClick}
        className={`flex-1 flex sm:flex-none sm:w-auto items-center justify-center sm:justify-start gap-2 px-3 py-2 text-sm font-semibold rounded-t-lg border-b-2 ${
            isActive 
                ? 'border-brand-primary text-brand-primary' 
                : 'border-transparent text-ui-text-secondary hover:text-brand-secondary hover:border-brand-secondary/50'
        }`}
    >
        {icon}
        <span className="hidden sm:inline">{label}</span>
    </button>
);


export const PatientManagementModal: React.FC<{ patient: PatientData, doctorId: string, onClose: () => void, onDataChange: () => void }> = ({ patient, doctorId, onClose, onDataChange }) => {
    const [note, setNote] = useState(patient.connection.doctor_note || '');
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'note' | 'foods' | 'history' | 'files'>('note');
    const [saveError, setSaveError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const { t } = useI18n();
    
    const handleSaveNote = async () => {
        setIsSaving(true);
        setSaveError(null);
        setSaveSuccess(false);
        const { error } = await updateDoctorNote(patient.connection.id, note);
        if (error) {
            setSaveError(`${error} ${t('modalSaveErrorHint')}`);
        } else {
            onDataChange();
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        }
        setIsSaving(false);
    };

    const handleDisconnect = async () => {
        if (window.confirm(t('modalDisconnectConfirm'))) {
            await disconnectUserFromDoctor(patient.connection.id);
            onDataChange();
            onClose();
        }
    }
    
    const renderTabContent = () => {
        switch (activeTab) {
            case 'note':
                return (
                    <div>
                        <h3 className="font-semibold mb-2 text-ui-text dark:text-slate-200">{t('modalPatientNote')}</h3>
                        <textarea 
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={8}
                            placeholder={t('modalNotePlaceholder')}
                            className="w-full text-sm p-2 bg-slate-100 dark:bg-slate-700 border border-ui-border dark:border-slate-600 rounded-lg"
                        />
                        <button 
                            onClick={handleSaveNote} 
                            disabled={isSaving || saveSuccess}
                            className={`w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 text-white text-sm font-semibold rounded-lg ${
                                saveSuccess 
                                ? 'bg-green-500 cursor-default' 
                                : 'bg-green-600 hover:bg-green-700 disabled:opacity-70'
                            }`}
                        >
                            {isSaving ? <Spinner className="h-4 w-4"/> : (saveSuccess ? <CheckIcon className="h-4 w-4" /> : <SaveIcon className="h-4 w-4" />)}
                            {isSaving ? t('saving') : (saveSuccess ? t('saved') : t('save') + ' Note')}
                        </button>
                        {saveError && <p className="text-sm text-red-500 mt-2">{saveError}</p>}
                    </div>
                );
            case 'foods':
                return (
                    <div className="space-y-6">
                       <SafeFoodManager patient={patient} doctorId={doctorId} onDataChange={onDataChange} />
                       <RestrictedFoodManager patient={patient} doctorId={doctorId} onDataChange={onDataChange} />
                    </div>
                );
            case 'history':
                return (
                    <div className="max-h-[60vh] overflow-y-auto -m-6 p-6">
                        <HistoryView history={patient.history} userProfile={patient.profile} setView={() => {}} userName={patient.profile.fullName || ''} />
                    </div>
                );
            case 'files':
                 return (
                    <div className="max-h-[60vh] overflow-y-auto -m-6 p-6">
                        <MedicalFiles userId={patient.profile.id} isDoctorView={true} userName={patient.profile.fullName || 'Patient'} />
                    </div>
                );
            default: return null;
        }
    };


    return (
        <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4 animate-scale-in">
            <div className="bg-ui-card dark:bg-slate-800 rounded-xl shadow-lg w-full max-w-5xl max-h-[90vh] flex flex-col">
                <header className="p-4 border-b border-ui-border dark:border-slate-700 flex justify-between items-center flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <UserIcon className="h-10 w-10 text-brand-primary" />
                        <div>
                            <h2 className="text-2xl font-bold text-ui-text dark:text-slate-100">{patient.profile.fullName}</h2>
                            <p className="text-ui-text-secondary dark:text-slate-400">{patient.profile.phoneNumber}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"><XIcon /></button>
                </header>
                
                <nav className="px-4 border-b border-ui-border dark:border-slate-700 flex items-center gap-2 flex-wrap flex-shrink-0">
                    <TabButton icon={<FileTextIcon className="h-5 w-5"/>} label={t('modalTabNote')} isActive={activeTab === 'note'} onClick={() => setActiveTab('note')} />
                    <TabButton icon={<ShieldIcon className="h-5 w-5"/>} label={t('modalTabFood')} isActive={activeTab === 'foods'} onClick={() => setActiveTab('foods')} />
                    <TabButton icon={<BookOpenIcon className="h-5 w-5"/>} label={t('modalTabHistory')} isActive={activeTab === 'history'} onClick={() => setActiveTab('history')} />
                    <TabButton icon={<FolderHeartIcon className="h-5 w-5"/>} label={t('modalTabFiles')} isActive={activeTab === 'files'} onClick={() => setActiveTab('files')} />
                </nav>
                
                <main className="p-6 overflow-y-auto">
                    {renderTabContent()}
                </main>

                <footer className="mt-auto p-4 border-t border-ui-border dark:border-slate-700 flex-shrink-0">
                    <button onClick={handleDisconnect} className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200 text-sm font-semibold rounded-lg hover:bg-red-200 dark:hover:bg-red-900/60">
                        {t('modalDisconnect')}
                    </button>
                </footer>
            </div>
        </div>
    );
};
