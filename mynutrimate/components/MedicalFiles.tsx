

import React, { useState, useEffect, useCallback } from 'react';
import type { FileObject } from '@supabase/storage-js';
import * as XLSX from 'xlsx';
import { supabase } from '../services/supabaseClient';
import { Spinner } from './Spinner';
import { FolderHeartIcon, UploadCloudIcon, EyeIcon, DownloadIcon, FileTextIcon, XIcon, AlertTriangleIcon } from './icons';
import { useI18n } from '../i18n';

interface MedicalFilesProps {
    userId: string;
    isDoctorView: boolean;
    userName?: string;
}

const FileCard: React.FC<{ file: FileObject; onView: (path: string) => void; onDownload: (path: string) => void; onDelete: (path: string) => void, isDoctorView: boolean }> = ({ file, onView, onDownload, onDelete, isDoctorView }) => {
    const { t } = useI18n();
    return (
        <div className="p-3 sm:p-4 rounded-lg border bg-slate-100 dark:bg-slate-900/50 border-ui-border dark:border-slate-700 flex justify-between items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-3 overflow-hidden">
                <FileTextIcon className="h-6 w-6 text-brand-primary flex-shrink-0" />
                <p className="font-medium text-ui-text dark:text-slate-200 truncate" title={file.name}>
                    {file.name}
                </p>
            </div>
            <div className="flex-shrink-0 flex items-center gap-1 sm:gap-2">
                <button onClick={() => onView(file.name)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700" title={t('filesView')}>
                    <EyeIcon className="h-5 w-5 text-ui-text-secondary" />
                </button>
                <button onClick={() => onDownload(file.name)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700" title={t('filesDownload')}>
                    <DownloadIcon className="h-5 w-5 text-ui-text-secondary" />
                </button>
                {!isDoctorView && (
                    <button onClick={() => onDelete(file.name)} className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50" title={t('filesDelete')}>
                        <XIcon className="h-5 w-5 text-red-500" />
                    </button>
                )}
            </div>
        </div>
    );
};

export const MedicalFiles: React.FC<MedicalFilesProps> = ({ userId, isDoctorView, userName }) => {
    const [files, setFiles] = useState<FileObject[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [viewingFile, setViewingFile] = useState<{ url: string; type: 'pdf' | 'image' | 'excel'; content?: any[][]; name: string; } | null>(null);
    const { t } = useI18n();
    
    const handleError = useCallback((err: unknown, context: 'fetch' | 'upload' | 'download' | 'delete' | 'view') => {
        let errorMessage = "An unknown error occurred.";
        if (err instanceof Error) {
            if (err.message?.toLowerCase().includes('bucket not found')) {
                errorMessage = t('filesConfigError');
            } else {
                errorMessage = err.message;
            }
        }
        console.error(`Error during ${context}:`, err);
        setError(errorMessage);
    }, [t]);

    const fetchFiles = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { data, error: listError } = await supabase.storage.from('medical-documents').list(userId, {
                limit: 100,
                offset: 0,
                sortBy: { column: 'created_at', order: 'desc' },
            });
            if (listError) throw listError;
            setFiles(data || []);
        } catch (err) {
            handleError(err, 'fetch');
        } finally {
            setIsLoading(false);
        }
    }, [userId, handleError]);

    useEffect(() => {
        fetchFiles();
    }, [fetchFiles]);
    
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];

        const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
        if (!allowedTypes.includes(file.type)) {
            setError(t('filesInvalidType'));
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            setError(t('filesTooLarge'));
            return;
        }

        setIsUploading(true);
        setError(null);
        try {
            const sanitizedFileName = file.name.replace(/[^\w.-]/g, '_');

            const { error: uploadError } = await supabase.storage
                .from('medical-documents')
                .upload(`${userId}/${sanitizedFileName}`, file, { upsert: true });
            if (uploadError) throw uploadError;
            await fetchFiles();
        } catch (err) {
            handleError(err, 'upload');
        } finally {
            setIsUploading(false);
            e.target.value = '';
        }
    };
    
    const handleFileView = async (fileName: string) => {
        setError(null);
        const fileExtension = fileName.split('.').pop()?.toLowerCase();
        
        try {
            if (fileExtension === 'pdf' || ['png', 'jpg', 'jpeg'].includes(fileExtension!)) {
                const { data, error: signError } = await supabase.storage
                    .from('medical-documents')
                    .createSignedUrl(`${userId}/${fileName}`, 60);
                if (signError) throw signError;
                
                setViewingFile({ 
                    url: data.signedUrl, 
                    type: fileExtension === 'pdf' ? 'pdf' : 'image', 
                    name: fileName 
                });

            } else if (['xlsx', 'xls'].includes(fileExtension!)) {
                 const { data, error: downloadError } = await supabase.storage.from('medical-documents').download(`${userId}/${fileName}`);
                 if (downloadError) throw downloadError;
                 const arrayBuffer = await data.arrayBuffer();
                 const workbook = XLSX.read(arrayBuffer, { type: 'buffer' });
                 const sheetName = workbook.SheetNames[0];
                 const worksheet = workbook.Sheets[sheetName];
                 const jsonData = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
                 setViewingFile({ url: '', type: 'excel', content: jsonData, name: fileName });
            } else {
                await handleFileDownload(fileName);
            }
        } catch(err) {
            handleError(err, 'view');
        }
    };

    const handleFileDownload = async (fileName: string) => {
        setError(null);
        try {
            const { data, error: downloadError } = await supabase.storage.from('medical-documents').download(`${userId}/${fileName}`);
            if (downloadError) throw downloadError;
            const url = URL.createObjectURL(data);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            handleError(err, 'download');
        }
    };
    
    const handleFileDelete = async (fileName: string) => {
        if (!window.confirm(t('filesDeleteConfirm', { fileName }))) return;
        setError(null);
        try {
            const { error } = await supabase.storage.from('medical-documents').remove([`${userId}/${fileName}`]);
            if (error) throw error;
            await fetchFiles();
        } catch (err) {
            handleError(err, 'delete');
        }
    };

    const FileViewerModal = () => {
        if (!viewingFile) return null;

        const renderContent = () => {
            switch (viewingFile.type) {
                case 'pdf':
                    return <iframe src={viewingFile.url} title={t('filesPdfViewerTitle')} className="w-full h-full border-none" />;
                case 'image':
                    return <div className="w-full h-full flex items-center justify-center p-4"><img src={viewingFile.url} alt={t('filesImageAlt')} className="max-w-full max-h-full object-contain" /></div>;
                case 'excel':
                    return (
                        <div className="p-4 overflow-auto h-full">
                            <table className="w-full text-left border-collapse text-sm">
                                <thead className="bg-slate-200 dark:bg-slate-700 sticky top-0 z-10">
                                    <tr>
                                        {viewingFile.content?.[0]?.map((header, i) => <th key={i} className="p-2 border border-slate-300 dark:border-slate-600 font-semibold">{header}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {viewingFile.content?.slice(1).map((row, i) => (
                                        <tr key={i} className="odd:bg-slate-50 even:bg-white dark:odd:bg-slate-800/50 dark:even:bg-slate-800">
                                            {row.map((cell, j) => <td key={j} className="p-2 border border-slate-200 dark:border-slate-700">{cell}</td>)}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    );
                default:
                    return null;
            }
        };

        return (
            <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50 animate-fade-in p-4">
                <div className="w-full h-full max-w-5xl max-h-[90vh] bg-ui-card dark:bg-slate-800 rounded-lg shadow-2xl flex flex-col">
                    <div className="flex justify-between items-center p-2 border-b border-ui-border dark:border-slate-600 flex-shrink-0">
                        <p className="font-semibold ml-2 truncate text-ui-text dark:text-slate-200" title={viewingFile.name}>{viewingFile.name}</p>
                        <button onClick={() => setViewingFile(null)} className="p-2 rounded-full text-ui-text-secondary dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700" aria-label={t('filesCloseViewer')}><XIcon className="h-6 w-6" /></button>
                    </div>
                    <div className="flex-grow w-full h-full overflow-hidden">
                        {renderContent()}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full max-w-3xl mx-auto animate-fade-in space-y-6">
            {viewingFile && <FileViewerModal />}
            <div className="text-center">
                <h1 className="text-3xl font-bold text-ui-text dark:text-slate-50 flex items-center justify-center gap-3">
                    <FolderHeartIcon className="h-8 w-8 text-brand-primary" />
                    {isDoctorView ? t('filesDoctorTitle', { name: userName }) : t('filesPatientTitle')}
                </h1>
                <p className="text-ui-text-secondary dark:text-slate-400">{t('filesSubtitle')}</p>
            </div>
            
            {!isDoctorView && (
                 <div className="p-4 sm:p-6 bg-ui-card dark:bg-slate-800 rounded-xl shadow-lg border border-ui-border dark:border-slate-700">
                    <h2 className="text-xl font-semibold text-center mb-4">{t('filesUploadTitle')}</h2>
                    <label htmlFor="file-upload" className="relative block w-full rounded-lg border-2 border-dashed border-ui-border dark:border-slate-600 p-8 text-center cursor-pointer hover:border-brand-primary transition-colors">
                        <UploadCloudIcon className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" />
                        <span className="mt-2 block text-sm font-semibold text-brand-primary">
                            {isUploading ? t('filesUploading') : t('filesClickToSelect')}
                        </span>
                        <span className="block text-xs text-ui-text-secondary dark:text-slate-400">{t('filesFormats')}</span>
                        <input
                          id="file-upload"
                          type="file"
                          className="sr-only"
                          accept=".pdf,.png,.jpg,.jpeg,.xlsx,.xls"
                          onChange={handleFileUpload}
                          disabled={isUploading}
                        />
                    </label>
                    {isUploading && <div className="flex justify-center mt-4"><Spinner /></div>}
                </div>
            )}

            <div className="bg-ui-card dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-lg border border-ui-border dark:border-slate-700">
                 <h2 className="text-xl font-bold text-ui-text dark:text-slate-100 mb-4">{t('filesStoredCount', { count: files.length })}</h2>
                {isLoading ? (
                    <div className="flex justify-center p-8"><Spinner /></div>
                ) : error ? (
                    <div className="p-4 bg-red-100 dark:bg-red-900/50 rounded-lg text-center">
                        <AlertTriangleIcon className="h-8 w-8 text-red-500 mx-auto mb-2" />
                        <p className="text-red-700 dark:text-red-200 font-semibold">{t('error')}</p>
                        <p className="text-red-600 dark:text-red-300 text-sm">{error}</p>
                    </div>
                ) : files.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-ui-text-secondary dark:text-slate-400">{isDoctorView ? t('filesEmptyDoctor') : t('filesEmptyPatient')}</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                       {files.map(file => (
                           <FileCard key={file.id} file={file} onView={handleFileView} onDownload={handleFileDownload} onDelete={handleFileDelete} isDoctorView={isDoctorView} />
                       ))}
                    </div>
                )}
            </div>
        </div>
    );
};
