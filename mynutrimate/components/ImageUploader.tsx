import React, { useState, useCallback, useRef } from 'react';
import { UploadCloudIcon, CameraIcon } from './icons';
import { useI18n } from '../i18n';

interface ImageUploaderProps {
  onFileSelect: (file: File | null) => void;
  disabled: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onFileSelect, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { t } = useI18n();

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onFileSelect(file);
      } else {
        alert(t('uploaderDropError'));
      }
      e.dataTransfer.clearData();
    }
  }, [onFileSelect, disabled, t]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        onFileSelect(e.target.files[0]);
    }
    // Reset the input value to allow selecting the same file again
    e.target.value = '';
  };

  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  const uploaderClass = `relative block w-full max-w-lg mx-auto rounded-lg border-2 border-dashed p-12 text-center transition-all duration-300
    ${disabled ? 'cursor-not-allowed bg-slate-100 dark:bg-slate-800/50' : 'hover:border-brand-primary'}
    ${isDragging ? 'border-brand-primary bg-brand-accent/10' : 'border-ui-border dark:border-slate-600'}`;

  return (
    <div className="flex flex-col items-center gap-4">
      <div 
        className={uploaderClass}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          className="sr-only"
          accept="image/*"
          onChange={handleFileChange}
          disabled={disabled}
        />
        <label htmlFor="file-upload" className={disabled ? 'cursor-not-allowed' : 'cursor-pointer'}>
          <UploadCloudIcon className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" />
          <span className="mt-2 block text-sm font-semibold text-brand-primary">
            {t('uploaderClick')}
          </span>
          <span className="block text-xs text-ui-text-secondary dark:text-slate-400">{t('uploaderDrag')}</span>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">{t('uploaderFormats')}</p>
        </label>
      </div>

       {/* Hidden input for camera access */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={cameraInputRef}
        onChange={handleFileChange}
        className="sr-only"
        disabled={disabled}
      />

      <div className="flex items-center gap-2">
        <hr className="w-24 border-ui-border dark:border-slate-700"/>
        <span className="text-ui-text-secondary dark:text-slate-400 font-semibold">{t('uploaderOr')}</span>
        <hr className="w-24 border-ui-border dark:border-slate-700"/>
      </div>
       <button 
          onClick={handleCameraClick}
          disabled={disabled}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-secondary transition-colors disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed"
        >
          <CameraIcon className="h-5 w-5" />
          {t('uploaderCamera')}
        </button>
    </div>
  );
};
