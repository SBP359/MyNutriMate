
import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { generateDoctorCode } from '../services/doctorService';
import { AppLogo, FooterBanner } from './icons';
import { Spinner } from './Spinner';
import type { UserRole } from '../types';
import { useI18n } from '../i18n';

export const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // Doctor-specific fields
  const [medicalId, setMedicalId] = useState('');
  const [specialization, setSpecialization] = useState('');

  const [isLoginView, setIsLoginView] = useState(true);
  const [authRole, setAuthRole] = useState<UserRole>('patient');
  
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  
  const { t } = useI18n();

  const handleAuthAction = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isLoginView) { // --- LOGIN ---
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

      } else { // --- SIGNUP ---
        const options = authRole === 'patient'
          ? {
              data: {
                role: 'patient',
                username: username,
                full_name: fullName,
                phone_number: phoneNumber,
              }
            }
          : {
              data: {
                role: 'doctor',
                username: username,
                full_name: fullName,
                phone_number: phoneNumber,
                medical_registration_id: medicalId,
                specialization: specialization,
                doctor_code: generateDoctorCode(),
              }
            };
        
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options,
        });

        if (error) throw error;
        
        setMessage(t('authCheckEmail'));
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };
  
  const AuthRoleToggle = () => (
    <div className="flex justify-center mb-6 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg shadow-sm border border-ui-border dark:border-slate-700">
        <button
            type="button"
            onClick={() => setAuthRole('patient')}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors capitalize w-full ${
                authRole === 'patient'
                ? 'bg-brand-primary text-white shadow'
                : 'text-ui-text-secondary hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
        >
            {t('patient')}
        </button>
        <button
            type="button"
            onClick={() => setAuthRole('doctor')}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors capitalize w-full ${
                authRole === 'doctor'
                ? 'bg-brand-primary text-white shadow'
                : 'text-ui-text-secondary hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
        >
            {t('doctor')}
        </button>
    </div>
  );


  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-ui-bg dark:bg-slate-900 p-4 animate-fade-in">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
            <AppLogo className="h-10 sm:h-12" />
        </div>
        <div className="bg-ui-card dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-lg border border-ui-border dark:border-slate-700">
          
          <AuthRoleToggle />
          
          <h2 className="text-2xl font-bold text-center text-ui-text dark:text-slate-100 mb-2">
            {isLoginView ? t('authWelcome') : (authRole === 'patient' ? t('authCreatePatientAccount') : t('authCreateDoctorAccount'))}
          </h2>
          <p className="text-center text-ui-text-secondary dark:text-slate-400 mb-6">
            {isLoginView ? t('authLoginContinue') : t('authSignUpStart')}
          </p>
          
          <form onSubmit={handleAuthAction} className="space-y-4">
            {!isLoginView && (
              <>
                <div>
                  <label className="block text-sm font-medium text-ui-text-secondary dark:text-slate-300 mb-1" htmlFor="username">{t('authUsername')}</label>
                  <input id="username" className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-ui-border dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary text-ui-text dark:text-slate-50" type="text" value={username} required placeholder={t('authUsernamePlaceholder')} onChange={(e) => setUsername(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ui-text-secondary dark:text-slate-300 mb-1" htmlFor="fullName">{t('authFullName')}</label>
                  <input id="fullName" className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-ui-border dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary text-ui-text dark:text-slate-50" type="text" value={fullName} required placeholder={t('authFullNamePlaceholder')} onChange={(e) => setFullName(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ui-text-secondary dark:text-slate-300 mb-1" htmlFor="phoneNumber">{t('authPhoneNumber')}</label>
                  <input id="phoneNumber" className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-ui-border dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary text-ui-text dark:text-slate-50" type="tel" value={phoneNumber} placeholder={t('authPhoneNumberPlaceholder')} onChange={(e) => setPhoneNumber(e.target.value)} />
                </div>
                 {authRole === 'doctor' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-ui-text-secondary dark:text-slate-300 mb-1" htmlFor="medicalId">{t('authMedicalId')}</label>
                      <input id="medicalId" className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-ui-border dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary text-ui-text dark:text-slate-50" type="text" value={medicalId} required placeholder={t('authMedicalIdPlaceholder')} onChange={(e) => setMedicalId(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ui-text-secondary dark:text-slate-300 mb-1" htmlFor="specialization">{t('authSpecialization')}</label>
                      <input id="specialization" className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-ui-border dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary text-ui-text dark:text-slate-50" type="text" value={specialization} placeholder={t('authSpecializationPlaceholder')} onChange={(e) => setSpecialization(e.target.value)} />
                    </div>
                  </>
                )}
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-ui-text-secondary dark:text-slate-300 mb-1" htmlFor="email">{t('authEmail')}</label>
              <input id="email" className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-ui-border dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary text-ui-text dark:text-slate-50" type="email" value={email} required placeholder={t('authEmailPlaceholder')} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-ui-text-secondary dark:text-slate-300 mb-1" htmlFor="password">{t('authPassword')}</label>
              <input id="password" className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-ui-border dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary text-ui-text dark:text-slate-50" type="password" value={password} required placeholder="••••••••" onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button type="submit" disabled={loading} className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:bg-slate-400 disabled:cursor-not-allowed">
              {loading ? <Spinner className="h-5 w-5"/> : (isLoginView ? t('authLogin') : t('authSignUp'))}
            </button>
          </form>

          {error && <p className="mt-4 text-center text-sm text-red-600 dark:text-red-400">{error}</p>}
          {message && <p className="mt-4 text-center text-sm text-green-600 dark:text-green-400">{message}</p>}

          <p className="mt-6 text-center text-sm">
            <button onClick={() => { setIsLoginView(!isLoginView); setError(null); setMessage(null); }} className="font-medium text-brand-primary hover:text-brand-secondary">
              {isLoginView ? t('authNeedAccount') : t('authHaveAccount')}
            </button>
          </p>
        </div>
        <footer className="w-full flex justify-center mt-8 py-4">
            <FooterBanner className="h-auto max-w-xs" />
        </footer>
      </div>
    </div>
  );
};
