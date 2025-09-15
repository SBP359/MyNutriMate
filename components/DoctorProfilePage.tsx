

import React, { useState } from 'react';
import type { DoctorProfile } from '../types';
import { SaveIcon, ClipboardIcon, CheckIcon } from './icons';
import { Spinner } from './Spinner';
import { useI18n } from '../i18n';

const InputField: React.FC<{ 
    label: string; 
    value: string | null; 
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
    placeholder: string;
    name: string;
    required?: boolean;
    disabled?: boolean;
}> = ({ label, value, onChange, placeholder, name, required = false, disabled = false }) => (
    <div>
        <label className="block text-sm font-medium text-ui-text-secondary dark:text-slate-300 mb-1">{label}</label>
        <input
            name={name}
            type='text'
            value={value ?? ''}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-ui-border dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary text-ui-text dark:text-slate-50 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:cursor-not-allowed"
        />
    </div>
);

export const DoctorProfilePage: React.FC<{
  currentProfile: DoctorProfile;
  onSave: (newProfile: DoctorProfile) => void;
  isSaving: boolean;
}> = ({ currentProfile, onSave, isSaving }) => {
  const [profile, setProfile] = useState(currentProfile);
  const [isCopied, setIsCopied] = useState(false);
  const { t } = useI18n();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(profile);
  };
  
  const handleCopyCode = () => {
    navigator.clipboard.writeText(profile.doctorCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in p-4 sm:p-0">
        <form onSubmit={handleSave} className="bg-ui-card dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-lg border border-ui-border dark:border-slate-700">
            <div className="text-center mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-ui-text dark:text-slate-50">
                    {t('doctorProfileTitle')}
                </h1>
                <p className="text-ui-text-secondary dark:text-slate-400 mt-2">
                    {t('doctorProfileSubtitle')}
                </p>
            </div>
            
            <div className="space-y-6">
                <InputField label={t('authFullName')} name="fullName" value={profile.fullName} onChange={handleInputChange} placeholder={t('authFullNamePlaceholder')} required/>
                <InputField label={t('authSpecialization')} name="specialization" value={profile.specialization} onChange={handleInputChange} placeholder={t('authSpecializationPlaceholder')} />
                <InputField label={t('authPhoneNumber')} name="phoneNumber" value={profile.phoneNumber} onChange={handleInputChange} placeholder={t('doctorProfilePhonePlaceholder')}/>
                <InputField label={t('authUsername')} name="username" value={profile.username} onChange={()=>{}} placeholder="" disabled/>
                <InputField label={t('authMedicalId')} name="medicalRegistrationId" value={profile.medicalRegistrationId} onChange={()=>{}} placeholder="" disabled/>

                <div className="pt-4">
                    <label className="block text-sm font-medium text-ui-text-secondary dark:text-slate-300 mb-1">{t('doctorDashboardCodeTitle')}</label>
                    <div className="p-3 bg-slate-100 dark:bg-slate-900/50 rounded-lg flex items-center justify-between gap-4">
                        <p className="text-2xl font-bold font-mono text-brand-primary tracking-widest">{profile.doctorCode}</p>
                        <button type="button" onClick={handleCopyCode} title={t('doctorDashboardCopyCode')} className="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                            {isCopied ? <CheckIcon className="h-5 w-5 text-green-500"/> : <ClipboardIcon className="h-5 w-5 text-ui-text-secondary"/>}
                        </button>
                    </div>
                     <p className="text-xs text-ui-text-secondary dark:text-slate-400 mt-2">{t('doctorDashboardCodeSubtitle')}</p>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-ui-border dark:border-slate-700">
                 <button type="submit" disabled={isSaving} className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-brand-primary text-white font-semibold rounded-lg shadow-sm hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:bg-slate-400 disabled:cursor-not-allowed">
                    {isSaving ? <Spinner className="h-5 w-5"/> : <SaveIcon className="h-5 w-5"/>}
                    {t('save')} {t('changes')}
                </button>
            </div>
        </form>
    </div>
  );
};
