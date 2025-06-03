
import { CheckCircle, Home, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const SuccessScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="animate-fade-in text-center">
      <div className="mb-8">
        <div className="w-24 h-24 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Retirada Concluída!
        </h2>
        
        <p className="text-lg text-gray-600 max-w-md mx-auto">
          Sua retirada foi registrada com sucesso. O estoque foi atualizado automaticamente.
        </p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-center mb-4">
          <FileText className="w-6 h-6 text-green-600 mr-2" />
          <span className="font-semibold text-green-800">Protocolo de Retirada</span>
        </div>
        <p className="text-green-700">
          #{Math.random().toString(36).substr(2, 9).toUpperCase()}
        </p>
      </div>

      <div className="space-y-4">
        <Button
          onClick={() => navigate('/retirada')}
          className="w-full bg-primary hover:bg-primary-600 text-white rounded-xl h-12 text-lg font-medium"
        >
          Nova Retirada
        </Button>
        
        <Button
          variant="outline"
          onClick={() => navigate('/')}
          className="w-full rounded-xl h-12 text-lg font-medium"
        >
          <Home className="w-5 h-5 mr-2" />
          Voltar ao Início
        </Button>
      </div>
    </div>
  );
};

export default SuccessScreen;
