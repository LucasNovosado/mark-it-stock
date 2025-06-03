// src/pages/Admin.tsx
import { useState, useEffect } from "react";
import { Shield, Package, BarChart3, History, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import AdminLogin from "@/components/admin/AdminLogin";
import ProductManagement from "@/components/admin/ProductManagement";
import Dashboard from "@/components/admin/Dashboard";
import WithdrawalHistory from "@/components/admin/WithdrawalHistory";
import { useAdminAuth } from "@/hooks/use-admin-auth";

const Admin = () => {
  const { admin, isAuthenticated, loading, logout } = useAdminAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');

  // Se ainda está carregando, mostrar loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se não está autenticado, mostrar tela de login
  if (!isAuthenticated) {
    return <AdminLogin onLogin={() => {}} />;
  }

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center mr-3">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Painel Administrativo
                </h1>
                {admin && (
                  <p className="text-sm text-gray-600">
                    Bem-vindo, {admin.nome}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {admin && (
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="hidden md:flex">
                    <User className="w-3 h-3 mr-1" />
                    {admin.email}
                  </Badge>
                </div>
              )}
              <Button
                variant="outline"
                onClick={handleLogout}
                className="rounded-xl flex items-center"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid rounded-xl">
            <TabsTrigger value="dashboard" className="rounded-lg">
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="products" className="rounded-lg">
              <Package className="w-4 h-4 mr-2" />
              Produtos
            </TabsTrigger>
            <TabsTrigger value="history" className="rounded-lg">
              <History className="w-4 h-4 mr-2" />
              Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard />
          </TabsContent>

          <TabsContent value="products">
            <ProductManagement />
          </TabsContent>

          <TabsContent value="history">
            <WithdrawalHistory />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;