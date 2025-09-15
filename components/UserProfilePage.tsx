

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import type { UserProfile, Gender, DoctorConnection, ActivityLevel, SafeFood, RestrictedFood } from '../types';
import { SaveIcon, UserIcon, PhoneIcon, CheckIcon, ClipboardIcon, CheckCircleIcon, AlertTriangleIcon } from './icons';
import { connectUserToDoctor, disconnectUserFromDoctor, getMyDoctorConnections } from '../services/doctorService';
import { Spinner } from './Spinner';
import { calculateAge, getFormattedAgeString, calculateBmi, getBmiStatus } from '../utils/helpers';
import { useI18n } from '../i18n';

interface UserProfilePageProps {
  currentProfile: UserProfile;
  onSave: (newProfile: UserProfile, oldProfile: UserProfile) => void;
  isSetupMode?: boolean;
  isSaving: boolean;
  safeFoods?: SafeFood[];
  restrictedFoods?: RestrictedFood[];
}

const InputField: React.FC<{ 
    label: string; 
    type?: string; 
    value: string | number | null; 
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void; 
    placeholder: string;
    name: string;
    required?: boolean;
    as?: 'textarea';
}> = ({ label, type, value, onChange, placeholder, name, required = false, as }) => (
    <div>
        <label className="block text-sm font-medium text-ui-text-secondary dark:text-slate-300 mb-1">{label}</label>
        {as === 'textarea' ? (
             <textarea
                name={name}
                value={value ?? ''}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                rows={4}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-ui-border dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary text-ui-text dark:text-slate-50"
            />
        ) : (
            <input
                name={name}
                type={type || 'text'}
                value={value ?? ''}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-ui-border dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary text-ui-text dark:text-slate-50"
            />
        )}
    </div>
);

