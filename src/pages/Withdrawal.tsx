
import { useState } from "react";
import { ArrowLeft, Package, Camera, PenTool, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ProductCatalog from "@/components/withdrawal/ProductCatalog";
import WithdrawalForm from "@/components/withdrawal/WithdrawalForm";
import PhotoCapture from "@/components/withdrawal/PhotoCapture";
import SignatureCapture from "@/components/withdrawal/SignatureCapture";
import SuccessScreen from "@/components/withdrawal/SuccessScreen";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Step = 'products' | 'form' | 'photo' | 'signature' | 'success';

const Withdrawal = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<Step>('products');
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [formData, setFormData] = useState<any>({});
  const [photoData, setPhotoData] = useState<string>('');
  const [signatureData, setSignatureData] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const steps = [
    { id: 'products', label: 'Produtos', icon: Package },
    { id: 'form', label: 'Dados', icon: Package },
    { id: 'photo', label: 'Foto', icon: Camera },
    { id: 'signature', label: 'Assinatura', icon: PenTool },
    { id: 'success', label: 'Concluído', icon: CheckCircle },
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  const handleBack = () => {
    if (currentStep === 'products') {
      navigate('/');
    } else {
      const prevStep = steps[currentStepIndex - 1];
      setCurrentStep(prevStep.id as Step);
    }
  };

  const handleProductsSelect = (products: any[]) => {
    setSelectedProducts(products);
    setCurrentStep('form');
  };

  const handleFormSubmit = (data: any) => {
    setFormData(data);
    setCurrentStep('photo');
  };

  const handlePhotoCapture = (photo: string) => {
    setPhotoData(photo);
    setCurrentStep('signature');
  };

  const submitWithdrawal = async (signatureUrl: string) => {
    try {
      setSubmitting(true);
      console.log('Submitting withdrawal with data:', {
        products: selectedProducts,
        form: formData,
        photo: photoData,
        signature: signatureUrl
      });

      // Insert each product withdrawal
      for (const product of selectedProducts) {
        console.log('Inserting withdrawal for product:', product);
        
        const { data, error } = await supabase
          .from('retiradas')
          .insert({
            produto_id: product.id,
            quantidade: product.selectedQuantity,
            destino: formData.destino,
            supervisor: formData.supervisor,
            foto_url: photoData,
            assinatura_url: signatureUrl
          });

        if (error) {
          console.error('Error inserting withdrawal:', error);
          throw error;
        }

        console.log('Withdrawal inserted successfully:', data);
      }

      toast({
        title: "Sucesso!",
        description: "Retirada registrada com sucesso",
      });

      setCurrentStep('success');
    } catch (error) {
      console.error('Error submitting withdrawal:', error);
      toast({
        title: "Erro",
        description: "Não foi possível registrar a retirada. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignatureCapture = (signature: string) => {
    setSignatureData(signature);
    submitWithdrawal(signature);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={submitting}
              className="rounded-xl"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">
              Retirada de Materiais
            </h1>
            <div className="w-20" />
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300
                    ${isActive ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}
                    ${isCurrent ? 'ring-4 ring-primary-100' : ''}
                  `}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`
                      w-8 h-1 mx-2 rounded-full transition-all duration-300
                      ${index < currentStepIndex ? 'bg-primary' : 'bg-gray-200'}
                    `} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {submitting && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-lg font-semibold">Registrando retirada...</p>
              </div>
            </div>
          )}
          
          {currentStep === 'products' && (
            <ProductCatalog onSelect={handleProductsSelect} />
          )}
          {currentStep === 'form' && (
            <WithdrawalForm onSubmit={handleFormSubmit} />
          )}
          {currentStep === 'photo' && (
            <PhotoCapture onCapture={handlePhotoCapture} />
          )}
          {currentStep === 'signature' && (
            <SignatureCapture onCapture={handleSignatureCapture} />
          )}
          {currentStep === 'success' && (
            <SuccessScreen />
          )}
        </div>
      </div>
    </div>
  );
};

export default Withdrawal;
