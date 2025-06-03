// src/components/admin/ProductForm.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ProductService } from "@/services/productService";
import { Product } from "@/types/database";

interface ProductFormProps {
  product?: Product | null;
  onSave: () => void;
  onCancel: () => void;
}

const ProductForm = ({ product, onSave, onCancel }: ProductFormProps) => {
  const [formData, setFormData] = useState({
    nome: '',
    categoria: 'grafico' as 'grafico' | 'estrutura_lojas' | 'brindes',
    quantidade_disponivel: 0,
    imagem_url: ''
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (product) {
      setFormData({
        nome: product.nome || '',
        categoria: product.categoria || 'grafico',
        quantidade_disponivel: product.quantidade_disponivel || 0,
        imagem_url: product.imagem_url || ''
      });
    }
  }, [product]);

  const categories = [
    { id: 'grafico' as const, name: 'Gráfico' },
    { id: 'estrutura_lojas' as const, name: 'Estrutura de Lojas' },
    { id: 'brindes' as const, name: 'Brindes' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }
    
    if (formData.quantidade_disponivel < 0) {
      newErrors.quantidade_disponivel = 'Quantidade deve ser positiva';
    }

    if (formData.imagem_url && !isValidUrl(formData.imagem_url)) {
      newErrors.imagem_url = 'URL da imagem inválida';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      
      try {
        if (product) {
          // Atualizar produto existente
          await ProductService.updateProduct(product.id, {
            nome: formData.nome.trim(),
            categoria: formData.categoria,
            quantidade_disponivel: formData.quantidade_disponivel,
            imagem_url: formData.imagem_url.trim() || null
          });
          
          toast({
            title: "Sucesso",
            description: "Produto atualizado com sucesso",
          });
        } else {
          // Criar novo produto
          await ProductService.createProduct({
            nome: formData.nome.trim(),
            categoria: formData.categoria,
            quantidade_disponivel: formData.quantidade_disponivel,
            imagem_url: formData.imagem_url.trim() || null
          });
          
          toast({
            title: "Sucesso",
            description: "Produto criado com sucesso",
          });
        }
        
        onSave();
      } catch (error) {
        console.error('Error saving product:', error);
        toast({
          title: "Erro",
          description: error instanceof Error ? error.message : "Erro ao salvar produto",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="nome" className="text-base font-medium text-gray-700">
          Nome do Produto *
        </Label>
        <Input
          id="nome"
          placeholder="Ex: Banner Roll-up"
          value={formData.nome}
          onChange={(e) => handleChange('nome', e.target.value)}
          className={`h-12 rounded-xl ${errors.nome ? 'border-red-500' : ''}`}
          disabled={loading}
        />
        {errors.nome && (
          <p className="text-sm text-red-500">{errors.nome}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="categoria" className="text-base font-medium text-gray-700">
          Categoria *
        </Label>
        <select
          id="categoria"
          value={formData.categoria}
          onChange={(e) => handleChange('categoria', e.target.value)}
          className="w-full h-12 px-3 border border-gray-300 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          disabled={loading}
        >
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="quantidade" className="text-base font-medium text-gray-700">
          Quantidade em Estoque *
        </Label>
        <Input
          id="quantidade"
          type="number"
          min="0"
          placeholder="0"
          value={formData.quantidade_disponivel}
          onChange={(e) => handleChange('quantidade_disponivel', parseInt(e.target.value) || 0)}
          className={`h-12 rounded-xl ${errors.quantidade_disponivel ? 'border-red-500' : ''}`}
          disabled={loading}
        />
        {errors.quantidade_disponivel && (
          <p className="text-sm text-red-500">{errors.quantidade_disponivel}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="imagem" className="text-base font-medium text-gray-700">
          URL da Imagem (opcional)
        </Label>
        <Input
          id="imagem"
          type="url"
          placeholder="https://exemplo.com/imagem.jpg"
          value={formData.imagem_url}
          onChange={(e) => handleChange('imagem_url', e.target.value)}
          className={`h-12 rounded-xl ${errors.imagem_url ? 'border-red-500' : ''}`}
          disabled={loading}
        />
        {errors.imagem_url && (
          <p className="text-sm text-red-500">{errors.imagem_url}</p>
        )}
        {formData.imagem_url && isValidUrl(formData.imagem_url) && (
          <div className="mt-2">
            <img 
              src={formData.imagem_url} 
              alt="Preview"
              className="w-32 h-32 object-cover rounded-xl border"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1 rounded-xl h-12"
          disabled={loading}
        >
          Cancelar
        </Button>
        
        <Button 
          type="submit"
          className="flex-1 bg-primary hover:bg-primary-600 text-white rounded-xl h-12"
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {product ? 'Atualizando...' : 'Criando...'}
            </>
          ) : (
            product ? 'Atualizar' : 'Criar Produto'
          )}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;