const RadioGroup: React.FC<{
    label: string, 
    name: string, 
    options: { value: string, label: string }[], 
    selectedValue: string | null, 
    onChange: (value: string) => void
}> = ({ label, name, options, selectedValue, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-ui-text-secondary dark:text-slate-300 mb-2">{label}</label>
        <div className="flex flex-wrap gap-2">
            {options.map(option => (
                <button
                    key={option.value}
                    type="button"
                    name={name}
                    onClick={() => onChange(option.value)}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg capitalize transform hover:scale-105 ${
                        selectedValue === option.value
                            ? 'bg-brand-primary text-white shadow-md'
                            : 'bg-slate-200 dark:bg-slate-700 text-ui-text dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600'
                    }`}
                >
                    {option.label}
                </button>
            ))}
        </div>
    </div>
);

const DoctorConnect: React.FC<{ userId: string }> = ({ userId }) => {
    const [connections, setConnections] = useState<DoctorConnection[]>([]);
    const [doctorCode, setDoctorCode] = useState('');
    const [doctorFirstName, setDoctorFirstName] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const { t } = useI18n();

    const fetchConnections = useCallback(async () => {
        setIsLoading(true);
        const { data, error } = await getMyDoctorConnections(userId);
        if (error) setError(t('profileFetchConnectionsError'));
        else if (data) setConnections(data as any);
        setIsLoading(false);
    }, [userId, t]);

    useEffect(() => { fetchConnections(); }, [fetchConnections]);
    
    const handleConnect = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setMessage(null);
        const { data, error: connectError } = await connectUserToDoctor(userId, doctorCode, doctorFirstName);
        if (connectError) {
            setError(t(connectError as any) || connectError);
        } else if (data?.success) {
            setMessage(t('profileConnectSuccess'));
            setDoctorCode('');
            setDoctorFirstName('');
            await fetchConnections();
        }
        setIsLoading(false);
    };

    const handleDisconnect = async (connectionId: number) => {
        if (!window.confirm(t('profileDisconnectConfirm'))) return;
        setIsLoading(true);
        setError(null);
        const { data, error } = await disconnectUserFromDoctor(connectionId);
        if (error) {
            setError(t(error as any) || error);
        } else if (data?.success) {
            await fetchConnections();
        }
        setIsLoading(false);
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-ui-text dark:text-slate-100">{t('profileDoctorConnect')}</h3>
            <p className="text-sm text-ui-text-secondary dark:text-slate-400">
               {t('profileDoctorConnectSubtitle')}
            </p>
            
            {isLoading && !connections.length ? <Spinner /> : null}

            {connections.length > 0 && (
                <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-ui-text-secondary dark:text-slate-400">{t('profileConnectedWith')}</h4>
                    {connections.map(conn => (
                        <div key={conn.id} className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                            <p className="font-semibold text-ui-text dark:text-slate-200">{conn.doctors?.full_name}</p>
                            <button onClick={() => handleDisconnect(conn.id)} disabled={isLoading} className="px-3 py-1 text-xs font-semibold text-red-600 bg-red-100 dark:text-red-200 dark:bg-red-900/40 rounded-md hover:bg-red-200 dark:hover:bg-red-900/60">
                                {t('profileDisconnect')}
                            </button>
                        </div>
                    ))}
                </div>
            )}
            
            <form onSubmit={handleConnect} className="space-y-3">
                <InputField label={t('profileDoctorFirstName')} type="text" name="doctorFirstName" value={doctorFirstName} onChange={(e) => setDoctorFirstName(e.target.value)} placeholder={t('profileDoctorFirstNamePlaceholder')} required />
                <InputField label={t('profileDoctorCode')} type="text" name="doctorCode" value={doctorCode} onChange={(e) => setDoctorCode(e.target.value.toUpperCase())} placeholder={t('profileDoctorCodePlaceholder')} required />
                <button type="submit" disabled={isLoading || !doctorCode || !doctorFirstName} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-slate-400 disabled:cursor-not-allowed">
                    {isLoading ? <Spinner className="h-5 w-5" /> : t('profileConnect')}
                </button>
                {error && <p className="text-sm text-red-500">{error}</p>}
                {message && <p className="text-sm text-green-500">{message}</p>}
            </form>
        </div>
    );
};


export const UserProfilePage: React.FC<UserProfilePageProps> = ({ currentProfile, onSave, isSetupMode = false, isSaving, safeFoods = [], restrictedFoods = [] }) => {
    const [profile, setProfile] = useState(currentProfile);
    const { t } = useI18n();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const isNumeric = type === 'number';
        setProfile(prev => ({
          ...prev,
          [name]: isNumeric ? (value === '' ? null : parseFloat(value)) : value
        }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(profile, currentProfile);
    };

    const age = useMemo(() => calculateAge(profile.dob), [profile.dob]);
    const bmi = useMemo(() => calculateBmi(profile.weightKg, profile.heightCm), [profile.weightKg, profile.heightCm]);
    const bmiStatus = useMemo(() => getBmiStatus(bmi), [bmi]);

    const genderOptions = [
        {value: 'female', label: t('female')}, 
        {value: 'male', label: t('male')}, 
        {value: 'other', label: t('other')}
    ];
    
    const activityOptions = [
        {value: 'sedentary', label: t('sedentary')},
        {value: 'lightly_active', label: t('lightly_active')},
        {value: 'active', label: t('active')},
        {value: 'very_active', label: t('very_active')}
    ];

    return (
        <div className="w-full max-w-4xl mx-auto animate-fade-in space-y-8">
            <div className="text-center">
                <h1 className="text-2xl sm:text-3xl font-bold text-ui-text dark:text-slate-50">
                    {isSetupMode ? t('profileWelcome') : t('profileTitle')}
                </h1>
                <p className="text-ui-text-secondary dark:text-slate-400 mt-2">
                    {isSetupMode ? t('profileWelcomeSubtitle') : t('profileUpdateSubtitle')}
                </p>
            </div>

            <form onSubmit={handleSave} className="space-y-8">
                {/* Personal Details Card */}
                <div className="bg-ui-card dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-lg border border-ui-border dark:border-slate-700">
                    <h2 className="text-xl font-bold text-ui-text dark:text-slate-100 mb-6">{t('profilePersonalDetails')}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <InputField label={t('authFullName')} name="fullName" value={profile.fullName} onChange={handleInputChange} placeholder={t('profileFullNamePlaceholder')} required/>
                        <InputField label={t('authUsername')} name="username" value={profile.username} onChange={handleInputChange} placeholder={t('profileUsernamePlaceholder')} required/>
                        <InputField label={t('authPhoneNumber')} name="phoneNumber" type="tel" value={profile.phoneNumber} onChange={handleInputChange} placeholder={t('profilePhonePlaceholder')} />
                        <InputField label={t('profileDob')} name="dob" type="date" value={profile.dob} onChange={handleInputChange} placeholder="YYYY-MM-DD" required />
                        <RadioGroup label={t('profileGender')} name="gender" options={genderOptions} selectedValue={profile.gender} onChange={(v) => handleSelectChange('gender', v)} />
                    </div>
                </div>

                {/* Health Metrics Card */}
                <div className="bg-ui-card dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-lg border border-ui-border dark:border-slate-700">
                    <h2 className="text-xl font-bold text-ui-text dark:text-slate-100 mb-6">{t('profileHealthMetrics')}</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <InputField label={t('profileHeight')} name="heightCm" type="number" value={profile.heightCm} onChange={handleInputChange} placeholder={t('profileHeightPlaceholder')} required/>
                        <InputField label={t('profileWeight')} name="weightKg" type="number" value={profile.weightKg} onChange={handleInputChange} placeholder={t('profileWeightPlaceholder')} required/>
                        <div className="p-4 bg-slate-100 dark:bg-slate-900/50 rounded-lg md:col-span-2">
                            <h3 className="text-sm font-medium text-ui-text-secondary dark:text-slate-300 mb-2">{t('profileLiveBmi')}</h3>
                            {bmi && bmiStatus ? (
                                <div className="text-center">
                                    <p className={`text-4xl font-bold ${bmiStatus.colorClass}`}>{bmi.toFixed(1)}</p>
                                    <p className={`font-semibold ${bmiStatus.colorClass}`}>{t(bmiStatus.status)}</p>
                                </div>
                            ) : (
                                <p className="text-center text-ui-text-secondary dark:text-slate-400">{t('profileEnterBmi')}</p>
                            )}
                        </div>
                        <RadioGroup 
                            label={t('profileActivityLevel')} 
                            name="activityLevel" 
                            options={activityOptions} 
                            selectedValue={profile.activityLevel} 
                            onChange={(v) => handleSelectChange('activityLevel', v)}
                        />
                         <InputField 
                            label={t('profileMedicalHistory')} 
                            name="medicalHistory"
                            as="textarea"
                            value={profile.medicalHistory} 
                            onChange={handleInputChange} 
                            placeholder={t('profileMedicalHistoryPlaceholder')}
                        />
                    </div>
                </div>

                <button type="submit" disabled={isSaving} className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-brand-primary text-white font-semibold rounded-lg shadow-sm hover:bg-brand-secondary disabled:bg-slate-400 disabled:cursor-not-allowed">
                    {isSaving ? <Spinner className="h-5 w-5" /> : <SaveIcon className="h-5 w-5" />}
                    {isSetupMode ? t('profileSaveContinue') : t('profileSaveChanges')}
                </button>
            </form>

            {!isSetupMode && (
                <>
                    <div className="bg-ui-card dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-lg border border-ui-border dark:border-slate-700">
                        <DoctorConnect userId={profile.id} />
                    </div>
                    
                    {(safeFoods.length > 0 || restrictedFoods.length > 0) && (
                        <div className="bg-ui-card dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-lg border border-ui-border dark:border-slate-700">
                            <h2 className="text-2xl font-bold text-ui-text dark:text-slate-100 mb-6 text-center">{t('profileGuidelinesTitle')}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Approved Foods */}
                                <div>
                                    <h3 className="text-xl font-semibold text-green-600 dark:text-green-400 mb-4 flex items-center gap-2">
                                        <CheckCircleIcon className="h-6 w-6" />
                                        {t('profileApprovedFoods')}
                                    </h3>
                                    <div className="space-y-2">
                                        {safeFoods.length > 0 ? safeFoods.map(food => (
                                            <div key={food.id} className="p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                                                <p className="font-semibold text-ui-text dark:text-slate-200">{food.food_name}</p>
                                                {food.brand_name && <p className="text-xs text-ui-text-secondary dark:text-slate-400">{t('profileBrand')} {food.brand_name}</p>}
                                            </div>
                                        )) : <p className="text-sm text-ui-text-secondary dark:text-slate-400">{t('profileNoApproved')}</p>}
                                    </div>
                                </div>

                                {/* Restricted Foods */}
                                <div>
                                    <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
                                        <AlertTriangleIcon className="h-6 w-6" />
                                        {t('profileRestrictedFoods')}
                                    </h3>
                                    <div className="space-y-2">
                                        {restrictedFoods.length > 0 ? restrictedFoods.map(food => (
                                            <div key={food.id} className="p-3 bg-red-100 dark:bg-red-900/40 rounded-lg border border-red-200 dark:border-red-800">
                                                <p className="font-semibold text-red-800 dark:text-red-200">{food.food_name}</p>
                                                {food.brand_name && <p className="text-xs text-red-700 dark:text-red-300">{t('profileBrand')} {food.brand_name}</p>}
                                                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                                                    <span className="font-semibold">{t('profileReason')}</span> {food.reason}
                                                </p>
                                            </div>
                                        )) : <p className="text-sm text-ui-text-secondary dark:text-slate-400">{t('profileNoRestricted')}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
