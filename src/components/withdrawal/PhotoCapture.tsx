
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, Upload, RotateCcw, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PhotoCaptureProps {
  onCapture: (photo: string) => void;
}

const PhotoCapture = ({ onCapture }: PhotoCaptureProps) => {
  const [capturedPhoto, setCapturedPhoto] = useState<string>('');
  const [isCapturing, setIsCapturing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const startCamera = async () => {
    try {
      setIsCapturing(true);
      console.log('Requesting camera access...');
      
      // Enhanced camera constraints for better mobile compatibility
      const constraints = {
        video: {
          facingMode: { ideal: 'environment' }, // Prefer back camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Camera access granted');
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
        };
      }
    } catch (error) {
      console.error('Camera access error:', error);
      
      // More specific error handling
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          toast({
            title: "Permissão Negada",
            description: "Por favor, permita o acesso à câmera nas configurações do navegador",
            variant: "destructive",
          });
        } else if (error.name === 'NotFoundError') {
          toast({
            title: "Câmera não encontrada",
            description: "Nenhuma câmera foi encontrada no dispositivo",
            variant: "destructive",
          });
        } else if (error.name === 'NotSupportedError') {
          toast({
            title: "Não suportado",
            description: "Câmera não é suportada neste navegador",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erro de Câmera",
            description: `Erro ao acessar câmera: ${error.message}`,
            variant: "destructive",
          });
        }
      }
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
        
        // Stop camera stream
        const stream = video.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        setIsCapturing(false);
        
        console.log('Photo captured successfully');
        toast({
          title: "Foto Capturada",
          description: "Foto capturada com sucesso!",
        });
      }
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name, file.type, file.size);
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Arquivo Inválido",
          description: "Por favor, selecione apenas arquivos de imagem",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Arquivo Muito Grande",
          description: "A imagem deve ter no máximo 10MB",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setCapturedPhoto(result);
        console.log('File read successfully');
        toast({
          title: "Imagem Carregada",
          description: "Imagem selecionada com sucesso!",
        });
      };
      reader.onerror = () => {
        toast({
          title: "Erro",
          description: "Erro ao ler o arquivo da imagem",
          variant: "destructive",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadPhoto = async (photoDataUrl: string): Promise<string | null> => {
    try {
      setUploading(true);
      console.log('Starting photo upload...');
      
      // Convert data URL to blob
      const response = await fetch(photoDataUrl);
      const blob = await response.blob();
      
      // Generate unique filename
      const fileName = `retirada-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`;
      
      console.log('Uploading photo:', fileName, 'Size:', blob.size);
      
      const { data, error } = await supabase.storage
        .from('retiradas-fotos')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }

      console.log('Upload successful:', data);
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('retiradas-fotos')
        .getPublicUrl(fileName);

      console.log('Public URL:', urlData.publicUrl);
      
      setUploadSuccess(true);
      toast({
        title: "Upload Concluído",
        description: "Foto enviada com sucesso!",
      });
      
      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Erro no Upload",
        description: "Não foi possível enviar a foto. Tente novamente.",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const retakePhoto = () => {
    setCapturedPhoto('');
    setUploadSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const confirmPhoto = async () => {
    if (capturedPhoto) {
      const photoUrl = await uploadPhoto(capturedPhoto);
      if (photoUrl) {
        onCapture(photoUrl);
      }
    }
  };

  return (
    <div className="animate-fade-in font-poppins">
      <div className="text-center mb-6 md:mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Foto dos Produtos
        </h2>
        <p className="text-base md:text-lg text-gray-600">
          Tire uma foto dos produtos que você está retirando
        </p>
      </div>

      <Card className="p-6 md:p-8 rounded-2xl">
        {!capturedPhoto && !isCapturing && (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-primary-50 rounded-2xl mx-auto flex items-center justify-center">
              <Camera className="w-12 h-12 md:w-16 md:h-16 text-primary" />
            </div>
            
            <div className="space-y-4">
              <Button
                onClick={startCamera}
                className="w-full bg-primary hover:bg-primary-600 text-white rounded-xl h-12 md:h-14 text-base md:text-lg font-medium"
              >
                <Camera className="w-5 h-5 mr-2" />
                Abrir Câmera
              </Button>
              
              <div className="text-center text-gray-500 text-sm md:text-base">ou</div>
              
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full rounded-xl h-12 md:h-14 text-base md:text-lg font-medium border-2"
              >
                <Upload className="w-5 h-5 mr-2" />
                Escolher da Galeria
              </Button>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
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
                muted
                className="w-full max-h-80 object-cover"
              />
            </div>
            
            <Button
              onClick={capturePhoto}
              className="w-full bg-primary hover:bg-primary-600 text-white rounded-xl h-12 md:h-14 text-base md:text-lg font-medium"
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
              {uploadSuccess && (
                <div className="absolute top-4 right-4 bg-green-500 text-white rounded-full p-2">
                  <CheckCircle className="w-5 h-5" />
                </div>
              )}
            </div>
            
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={retakePhoto}
                disabled={uploading}
                className="flex-1 rounded-xl h-12 md:h-14 text-base md:text-lg font-medium border-2"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Nova Foto
              </Button>
              
              <Button
                onClick={confirmPhoto}
                disabled={uploading}
                className="flex-1 bg-primary hover:bg-primary-600 text-white rounded-xl h-12 md:h-14 text-base md:text-lg font-medium"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Enviando...
                  </>
                ) : (
                  "Confirmar"
                )}
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
