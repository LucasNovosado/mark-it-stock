
import { useState } from "react";
import { Plus, Edit, Trash2, Search, Package } from "lucide-react";
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
import ProductForm from "./ProductForm";

const ProductManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // Dados mock dos produtos
  const [products, setProducts] = useState([
    {
      id: '1',
      name: 'Banner Roll-up',
      category: 'grafico',
      quantity: 15,
      image: '/api/placeholder/150/100'
    },
    {
      id: '2',
      name: 'Flyers A4',
      category: 'grafico',
      quantity: 500,
      image: '/api/placeholder/150/100'
    },
    {
      id: '3',
      name: 'Display de Mesa',
      category: 'estrutura_lojas',
      quantity: 8,
      image: '/api/placeholder/150/100'
    },
    {
      id: '4',
      name: 'Canetas Personalizadas',
      category: 'brindes',
      quantity: 200,
      image: '/api/placeholder/150/100'
    },
  ]);

  const categories = [
    { id: 'all', name: 'Todas as Categorias' },
    { id: 'grafico', name: 'Gráfico' },
    { id: 'estrutura_lojas', name: 'Estrutura de Lojas' },
    { id: 'brindes', name: 'Brindes' },
  ];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSaveProduct = (productData: any) => {
    if (editingProduct) {
      // Atualizar produto existente
      setProducts(prev => prev.map(p => 
        p.id === editingProduct.id ? { ...productData, id: editingProduct.id } : p
      ));
    } else {
      // Adicionar novo produto
      const newProduct = {
        ...productData,
        id: Date.now().toString()
      };
      setProducts(prev => [...prev, newProduct]);
    }
    
    setIsDialogOpen(false);
    setEditingProduct(null);
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      setProducts(prev => prev.filter(p => p.id !== productId));
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : categoryId;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'grafico': 'bg-blue-100 text-blue-800',
      'estrutura_lojas': 'bg-green-100 text-green-800',
      'brindes': 'bg-purple-100 text-purple-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Gerenciar Produtos
        </h2>
        
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
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
              </DialogTitle>
            </DialogHeader>
            <ProductForm 
              product={editingProduct}
              onSave={handleSaveProduct}
              onCancel={() => {
                setIsDialogOpen(false);
                setEditingProduct(null);
              }}
            />
          </DialogContent>
        </Dialog>
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
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full h-12 px-3 border border-gray-300 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="rounded-2xl border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Product Image */}
                <div className="w-full h-32 bg-gray-100 rounded-xl flex items-center justify-center">
                  <Package className="w-12 h-12 text-gray-400" />
                </div>

                {/* Product Info */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {product.name}
                  </h3>
                  
                  <div className="flex items-center justify-between">
                    <Badge 
                      variant="outline" 
                      className={`rounded-lg ${getCategoryColor(product.category)}`}
                    >
                      {getCategoryName(product.category)}
                    </Badge>
                    
                    <span className="text-sm font-medium text-gray-600">
                      Estoque: {product.quantity}
                    </span>
                  </div>
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

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum produto encontrado
          </h3>
          <p className="text-gray-600">
            {searchTerm || selectedCategory !== 'all' 
              ? 'Tente ajustar os filtros de busca' 
              : 'Adicione o primeiro produto ao sistema'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
