import React, { useRef, useState, useCallback } from 'react';
import { validateFaceInImage } from '../services/geminiService';

interface FaceScannerProps {
  onScanSuccess: (imageUrl: string) => void;
  onScanFailure: (reason: string) => void;
  buttonText?: string;
}

const FaceScanner: React.FC<FaceScannerProps> = ({ onScanSuccess, onScanFailure, buttonText = "Scan Face" }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreamActive(true);
      }
    } catch (err) {
      console.error("Camera error:", err);
      onScanFailure("Could not access camera. Please allow permissions.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setIsStreamActive(false);
    }
  };

  const captureAndValidate = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsScanning(true);
    const context = canvasRef.current.getContext('2d');
    if (context) {
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      const imageData = canvasRef.current.toDataURL('image/jpeg');

      try {
        const result = await validateFaceInImage(imageData);
        if (result.valid) {
          onScanSuccess(imageData);
          stopCamera();
        } else {
          onScanFailure(result.message);
        }
      } catch (e) {
        onScanFailure("Validation error.");
      }
    }
    setIsScanning(false);
  }, [onScanSuccess, onScanFailure]);

  React.useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 p-4 border rounded-xl bg-gray-50 shadow-inner">
      <div className="relative w-full max-w-sm aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
        {!isStreamActive ? (
          <button 
            onClick={startCamera}
            className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition"
          >
            Start Camera
          </button>
        ) : (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover transform scale-x-[-1]" // Mirror effect
          />
        )}
        <canvas ref={canvasRef} className="hidden" />
        
        {isScanning && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold">
            <div className="animate-pulse">Processing AI Verification...</div>
          </div>
        )}
      </div>

      {isStreamActive && (
        <button
          onClick={captureAndValidate}
          disabled={isScanning}
          className={`w-full max-w-sm py-3 rounded-lg font-bold text-white shadow-lg 
            ${isScanning ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
        >
          {isScanning ? 'Scanning...' : buttonText}
        </button>
      )}
    </div>
  );
};

export default FaceScanner;