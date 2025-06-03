import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductSearch from "@/components/add-materials/ProductSearch";
import ProductForm from "@/components/add-materials/ProductForm";

const AddMaterials = () => {
  const navigate = useNavigate();
  const [showNewProductForm, setShowNewProductForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-yellow-50 font-poppins">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="rounded-xl border-2 border-gray-200 hover:border-primary"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar
          </Button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Adicionar Materiais
          </h1>
          <p className="text-lg text-gray-600">
            Busque um produto existente ou cadastre um novo
          </p>
        </div>

        {!showNewProductForm ? (
          <ProductSearch 
            onNewProduct={() => setShowNewProductForm(true)}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        ) : (
          <ProductForm 
            onBack={() => setShowNewProductForm(false)}
            searchTerm={searchTerm}
          />
        )}
      </div>
    </div>
  );
};

export default AddMaterials;