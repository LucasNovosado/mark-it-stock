
import { useState } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface ProductGalleryProps {
  images: string[];
  coverIndex: number;
  productName: string;
  className?: string;
}

const ProductGallery = ({ images, coverIndex, productName, className = "" }: ProductGalleryProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(coverIndex);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const validImages = images.filter(img => img && img.trim() !== '');
  
  if (validImages.length === 0) {
    return (
      <div className={`aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center ${className}`}>
        <div className="text-4xl md:text-6xl opacity-50">📦</div>
      </div>
    );
  }

  const currentImage = validImages[currentImageIndex] || validImages[coverIndex] || validImages[0];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % validImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <div 
        className={`relative aspect-square overflow-hidden cursor-pointer ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={openModal}
      >
        <img
          src={currentImage}
          alt={productName}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />

        {/* Navigation arrows - visible on hover if multiple images */}
        {validImages.length > 1 && isHovered && (
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 rounded-full opacity-80 hover:opacity-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 rounded-full opacity-80 hover:opacity-100"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Image indicator dots */}
        {validImages.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
            {validImages.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(index);
                }}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}

        {/* Zoom icon */}
        {isHovered && (
          <div className="absolute top-2 right-2">
            <div className="bg-black/50 text-white p-1 rounded-full">
              <ZoomIn className="h-4 w-4" />
            </div>
          </div>
        )}
      </div>

      {/* Modal para visualização em tamanho completo */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl w-full p-0">
          <div className="relative">
            <img
              src={currentImage}
              alt={productName}
              className="w-full h-auto max-h-[80vh] object-contain"
            />
            
            {/* Close button */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 h-8 w-8 p-0 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Navigation in modal */}
            {validImages.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 p-0 rounded-full"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 p-0 rounded-full"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>

                {/* Image counter */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {validImages.length}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductGallery;
