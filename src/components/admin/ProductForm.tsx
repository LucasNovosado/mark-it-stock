
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProductFormProps {
  product?: any;
  onSave: (productData: any) => void;
  onCancel: () => void;
}

const ProductForm = ({ product, onSave, onCancel }: ProductFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'grafico',
    quantity: 0,
    image: ''
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        category: product.category || 'grafico',
        quantity: product.quantity || 0,
        image: product.image || ''
      });
    }
  }, [product]);

  const categories = [
    { id: 'grafico', name: 'Gráfico' },
    { id: 'estrutura_lojas', name: 'Estrutura de Lojas' },
    { id: 'brindes', name: 'Brindes' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }
    
    if (formData.quantity < 0) {
      newErrors.quantity = 'Quantidade deve ser positiva';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      onSave(formData);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-base font-medium text-gray-700">
          Nome do Produto
        </Label>
        <Input
          id="name"
          placeholder="Ex: Banner Roll-up"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className={`h-12 rounded-xl ${errors.name ? 'border-red-500' : ''}`}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="category" className="text-base font-medium text-gray-700">
          Categoria
        </Label>
        <select
          id="category"
          value={formData.category}
          onChange={(e) => handleChange('category', e.target.value)}
          className="w-full h-12 px-3 border border-gray-300 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="quantity" className="text-base font-medium text-gray-700">
          Quantidade em Estoque
        </Label>
        <Input
          id="quantity"
          type="number"
          min="0"
          placeholder="0"
          value={formData.quantity}
          onChange={(e) => handleChange('quantity', parseInt(e.target.value) || 0)}
          className={`h-12 rounded-xl ${errors.quantity ? 'border-red-500' : ''}`}
        />
        {errors.quantity && (
          <p className="text-sm text-red-500">{errors.quantity}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="image" className="text-base font-medium text-gray-700">
          URL da Imagem (opcional)
        </Label>
        <Input
          id="image"
          placeholder="https://exemplo.com/imagem.jpg"
          value={formData.image}
          onChange={(e) => handleChange('image', e.target.value)}
          className="h-12 rounded-xl"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1 rounded-xl h-12"
        >
          Cancelar
        </Button>
        
        <Button 
          type="submit"
          className="flex-1 bg-primary hover:bg-primary-600 text-white rounded-xl h-12"
        >
          {product ? 'Atualizar' : 'Adicionar'}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
