
import { useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PenTool, RotateCcw } from "lucide-react";

interface SignatureCaptureProps {
  onCapture: (signature: string) => void;
}

const SignatureCapture = ({ onCapture }: SignatureCaptureProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

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

  const confirmSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataURL = canvas.toDataURL('image/png');
    onCapture(dataURL);
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
              disabled={!hasSignature}
              className="flex-1 rounded-xl h-12 text-lg font-medium"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Limpar
            </Button>
            
            <Button
              onClick={confirmSignature}
              disabled={!hasSignature}
              className="flex-1 bg-primary hover:bg-primary-600 text-white rounded-xl h-12 text-lg font-medium"
            >
              Confirmar
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SignatureCapture;
