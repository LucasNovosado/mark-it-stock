
import { useState } from "react";
import { Shield, Package, BarChart3, History, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AdminLogin from "@/components/admin/AdminLogin";
import ProductManagement from "@/components/admin/ProductManagement";
import Dashboard from "@/components/admin/Dashboard";
import WithdrawalHistory from "@/components/admin/WithdrawalHistory";

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return <AdminLogin onLogin={() => setIsAuthenticated(true)} />;
  }

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
              <h1 className="text-xl font-bold text-gray-900">
                Painel Administrativo
              </h1>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsAuthenticated(false)}
              className="rounded-xl"
            >
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="dashboard" className="space-y-6">
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
