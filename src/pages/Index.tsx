
import { useNavigate } from "react-router-dom";
import { Package, Settings, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-2xl mb-6">
            <Package className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-primary mb-4">
            Sistema de Controle de Estoque
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Gerencie e retire materiais de marketing de forma simples e organizada
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Retirada Card */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div className="flex items-center justify-center w-16 h-16 bg-primary-50 rounded-xl mb-6">
              <Package className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Retirar Materiais
            </h2>
            <p className="text-gray-600 mb-6">
              Selecione os produtos que deseja retirar do estoque de forma rápida e fácil
            </p>
            <Button 
              onClick={() => navigate('/retirada')}
              className="w-full bg-primary hover:bg-primary-600 text-white rounded-xl h-12 text-lg font-medium"
            >
              Iniciar Retirada
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>

          {/* Admin Card */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div className="flex items-center justify-center w-16 h-16 bg-secondary-50 rounded-xl mb-6">
              <Settings className="w-8 h-8 text-secondary" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Painel Administrativo
            </h2>
            <p className="text-gray-600 mb-6">
              Gerencie produtos, visualize relatórios e controle todo o estoque
            </p>
            <Button 
              onClick={() => navigate('/admin')}
              variant="outline"
              className="w-full border-secondary text-secondary hover:bg-secondary hover:text-white rounded-xl h-12 text-lg font-medium"
            >
              Acessar Painel
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="mt-16 text-center">
          <h3 className="text-xl font-semibold text-gray-700 mb-8">
            Características do Sistema
          </h3>
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6">
              <div className="w-12 h-12 bg-primary-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <span className="text-primary font-bold">📱</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Interface Intuitiva</h4>
              <p className="text-sm text-gray-600">Processo simples como um app de delivery</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6">
              <div className="w-12 h-12 bg-primary-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <span className="text-primary font-bold">⚡</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Controle em Tempo Real</h4>
              <p className="text-sm text-gray-600">Estoque atualizado automaticamente</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6">
              <div className="w-12 h-12 bg-primary-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <span className="text-primary font-bold">📊</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Relatórios Completos</h4>
              <p className="text-sm text-gray-600">Histórico detalhado de todas as retiradas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
