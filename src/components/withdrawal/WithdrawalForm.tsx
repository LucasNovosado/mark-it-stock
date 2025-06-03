
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { MapPin, User } from "lucide-react";

interface WithdrawalFormProps {
  onSubmit: (data: any) => void;
}

const WithdrawalForm = ({ onSubmit }: WithdrawalFormProps) => {
  const [formData, setFormData] = useState({
    destino: '',
    supervisor: ''
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.destino.trim()) {
      newErrors.destino = 'Campo obrigatório';
    }
    
    if (!formData.supervisor.trim()) {
      newErrors.supervisor = 'Campo obrigatório';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Informações da Retirada
        </h2>
        <p className="text-gray-600">
          Preencha os dados obrigatórios para continuar
        </p>
      </div>

      <Card className="p-8 rounded-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="destino" className="text-base font-medium text-gray-700">
              <MapPin className="w-5 h-5 inline mr-2" />
              Cidade ou Loja de Destino
            </Label>
            <Input
              id="destino"
              placeholder="Ex: São Paulo - Loja Shopping ABC"
              value={formData.destino}
              onChange={(e) => handleChange('destino', e.target.value)}
              className={`h-12 rounded-xl text-base ${errors.destino ? 'border-red-500' : ''}`}
            />
            {errors.destino && (
              <p className="text-sm text-red-500">{errors.destino}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="supervisor" className="text-base font-medium text-gray-700">
              <User className="w-5 h-5 inline mr-2" />
              Nome do Supervisor Solicitante
            </Label>
            <Input
              id="supervisor"
              placeholder="Ex: João Silva"
              value={formData.supervisor}
              onChange={(e) => handleChange('supervisor', e.target.value)}
              className={`h-12 rounded-xl text-base ${errors.supervisor ? 'border-red-500' : ''}`}
            />
            {errors.supervisor && (
              <p className="text-sm text-red-500">{errors.supervisor}</p>
            )}
          </div>

          <Button 
            type="submit"
            className="w-full bg-primary hover:bg-primary-600 text-white rounded-xl h-12 text-lg font-medium mt-8"
          >
            Continuar
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default WithdrawalForm;
