
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, ShoppingCart } from "lucide-react";

interface ProductSelectionProps {
  category: string;
  onSelect: (products: any[]) => void;
}

const ProductSelection = ({ category, onSelect }: ProductSelectionProps) => {
  const [selectedProducts, setSelectedProducts] = useState<{[key: string]: number}>({});

  // Dados mock dos produtos (em produção viria do Supabase)
  const mockProducts = {
    grafico: [
      { id: '1', name: 'Banner Roll-up', available: 15, image: '/api/placeholder/300/200' },
      { id: '2', name: 'Flyers A4', available: 500, image: '/api/placeholder/300/200' },
      { id: '3', name: 'Cartaz A3', available: 25, image: '/api/placeholder/300/200' },
    ],
    estrutura_lojas: [
      { id: '4', name: 'Display de Mesa', available: 8, image: '/api/placeholder/300/200' },
      { id: '5', name: 'Suporte de Chão', available: 5, image: '/api/placeholder/300/200' },
      { id: '6', name: 'Mobiliário Promocional', available: 3, image: '/api/placeholder/300/200' },
    ],
    brindes: [
      { id: '7', name: 'Canetas Personalizadas', available: 200, image: '/api/placeholder/300/200' },
      { id: '8', name: 'Chaveiros', available: 150, image: '/api/placeholder/300/200' },
      { id: '9', name: 'Camisetas', available: 50, image: '/api/placeholder/300/200' },
    ],
  };

  const products = mockProducts[category as keyof typeof mockProducts] || [];

  const handleQuantityChange = (productId: string, change: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    setSelectedProducts(prev => {
      const currentQty = prev[productId] || 0;
      const newQty = Math.max(0, Math.min(product.available, currentQty + change));
      
      if (newQty === 0) {
        const { [productId]: removed, ...rest } = prev;
        return rest;
      }
      
      return { ...prev, [productId]: newQty };
    });
  };

  const handleContinue = () => {
    const selectedProductsList = Object.entries(selectedProducts).map(([productId, quantity]) => {
      const product = products.find(p => p.id === productId);
      return { ...product, selectedQuantity: quantity };
    });
    onSelect(selectedProductsList);
  };

  const totalSelected = Object.values(selectedProducts).reduce((sum, qty) => sum + qty, 0);

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Selecione os Produtos
        </h2>
        <p className="text-gray-600">
          Escolha os itens e quantidades que deseja retirar
        </p>
      </div>

      <div className="grid gap-6 mb-8">
        {products.map((product) => (
          <Card key={product.id} className="p-6 rounded-2xl border-2 hover:border-primary-200 transition-all duration-300">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center">
                <span className="text-4xl">📦</span>
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {product.name}
                </h3>
                <Badge variant="outline" className="text-sm">
                  {product.available} disponíveis
                </Badge>
              </div>

              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(product.id, -1)}
                  disabled={!selectedProducts[product.id]}
                  className="w-10 h-10 rounded-xl"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                
                <span className="w-12 text-center font-semibold text-lg">
                  {selectedProducts[product.id] || 0}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(product.id, 1)}
                  disabled={selectedProducts[product.id] >= product.available}
                  className="w-10 h-10 rounded-xl"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {totalSelected > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-primary-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <ShoppingCart className="w-6 h-6 text-primary mr-3" />
              <span className="text-lg font-semibold text-gray-900">
                {totalSelected} {totalSelected === 1 ? 'item selecionado' : 'itens selecionados'}
              </span>
            </div>
          </div>
          
          <Button 
            onClick={handleContinue}
            className="w-full bg-primary hover:bg-primary-600 text-white rounded-xl h-12 text-lg font-medium"
          >
            Continuar
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductSelection;
