// src/hooks/use-admin-auth.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Admin {
  id: string;
  email: string;
  nome: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

export const useAdminAuth = () => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();

  // Verificar se há sessão ativa no localStorage
  useEffect(() => {
    const checkSession = () => {
      try {
        const adminData = localStorage.getItem('admin_session');
        if (adminData) {
          const parsedAdmin = JSON.parse(adminData);
          setAdmin(parsedAdmin);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        localStorage.removeItem('admin_session');
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setLoading(true);

      // Buscar admin no banco de dados
      const { data: adminData, error } = await supabase
        .from('admins')
        .select('id, email, nome, senha_hash')
        .eq('email', credentials.email)
        .single();

      if (error || !adminData) {
        toast({
          title: "Erro de Login",
          description: "Email ou senha incorretos",
          variant: "destructive",
        });
        return false;
      }

      // Verificar senha (aqui você implementaria a verificação de hash real)
      // Por simplicidade, vou usar comparação direta, mas em produção use bcrypt
      if (adminData.senha_hash !== credentials.password) {
        toast({
          title: "Erro de Login",
          description: "Email ou senha incorretos",
          variant: "destructive",
        });
        return false;
      }

      // Login bem-sucedido
      const adminSession = {
        id: adminData.id,
        email: adminData.email,
        nome: adminData.nome,
      };

      setAdmin(adminSession);
      setIsAuthenticated(true);
      localStorage.setItem('admin_session', JSON.stringify(adminSession));

      toast({
        title: "Login realizado",
        description: `Bem-vindo, ${adminData.nome}!`,
      });

      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Erro",
        description: "Erro interno do servidor",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setAdmin(null);
    setIsAuthenticated(false);
    localStorage.removeItem('admin_session');
    
    toast({
      title: "Logout realizado",
      description: "Sessão encerrada com sucesso",
    });
  };

  return {
    admin,
    isAuthenticated,
    loading,
    login,
    logout,
  };
};