
import { useState } from "react";
import { Plus, Minus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Product {
  id: string;
  nome: string;
  quantidade_disponivel: number;
  categoria: string;
  imagem_url?: string;
}

interface AddQuantityModalProps {
  product: Product;
  onAdd: (productId: string, quantity: number) => void;
  onClose: () => void;
}

const AddQuantityModal = ({ product, onAdd, onClose }: AddQuantityModalProps) => {
  const [quantity, setQuantity] = useState(1);

  const handleAdd = () => {
    if (quantity > 0) {
      onAdd(product.id, quantity);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="bg-white rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Adicionar Quantidade</h3>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="rounded-full w-8 h-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl mx-auto mb-4 flex items-center justify-center">
            {product.imagem_url ? (
              <img 
                src={product.imagem_url} 
                alt={product.nome}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <div className="text-3xl opacity-50">📦</div>
            )}
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">{product.nome}</h4>
          <p className="text-sm text-gray-600">
            Estoque atual: <span className="font-bold text-green-600">{product.quantidade_disponivel}</span>
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Quantidade a adicionar:
          </label>
          <div className="flex items-center justify-center bg-gray-50 rounded-xl p-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-10 rounded-xl border-2 p-0"
            >
              <Minus className="w-4 h-4" />
            </Button>
            
            <span className="text-2xl font-bold text-primary min-w-[4rem] text-center">
              {quantity}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuantity(quantity + 1)}
              className="w-10 h-10 rounded-xl border-2 p-0"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleAdd}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl h-12 text-lg font-bold"
          >
            <Plus className="w-5 h-5 mr-2" />
            Adicionar {quantity} {quantity === 1 ? 'unidade' : 'unidades'}
          </Button>
          
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full border-2 border-gray-200 rounded-xl h-12 text-lg font-medium"
          >
            Cancelar
          </Button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Estoque final: {product.quantidade_disponivel + quantity} unidades
          </p>
        </div>
      </Card>
    </div>
  );
};

export default AddQuantityModal;
