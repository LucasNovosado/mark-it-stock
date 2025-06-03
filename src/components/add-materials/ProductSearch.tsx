
import { useState, useEffect } from "react";
import { Search, Plus, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AddQuantityModal from "./AddQuantityModal";

interface Product {
  id: string;
  nome: string;
  quantidade_disponivel: number;
  categoria: string;
  imagem_url?: string;
}

interface ProductSearchProps {
  onNewProduct: () => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const ProductSearch = ({ onNewProduct, searchTerm, setSearchTerm }: ProductSearchProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = products.filter(product =>
        product.nome.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts([]);
    }
  }, [searchTerm, products]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
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

  const handleAddQuantity = async (productId: string, quantity: number) => {
    try {
      const { error } = await supabase
        .from('produtos')
        .update({ 
          quantidade_disponivel: supabase.sql`quantidade_disponivel + ${quantity}`
        })
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: `${quantity} unidades adicionadas ao estoque`,
        variant: "default",
      });

      // Refresh products
      await fetchProducts();
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar ao estoque",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Search Bar */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          placeholder="Buscar produto existente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-12 h-14 text-lg rounded-2xl border-2 border-gray-200 focus:border-yellow-500 font-poppins"
        />
      </div>

      {/* Search Results */}
      {searchTerm.trim() && (
        <div className="mb-8">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden rounded-2xl border-2 hover:border-yellow-300 hover:shadow-xl transition-all duration-300 bg-white">
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
                  
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {product.nome}
                    </h3>
                    
                    <div className="mb-4">
                      <Badge className="text-sm px-3 py-1 bg-blue-100 text-blue-800">
                        {product.categoria}
                      </Badge>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-gray-600">Estoque atual:</p>
                      <p className="text-xl font-bold text-green-600">
                        {product.quantidade_disponivel} unidades
                      </p>
                    </div>

                    <Button
                      onClick={() => setSelectedProduct(product)}
                      className="w-full bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl h-12 font-bold"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Adicionar Quantidade
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-lg text-gray-600 mb-4">
                Nenhum produto encontrado com "{searchTerm}"
              </p>
            </div>
          )}

          {/* New Product Button */}
          <div className="text-center">
            <Button
              onClick={onNewProduct}
              className="bg-primary hover:bg-primary-600 text-white rounded-xl h-14 px-8 text-lg font-bold"
            >
              <Plus className="w-6 h-6 mr-2" />
              Cadastrar Novo Produto
            </Button>
          </div>
        </div>
      )}

      {/* Initial State */}
      {!searchTerm.trim() && (
        <div className="text-center py-12">
          <div className="bg-yellow-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <Search className="w-12 h-12 text-yellow-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Comece buscando um produto
          </h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Digite o nome do produto que deseja adicionar ao estoque. Se não encontrar, você pode cadastrar um novo.
          </p>
          <Button
            onClick={onNewProduct}
            variant="outline"
            className="border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-xl h-12 px-6 font-medium"
          >
            <Plus className="w-5 h-5 mr-2" />
            Ou cadastrar novo produto
          </Button>
        </div>
      )}

      {/* Add Quantity Modal */}
      {selectedProduct && (
        <AddQuantityModal
          product={selectedProduct}
          onAdd={handleAddQuantity}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
};

export default ProductSearch;
