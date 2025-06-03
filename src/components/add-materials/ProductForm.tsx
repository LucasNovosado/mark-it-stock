
import { useState, useRef } from "react";
import { ArrowLeft, Camera, Upload, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProductFormProps {
  onBack: () => void;
  searchTerm: string;
}

const ProductForm = ({ onBack, searchTerm }: ProductFormProps) => {
  const [formData, setFormData] = useState({
    nome: searchTerm,
    categoria: '',
    quantidade: 1,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const categories = [
    { value: 'grafico', label: 'Gráfico' },
    { value: 'estrutura_lojas', label: 'Estrutura de Lojas' },
    { value: 'brindes', label: 'Brindes' },
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.click();
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;

    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `product-${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Erro",
        description: "Erro ao fazer upload da imagem",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim() || !formData.categoria) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Upload image if provided
      const imageUrl = await uploadImage();

      // Check if product already exists
      const { data: existingProduct } = await supabase
        .from('produtos')
        .select('id, quantidade_disponivel')
        .eq('nome', formData.nome.trim())
        .single();

      if (existingProduct) {
        // Update existing product quantity
        const { error } = await supabase
          .from('produtos')
          .update({ 
            quantidade_disponivel: existingProduct.quantidade_disponivel + formData.quantidade,
            ...(imageUrl && { imagem_url: imageUrl })
          })
          .eq('id', existingProduct.id);

        if (error) throw error;

        toast({
          title: "Sucesso!",
          description: `${formData.quantidade} unidades adicionadas ao produto existente`,
          variant: "default",
        });
      } else {
        // Create new product
        const { error } = await supabase
          .from('produtos')
          .insert({
            nome: formData.nome.trim(),
            categoria: formData.categoria,
            quantidade_disponivel: formData.quantidade,
            imagem_url: imageUrl,
          });

        if (error) throw error;

        toast({
          title: "Sucesso!",
          description: "Novo produto cadastrado com sucesso",
          variant: "default",
        });
      }

      // Reset form
      setFormData({ nome: '', categoria: '', quantidade: 1 });
      setImageFile(null);
      setImagePreview(null);
      onBack();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar produto",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Button
          onClick={onBack}
          variant="outline"
          className="rounded-xl border-2 border-gray-200 hover:border-primary"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar à Busca
        </Button>
      </div>

      <Card className="rounded-2xl border-2 border-gray-200 p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Cadastrar Novo Produto
          </h2>
          <p className="text-gray-600">
            Preencha as informações do produto
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome do Produto */}
          <div>
            <Label htmlFor="nome" className="text-base font-medium text-gray-700 mb-2 block">
              Nome do Produto *
            </Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Ex: Banner promocional 2x1m"
              className="h-12 text-base rounded-xl border-2 border-gray-200 focus:border-yellow-500"
              required
            />
          </div>

          {/* Categoria */}
          <div>
            <Label htmlFor="categoria" className="text-base font-medium text-gray-700 mb-2 block">
              Categoria *
            </Label>
            <select
              id="categoria"
              value={formData.categoria}
              onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
              className="w-full h-12 text-base rounded-xl border-2 border-gray-200 focus:border-yellow-500 px-3 bg-white"
              required
            >
              <option value="">Selecione uma categoria</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Quantidade */}
          <div>
            <Label htmlFor="quantidade" className="text-base font-medium text-gray-700 mb-2 block">
              Quantidade Inicial *
            </Label>
            <Input
              id="quantidade"
              type="number"
              min="1"
              value={formData.quantidade}
              onChange={(e) => setFormData({ ...formData, quantidade: parseInt(e.target.value) || 1 })}
              className="h-12 text-base rounded-xl border-2 border-gray-200 focus:border-yellow-500"
              required
            />
          </div>

          {/* Imagem */}
          <div>
            <Label className="text-base font-medium text-gray-700 mb-2 block">
              Imagem do Produto (opcional)
            </Label>
            
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-xl border-2 border-gray-200"
                />
                <Button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 rounded-full"
                >
                  ×
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  onClick={handleCameraCapture}
                  variant="outline"
                  className="h-24 rounded-xl border-2 border-dashed border-gray-300 hover:border-yellow-500"
                >
                  <div className="text-center">
                    <Camera className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <span className="text-sm text-gray-600">Tirar Foto</span>
                  </div>
                </Button>
                
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="h-24 rounded-xl border-2 border-dashed border-gray-300 hover:border-yellow-500"
                >
                  <div className="text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <span className="text-sm text-gray-600">Galeria</span>
                  </div>
                </Button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl h-14 text-lg font-bold"
          >
            {loading ? (
              "Salvando..."
            ) : (
              <>
                <Save className="w-6 h-6 mr-2" />
                Cadastrar Produto
              </>
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default ProductForm;
