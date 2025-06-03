
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, Upload, RotateCcw } from "lucide-react";

interface PhotoCaptureProps {
  onCapture: (photo: string) => void;
}

const PhotoCapture = ({ onCapture }: PhotoCaptureProps) => {
  const [capturedPhoto, setCapturedPhoto] = useState<string>('');
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = async () => {
    try {
      setIsCapturing(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Preferir câmera traseira
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Erro ao acessar a câmera:', error);
      setIsCapturing(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const dataURL = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedPhoto(dataURL);
        
        // Parar o stream da câmera
        const stream = video.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        setIsCapturing(false);
      }
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setCapturedPhoto(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const retakePhoto = () => {
    setCapturedPhoto('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const confirmPhoto = () => {
    onCapture(capturedPhoto);
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Foto dos Produtos
        </h2>
        <p className="text-gray-600">
          Tire uma foto dos produtos que você está retirando
        </p>
      </div>

      <Card className="p-8 rounded-2xl">
        {!capturedPhoto && !isCapturing && (
          <div className="text-center space-y-6">
            <div className="w-32 h-32 bg-primary-50 rounded-2xl mx-auto flex items-center justify-center">
              <Camera className="w-16 h-16 text-primary" />
            </div>
            
            <div className="space-y-4">
              <Button
                onClick={startCamera}
                className="w-full bg-primary hover:bg-primary-600 text-white rounded-xl h-12 text-lg font-medium"
              >
                <Camera className="w-5 h-5 mr-2" />
                Abrir Câmera
              </Button>
              
              <div className="text-center text-gray-500">ou</div>
              
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full rounded-xl h-12 text-lg font-medium"
              >
                <Upload className="w-5 h-5 mr-2" />
                Escolher da Galeria
              </Button>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        )}

        {isCapturing && (
          <div className="space-y-6">
            <div className="relative bg-black rounded-2xl overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full max-h-80 object-cover"
              />
            </div>
            
            <Button
              onClick={capturePhoto}
              className="w-full bg-primary hover:bg-primary-600 text-white rounded-xl h-12 text-lg font-medium"
            >
              <Camera className="w-5 h-5 mr-2" />
              Capturar Foto
            </Button>
          </div>
        )}

        {capturedPhoto && (
          <div className="space-y-6">
            <div className="relative bg-gray-100 rounded-2xl overflow-hidden">
              <img
                src={capturedPhoto}
                alt="Foto capturada"
                className="w-full max-h-80 object-cover"
              />
            </div>
            
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={retakePhoto}
                className="flex-1 rounded-xl h-12 text-lg font-medium"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Nova Foto
              </Button>
              
              <Button
                onClick={confirmPhoto}
                className="flex-1 bg-primary hover:bg-primary-600 text-white rounded-xl h-12 text-lg font-medium"
              >
                Confirmar
              </Button>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </Card>
    </div>
  );
};

export default PhotoCapture;
