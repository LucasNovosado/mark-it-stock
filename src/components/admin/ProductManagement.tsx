// src/components/admin/ProductManagement.tsx
import { useState } from "react";
import { Plus, Edit, Trash2, Search, Package, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { useProducts } from "@/hooks/use-products";
import { ProductService } from "@/services/productService";
import { Product, ProductFilters, CategoryType } from "@/types/database";
import ProductForm from "./ProductForm";

const ProductManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'all'>('all');
  const [sortBy, setSortBy] = useState<'nome' | 'quantidade_disponivel' | 'created_at'>('nome');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const filters: ProductFilters = {
    search: searchTerm,
    category: selectedCategory,
    sortBy,
    sortOrder
  };

  const { products, loading, error, refetch, updateProduct, deleteProduct } = useProducts(filters);

  const categories = [
    { id: 'all' as const, name: 'Todas as Categorias' },
    { id: 'grafico' as const, name: 'Gráfico' },
    { id: 'estrutura_lojas' as const, name: 'Estrutura de Lojas' },
    { id: 'brindes' as const, name: 'Brindes' },
  ];

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await deleteProduct(productId);
      } catch (error) {
        // Error já é tratado no hook
      }
    }
  };

  const handleProductSaved = () => {
    setIsDialogOpen(false);
    setEditingProduct(null);
    refetch();
  };

  const getCategoryColor = (category: CategoryType) => {
    const colors = {
      'grafico': 'bg-blue-100 text-blue-800',
      'estrutura_lojas': 'bg-green-100 text-green-800',
      'brindes': 'bg-purple-100 text-purple-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getStockBadgeVariant = (quantity: number) => {
    if (quantity <= 5) return "destructive";
    if (quantity <= 20) return "secondary";
    return "default";
  };

  if (loading && products.length === 0) {
    return (
      <div className="animate-fade-in text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-lg text-gray-600">Carregando produtos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Gerenciar Produtos
          </h2>
          <p className="text-gray-600">
            {products.length} produto{products.length !== 1 ? 's' : ''} encontrado{products.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={refetch} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-primary hover:bg-primary-600 text-white rounded-xl"
                onClick={() => setEditingProduct(null)}
              >
                <Plus className="w-5 h-5 mr-2" />
                Novo Produto
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                </DialogTitle>
              </DialogHeader>
              <ProductForm 
                product={editingProduct}
                onSave={handleProductSaved}
                onCancel={() => {
                  setIsDialogOpen(false);
                  setEditingProduct(null);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card className="rounded-2xl border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 rounded-xl"
                />
              </div>
            </div>
            
            <div className="sm:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as CategoryType | 'all')}
                className="w-full h-12 px-3 border border-gray-300 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:w-32">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-') as [typeof sortBy, typeof sortOrder];
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="w-full h-12 px-3 border border-gray-300 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="nome-asc">Nome A-Z</option>
                <option value="nome-desc">Nome Z-A</option>
                <option value="quantidade_disponivel-desc">Maior Estoque</option>
                <option value="quantidade_disponivel-asc">Menor Estoque</option>
                <option value="created_at-desc">Mais Recente</option>
                <option value="created_at-asc">Mais Antigo</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="rounded-2xl border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-700">{error}</p>
            <Button onClick={refetch} variant="outline" className="mt-2">
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="rounded-2xl border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Product Image */}
                <div className="w-full h-32 bg-gray-100 rounded-xl flex items-center justify-center">
                  {product.imagem_url ? (
                    <img 
                      src={product.imagem_url} 
                      alt={product.nome}
                      className="w-full h-full object-cover rounded-xl"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : (
                    <Package className="w-12 h-12 text-gray-400" />
                  )}
                </div>

                {/* Product Info */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900 text-lg line-clamp-2">
                    {product.nome}
                  </h3>
                  
                  <div className="flex items-center justify-between">
                    <Badge 
                      variant="outline" 
                      className={`rounded-lg ${getCategoryColor(product.categoria)}`}
                    >
                      {ProductService.getCategoryName(product.categoria)}
                    </Badge>
                    
                    <Badge 
                      variant={getStockBadgeVariant(product.quantidade_disponivel)}
                      className="rounded-lg"
                    >
                      {product.quantidade_disponivel} un.
                    </Badge>
                  </div>

                  <p className="text-sm text-gray-500">
                    Criado em {new Date(product.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditProduct(product)}
                    className="flex-1 rounded-lg"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteProduct(product.id)}
                    className="rounded-lg text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {products.length === 0 && !loading && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum produto encontrado
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedCategory !== 'all' 
              ? 'Tente ajustar os filtros de busca' 
              : 'Adicione o primeiro produto ao sistema'
            }
          </p>
          {(!searchTerm && selectedCategory === 'all') && (
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Produto
            </Button>
          )}
        </div>
      )}

      {/* Loading overlay for updates */}
      {loading && products.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 flex items-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
            <span>Atualizando produtos...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;