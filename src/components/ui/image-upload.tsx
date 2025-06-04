
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, X, Star, StarOff, Image } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  images: string[];
  coverIndex: number;
  onImagesChange: (images: string[], coverIndex: number) => void;
  productId?: string;
  maxImages?: number;
}

const ImageUpload = ({ 
  images, 
  coverIndex, 
  onImagesChange, 
  productId, 
  maxImages = 3 
}: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const remainingSlots = maxImages - images.length;
    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    if (filesToUpload.length === 0) {
      toast({
        title: "Limite atingido",
        description: `Você já tem ${maxImages} imagens. Remova algumas para adicionar novas.`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    const newImages = [...images];

    try {
      for (const file of filesToUpload) {
        // Validar tipo de arquivo
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Arquivo inválido",
            description: "Por favor, selecione apenas arquivos de imagem.",
            variant: "destructive",
          });
          continue;
        }

        // Validar tamanho (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "Arquivo muito grande",
            description: "O arquivo deve ter no máximo 5MB.",
            variant: "destructive",
          });
          continue;
        }

        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name}`;
        const filePath = productId ? `produtos/${productId}/${fileName}` : `temp/${fileName}`;

        const { data, error } = await supabase.storage
          .from('product-images')
          .upload(filePath, file);

        if (error) {
          console.error('Upload error:', error);
          toast({
            title: "Erro no upload",
            description: "Não foi possível fazer upload da imagem.",
            variant: "destructive",
          });
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        newImages.push(publicUrl);
      }

      // Se é a primeira imagem, definir como capa
      const newCoverIndex = images.length === 0 ? 0 : coverIndex;
      
      onImagesChange(newImages, newCoverIndex);
      
      toast({
        title: "Sucesso",
        description: `${filesToUpload.length} imagem(ns) adicionada(s).`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado durante o upload.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = async (index: number) => {
    const imageUrl = images[index];
    const newImages = images.filter((_, i) => i !== index);
    
    // Ajustar índice da capa se necessário
    let newCoverIndex = coverIndex;
    if (index === coverIndex) {
      newCoverIndex = 0; // Primeira imagem restante vira capa
    } else if (index < coverIndex) {
      newCoverIndex = coverIndex - 1;
    }

    // Se não há mais imagens, resetar capa
    if (newImages.length === 0) {
      newCoverIndex = 0;
    }

    try {
      // Extrair caminho da URL para deletar do storage
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const folder = productId ? `produtos/${productId}` : 'temp';
      const filePath = `${folder}/${fileName}`;

      await supabase.storage
        .from('product-images')
        .remove([filePath]);
    } catch (error) {
      console.error('Error removing image from storage:', error);
    }

    onImagesChange(newImages, newCoverIndex);
  };

  const setCoverImage = (index: number) => {
    onImagesChange(images, index);
  };

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      {images.length < maxImages && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full h-24 border-2 border-dashed border-gray-300 hover:border-primary-400 transition-colors"
          >
            <div className="flex flex-col items-center space-y-2">
              {uploading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              ) : (
                <Upload className="h-6 w-6 text-gray-400" />
              )}
              <span className="text-sm text-gray-600">
                {uploading ? 'Fazendo upload...' : `Adicionar imagens (${images.length}/${maxImages})`}
              </span>
            </div>
          </Button>
        </div>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <Card key={index} className="relative overflow-hidden group">
              <div className="aspect-square">
                <img
                  src={image}
                  alt={`Produto imagem ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Cover indicator */}
              <div className="absolute top-2 left-2">
                <Button
                  type="button"
                  variant={index === coverIndex ? "default" : "secondary"}
                  size="sm"
                  onClick={() => setCoverImage(index)}
                  className="h-8 w-8 p-0 rounded-full"
                >
                  {index === coverIndex ? (
                    <Star className="h-4 w-4 fill-current" />
                  ) : (
                    <StarOff className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Remove button */}
              <div className="absolute top-2 right-2">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeImage(index)}
                  className="h-8 w-8 p-0 rounded-full opacity-80 hover:opacity-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Cover label */}
              {index === coverIndex && (
                <div className="absolute bottom-0 left-0 right-0 bg-primary bg-opacity-90 text-white text-xs py-1 px-2 text-center">
                  Imagem de Capa
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Instructions */}
      {images.length === 0 && (
        <div className="text-center text-gray-500 text-sm">
          <Image className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>Nenhuma imagem adicionada</p>
          <p>Clique no botão acima para adicionar até {maxImages} imagens</p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
