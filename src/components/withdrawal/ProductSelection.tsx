import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  nome: string;
  quantidade_disponivel: number;
  categoria: string;
  imagem_url?: string;
}

interface ProductSelectionProps {
  category: 'grafico' | 'estrutura_lojas' | 'brindes';
  onSelect: (products: any[]) => void;
}

const ProductSelection = ({ category, onSelect }: ProductSelectionProps) => {
  const [selectedProducts, setSelectedProducts] = useState<{[key: string]: number}>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log('Fetching products for category:', category);
      
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('categoria', category);

      if (error) {
        console.error('Error fetching products:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os produtos",
          variant: "destructive",
        });
        return;
      }

      console.log('Products fetched:', data);
      setProducts(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar produtos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (productId: string, change: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    setSelectedProducts(prev => {
      const currentQty = prev[productId] || 0;
      const newQty = Math.max(0, Math.min(product.quantidade_disponivel, currentQty + change));
      
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

  if (loading) {
    return (
      <div className="animate-fade-in text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-gray-600">Carregando produtos...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="animate-fade-in text-center py-8">
        <p className="text-gray-600">Nenhum produto encontrado nesta categoria.</p>
      </div>
    );
  }

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
                {product.imagem_url ? (
                  <img 
                    src={product.imagem_url} 
                    alt={product.nome}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <span className="text-4xl">📦</span>
                )}
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {product.nome}
                </h3>
                <Badge variant="outline" className="text-sm">
                  {product.quantidade_disponivel} disponíveis
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
                  disabled={selectedProducts[product.id] >= product.quantidade_disponivel}
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
