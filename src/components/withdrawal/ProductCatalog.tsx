
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Minus, Plus, ShoppingCart, Search, Package, Store, Gift } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  nome: string;
  quantidade_disponivel: number;
  categoria: string;
  imagem_url?: string;
}

interface ProductCatalogProps {
  onSelect: (products: any[]) => void;
}

const ProductCatalog = ({ onSelect }: ProductCatalogProps) => {
  const [selectedProducts, setSelectedProducts] = useState<{[key: string]: number}>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { toast } = useToast();

  const categories = [
    { id: 'all', name: 'Todos os Produtos', icon: Package, color: 'bg-gray-500' },
    { id: 'grafico', name: 'Gráfico', icon: Package, color: 'bg-blue-500' },
    { id: 'estrutura_lojas', name: 'Estrutura de Lojas', icon: Store, color: 'bg-green-500' },
    { id: 'brindes', name: 'Brindes', icon: Gift, color: 'bg-purple-500' },
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log('Fetching all products...');
      
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .order('nome');

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

  const filterProducts = () => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.categoria === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.nome.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
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
      <div className="animate-fade-in text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-6 text-lg text-gray-600">Carregando catálogo...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Catálogo de Materiais
        </h2>
        <p className="text-lg text-gray-600">
          Selecione os produtos e quantidades que deseja retirar
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          placeholder="Buscar produtos (ex: banner, display, caneta...)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-12 h-14 text-lg rounded-2xl border-2 border-gray-200 focus:border-primary"
        />
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-3 mb-8">
        {categories.map((category) => {
          const Icon = category.icon;
          const isSelected = selectedCategory === category.id;
          
          return (
            <Button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              variant={isSelected ? "default" : "outline"}
              className={`
                h-12 px-6 rounded-2xl font-medium text-base transition-all duration-300
                ${isSelected ? 'bg-primary text-white shadow-lg' : 'hover:border-primary hover:text-primary'}
              `}
            >
              <Icon className="w-5 h-5 mr-2" />
              {category.name}
            </Button>
          );
        })}
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-600 mb-2">Nenhum produto encontrado</p>
          <p className="text-gray-500">Tente ajustar os filtros ou termo de busca</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden rounded-2xl border-2 hover:border-primary-200 hover:shadow-xl transition-all duration-300 bg-white">
              {/* Product Image */}
              <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                {product.imagem_url ? (
                  <img 
                    src={product.imagem_url} 
                    alt={product.nome}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-6xl opacity-50">📦</div>
                )}
              </div>
              
              {/* Product Info */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {product.nome}
                </h3>
                
                <div className="flex items-center justify-between mb-4">
                  <Badge 
                    variant={product.quantidade_disponivel > 0 ? "default" : "destructive"}
                    className="text-sm px-3 py-1"
                  >
                    {product.quantidade_disponivel > 0 
                      ? `${product.quantidade_disponivel} disponíveis`
                      : 'Indisponível'
                    }
                  </Badge>
                </div>

                {/* Quantity Controls */}
                {product.quantidade_disponivel > 0 && (
                  <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(product.id, -1)}
                      disabled={!selectedProducts[product.id]}
                      className="w-10 h-10 rounded-xl border-2"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    
                    <span className="text-xl font-bold text-primary min-w-[3rem] text-center">
                      {selectedProducts[product.id] || 0}
                    </span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(product.id, 1)}
                      disabled={selectedProducts[product.id] >= product.quantidade_disponivel}
                      className="w-10 h-10 rounded-xl border-2"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Fixed Bottom Cart */}
      {totalSelected > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-50">
          <Card className="bg-white shadow-2xl rounded-2xl border-2 border-primary-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center mr-4">
                  <ShoppingCart className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    {totalSelected} {totalSelected === 1 ? 'item selecionado' : 'itens selecionados'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {Object.keys(selectedProducts).length} {Object.keys(selectedProducts).length === 1 ? 'produto' : 'produtos'}
                  </p>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handleContinue}
              className="w-full bg-primary hover:bg-primary-600 text-white rounded-xl h-14 text-lg font-bold shadow-lg"
            >
              Continuar com a Retirada
            </Button>
          </Card>
        </div>
      )}

      {/* Bottom padding for fixed cart */}
      {totalSelected > 0 && <div className="h-32" />}
    </div>
  );
};

export default ProductCatalog;
