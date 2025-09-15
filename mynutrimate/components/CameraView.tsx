import React, { useRef, useEffect, useCallback, useState } from 'react';
import { CameraIcon, XIcon } from './icons';
import { useI18n } from '../i18n';

interface CameraViewProps {
  onCapture: (dataUri: string) => void;
  onClose: () => void;
}

export const CameraView: React.FC<CameraViewProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [focusIndicator, setFocusIndicator] = useState<{x: number, y: number} | null>(null);
  const { t } = useI18n();

  const startCamera = useCallback(async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: "environment" } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();

          // Attempt to set continuous focus mode on startup
          const [track] = stream.getVideoTracks();
          if (track) {
            const capabilities = track.getCapabilities();
            if ((capabilities as any).focusMode?.includes('continuous')) {
              await track.applyConstraints({ focusMode: 'continuous' } as any);
            }
          }
        }
      } catch (err) {
        console.error("Error accessing camera: ", err);
        alert(t('cameraError'));
        onClose();
      }
    }
  }, [onClose, t]);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  }, []);
  
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0, videoRef.current.videoWidth, videoRef.current.videoHeight);
        const dataUri = canvasRef.current.toDataURL('image/jpeg');
        onCapture(dataUri);
        stopCamera();
      }
    }
  };

  const handleVideoClick = (event: React.MouseEvent<HTMLVideoElement>) => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const rect = video.getBoundingClientRect();

    // Show focus indicator at click position
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    setFocusIndicator({ x, y });
    setTimeout(() => setFocusIndicator(null), 1000);

    // Trigger autofocus
    if (video.srcObject) {
        const stream = video.srcObject as MediaStream;
        const track = stream.getVideoTracks()[0];
        if (!track) return;
        
        const capabilities = track.getCapabilities();

        // Use 'single-shot' for tap-to-focus if available, otherwise fallback to 'continuous'.
        const focusMode = (capabilities as any).focusMode?.includes('single-shot') 
            ? 'single-shot' 
            : (capabilities as any).focusMode?.includes('continuous') 
            ? 'continuous' 
            : null;

        if (focusMode) {
            track.applyConstraints({ focusMode } as any)
                .catch(e => console.error("Failed to apply focus mode:", e));
        }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50 animate-fade-in">
      <div className="relative w-full h-full">
        <video 
            ref={videoRef} 
            className="w-full h-full object-cover" 
            playsInline 
            onClick={handleVideoClick}
            style={{ cursor: 'pointer' }}
        />
        {focusIndicator && (
            <div 
                className="absolute border-2 border-yellow-400 rounded-lg w-20 h-20 animate-focus-pulse pointer-events-none"
                style={{ 
                    left: `${focusIndicator.x - 40}px`, 
                    top: `${focusIndicator.y - 40}px`,
                }}
            />
        )}
      </div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      <button 
        onClick={onClose} 
        className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-75"
        aria-label={t('cameraClose')}
      >
        <XIcon className="h-8 w-8" />
      </button>

      <div className="absolute bottom-8 flex items-center justify-center">
        <button 
            onClick={handleCapture} 
            className="p-4 bg-white rounded-full shadow-lg group"
            aria-label={t('cameraCapture')}
        >
            <CameraIcon className="h-10 w-10 text-brand-primary group-hover:text-brand-secondary transition-colors" />
        </button>
      </div>
    </div>
  );
};
