
import { useState } from "react";
import { Shield, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface AdminLoginProps {
  onLogin: () => void;
}

const AdminLogin = ({ onLogin }: AdminLoginProps) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação simples (em produção, seria validado no backend)
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Senha é obrigatória';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      // Login mock - em produção seria validado com Supabase
      if (formData.email === 'admin@empresa.com' && formData.password === 'admin123') {
        onLogin();
      } else {
        setErrors({ general: 'Email ou senha incorretos' });
      }
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
      <div className="w-full max-w-md mx-4">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 rounded-xl"
        >
          ← Voltar ao Início
        </Button>

        <Card className="rounded-2xl shadow-xl border-0">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-primary rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Acesso Administrativo
            </CardTitle>
            <p className="text-gray-600">
              Entre com suas credenciais para acessar o painel
            </p>
          </CardHeader>

          <CardContent className="pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                  <p className="text-sm text-red-600">{errors.general}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-base font-medium text-gray-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@empresa.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={`h-12 rounded-xl text-base ${errors.email ? 'border-red-500' : ''}`}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-base font-medium text-gray-700">
                  Senha
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className={`h-12 rounded-xl text-base pr-12 ${errors.password ? 'border-red-500' : ''}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-0 h-12 px-3 rounded-r-xl"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              <Button 
                type="submit"
                className="w-full bg-primary hover:bg-primary-600 text-white rounded-xl h-12 text-lg font-medium"
              >
                Entrar
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Credenciais de teste:<br />
                <span className="font-mono bg-gray-100 px-2 py-1 rounded">admin@empresa.com / admin123</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;
