

import React, { useState } from 'react';
import type { UserProfile, View, Database } from '../types';
import { analyzePrescription } from '../services/geminiService';
import { supabase } from '../services/supabaseClient';
import { ImageUploader } from './ImageUploader';
import { Spinner } from './Spinner';
import { AlertTriangleIcon, FileTextIcon, SaveIcon, SparklesIcon } from './icons';
import { useI18n } from '../i18n';

interface PrescriptionAnalysisProps {
  userProfile: UserProfile;
  onProfileUpdate: () => void;
  setView: (view: View) => void;
}

interface ParsedPrescription {
    diagnoses: string[];
    medications: { name: string; dosage: string }[];
}

export const PrescriptionAnalysis: React.FC<PrescriptionAnalysisProps> = ({ userProfile, onProfileUpdate, setView }) => {
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [rawText, setRawText] = useState<string>('');
    const [parsedResult, setParsedResult] = useState<ParsedPrescription | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const { t, languageName } = useI18n();

    const handleFileSelect = (file: File | null) => {
        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                setImagePreview(reader.result as string);
                handleAnalysis(reader.result as string, '');
            };
        }
    };
    
    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setRawText(e.target.value);
    };

    const handleAnalysis = async (base64Image: string | null, text: string) => {
        setIsLoading(true);
        setError(null);
        setParsedResult(null);
        try {
            const result = await analyzePrescription(base64Image, text, languageName);
            setParsedResult(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleTextAnalysis = () => {
        if(rawText.trim()){
            setImagePreview(null);
            handleAnalysis(null, rawText);
        }
    }
    
    const handleSaveToProfile = async () => {
        if (!parsedResult) return;
        setIsSaving(true);
        setError(null);

        const diagnosesText = parsedResult.diagnoses.length > 0 ? `Diagnoses: ${parsedResult.diagnoses.join(', ')}.` : '';
        const medsText = parsedResult.medications.length > 0 ? `Medications: ${parsedResult.medications.map(m => `${m.name} (${m.dosage})`).join(', ')}.` : '';
        const newMedicalHistory = [userProfile.medicalHistory, diagnosesText, medsText].filter(Boolean).join('\n');

        const updatePayload = { medical_history: newMedicalHistory };

        const { error: updateError } = await supabase
            .from('profiles')
            .update(updatePayload)
            .eq('id', userProfile.id);

        if (updateError) {
            setError(`Failed to update profile: ${updateError.message}`);
        } else {
            await onProfileUpdate();
            alert(t('prescriptionSaveSuccess'));
            setView('dashboard');
        }
        setIsSaving(false);
    };

    return (
        <div className="w-full max-w-4xl mx-auto animate-fade-in space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-ui-text dark:text-slate-50">{t('prescriptionTitle')}</h1>
                <p className="text-ui-text-secondary dark:text-slate-400 max-w-2xl mx-auto">{t('prescriptionSubtitle')}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-ui-text dark:text-slate-100">{t('prescriptionUploadOrPaste')}</h2>
                    <ImageUploader onFileSelect={handleFileSelect} disabled={isLoading} />
                    <textarea 
                        value={rawText}
                        onChange={handleTextChange}
                        placeholder={t('prescriptionTextPlaceholder')}
                        rows={6}
                        className="w-full p-3 bg-slate-100 dark:bg-slate-700 border border-ui-border dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                        disabled={isLoading}
                    />
                    <button 
                        onClick={handleTextAnalysis}
                        disabled={isLoading || !rawText.trim()}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-secondary transition-colors disabled:bg-slate-400"
                    >
                        <SparklesIcon className="h-5 w-5"/>
                        {t('prescriptionAnalyzeText')}
                    </button>
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-ui-text dark:text-slate-100">{t('prescriptionAiResult')}</h2>
                     <div className="bg-ui-card dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-ui-border dark:border-slate-700 min-h-[300px] flex flex-col justify-between">
                       {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-full">
                                <Spinner />
                                <p className="mt-2">{t('prescriptionAnalyzing')}</p>
                            </div>
                        ) : error ? (
                            <div className="text-red-500">{error}</div>
                        ) : parsedResult ? (
                            <div className="space-y-4 animate-fade-in">
                                <div>
                                    <h3 className="font-bold text-ui-text dark:text-slate-100">{t('prescriptionDiagnoses')}</h3>
                                    {parsedResult.diagnoses.length > 0 ? (
                                        <ul className="list-disc list-inside text-sm text-ui-text-secondary dark:text-slate-300">
                                            {parsedResult.diagnoses.map((d, i) => <li key={i}>{d}</li>)}
                                        </ul>
                                    ): <p className="text-sm text-ui-text-secondary dark:text-slate-400">{t('prescriptionNoneFound')}</p>}
                                </div>
                                <div>
                                    <h3 className="font-bold text-ui-text dark:text-slate-100">{t('prescriptionMedications')}</h3>
                                    {parsedResult.medications.length > 0 ? (
                                        <ul className="list-disc list-inside text-sm text-ui-text-secondary dark:text-slate-300">
                                            {parsedResult.medications.map((m, i) => <li key={i}>{m.name} <span className="text-xs">({m.dosage})</span></li>)}
                                        </ul>
                                     ): <p className="text-sm text-ui-text-secondary dark:text-slate-400">{t('prescriptionNoneFound')}</p>}
                                </div>
                                 <button
                                    onClick={handleSaveToProfile}
                                    disabled={isSaving}
                                    className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:bg-slate-400"
                                >
                                    {isSaving ? <Spinner className="h-5 w-5"/> : <SaveIcon className="h-5 w-5"/>}
                                    {t('prescriptionSaveToHistory')}
                                </button>
                            </div>
                        ) : (
                            <div className="text-center text-ui-text-secondary dark:text-slate-400 m-auto">
                                <FileTextIcon className="h-12 w-12 mx-auto mb-2"/>
                                {t('prescriptionResultsPlaceholder')}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};