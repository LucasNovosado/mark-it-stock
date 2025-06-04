
// src/components/admin/ProductForm.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ProductService } from "@/services/productService";
import { Product } from "@/types/database";
import ImageUpload from "@/components/ui/image-upload";

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
  });

  const [images, setImages] = useState<string[]>([]);
  const [coverIndex, setCoverIndex] = useState(0);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (product) {
      setFormData({
        nome: product.nome || '',
        categoria: product.categoria || 'grafico',
        quantidade_disponivel: product.quantidade_disponivel || 0,
      });

      // Carregar imagens existentes
      const productImages: string[] = [];
      if (product.image_1_url) productImages.push(product.image_1_url);
      if (product.image_2_url) productImages.push(product.image_2_url);
      if (product.image_3_url) productImages.push(product.image_3_url);
      
      setImages(productImages);
      setCoverIndex(Math.max(0, (product.imagem_capa_index || 1) - 1));
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
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      
      try {
        const productData = {
          nome: formData.nome.trim(),
          categoria: formData.categoria,
          quantidade_disponivel: formData.quantidade_disponivel,
          imagem_url: images[coverIndex] || null, // Manter compatibilidade
          image_1_url: images[0] || null,
          image_2_url: images[1] || null,
          image_3_url: images[2] || null,
          imagem_capa_index: images.length > 0 ? coverIndex + 1 : 1,
        };

        if (product) {
          // Atualizar produto existente
          await ProductService.updateProduct(product.id, productData);
          
          toast({
            title: "Sucesso",
            description: "Produto atualizado com sucesso",
          });
        } else {
          // Criar novo produto
          await ProductService.createProduct(productData);
          
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

  const handleImagesChange = (newImages: string[], newCoverIndex: number) => {
    setImages(newImages);
    setCoverIndex(newCoverIndex);
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
        <Label className="text-base font-medium text-gray-700">
          Imagens do Produto (até 3)
        </Label>
        <p className="text-sm text-gray-600 mb-4">
          Adicione até 3 imagens e clique na estrela para definir a imagem de capa
        </p>
        <ImageUpload
          images={images}
          coverIndex={coverIndex}
          onImagesChange={handleImagesChange}
          productId={product?.id}
          maxImages={3}
        />
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
