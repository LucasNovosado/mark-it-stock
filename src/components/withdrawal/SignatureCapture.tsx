
import { useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PenTool, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SignatureCaptureProps {
  onCapture: (signature: string) => void;
}

const SignatureCapture = ({ onCapture }: SignatureCaptureProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  }, []);

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1e293b';
    ctx.lineTo(x, y);
    ctx.stroke();
    
    setHasSignature(true);
  }, [isDrawing]);

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
  }, []);

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const uploadSignature = async (signatureDataUrl: string): Promise<string | null> => {
    try {
      setUploading(true);
      
      // Convert data URL to blob
      const response = await fetch(signatureDataUrl);
      const blob = await response.blob();
      
      // Generate unique filename
      const fileName = `assinatura-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.png`;
      
      console.log('Uploading signature:', fileName);
      
      const { data, error } = await supabase.storage
        .from('assinaturas')
        .upload(fileName, blob, {
          contentType: 'image/png',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }

      console.log('Upload successful:', data);
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('assinaturas')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading signature:', error);
      toast({
        title: "Erro",
        description: "Não foi possível fazer upload da assinatura",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const confirmSignature = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataURL = canvas.toDataURL('image/png');
    const signatureUrl = await uploadSignature(dataURL);
    if (signatureUrl) {
      onCapture(signatureUrl);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Assinatura Digital
        </h2>
        <p className="text-gray-600">
          Assine com o dedo na área abaixo para confirmar a retirada
        </p>
      </div>

      <Card className="p-8 rounded-2xl">
        <div className="space-y-6">
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={400}
              height={200}
              className="w-full border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 cursor-crosshair touch-none"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              style={{ touchAction: 'none' }}
            />
            
            {!hasSignature && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center text-gray-400">
                  <PenTool className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">Assine aqui</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={clearSignature}
              disabled={!hasSignature || uploading}
              className="flex-1 rounded-xl h-12 text-lg font-medium"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Limpar
            </Button>
            
            <Button
              onClick={confirmSignature}
              disabled={!hasSignature || uploading}
              className="flex-1 bg-primary hover:bg-primary-600 text-white rounded-xl h-12 text-lg font-medium"
            >
              {uploading ? "Enviando..." : "Confirmar"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SignatureCapture;
