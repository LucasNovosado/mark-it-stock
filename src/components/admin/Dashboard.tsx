
import { BarChart3, Package, TrendingUp, Users, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  // Dados mock (em produção viria do Supabase)
  const stats = [
    {
      title: "Total de Produtos",
      value: "156",
      change: "+12%",
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Retiradas Hoje",
      value: "23",
      change: "+8%",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Produtos em Falta",
      value: "8",
      change: "+3",
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      title: "Retiradas Mês",
      value: "342",
      change: "+25%",
      icon: BarChart3,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ];

  const lowStockProducts = [
    { name: "Banner Roll-up", stock: 2, category: "Gráfico" },
    { name: "Display de Mesa", stock: 1, category: "Estrutura de Lojas" },
    { name: "Camisetas P", stock: 3, category: "Brindes" },
  ];

  const recentWithdrawals = [
    { 
      id: "RET001", 
      supervisor: "João Silva", 
      destination: "São Paulo - Shopping ABC", 
      items: 5,
      time: "há 30 min"
    },
    { 
      id: "RET002", 
      supervisor: "Maria Santos", 
      destination: "Rio de Janeiro - Loja Centro", 
      items: 3,
      time: "há 1h"
    },
    { 
      id: "RET003", 
      supervisor: "Pedro Costa", 
      destination: "Belo Horizonte - Shopping DEF", 
      items: 8,
      time: "há 2h"
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="rounded-2xl border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {stat.title}
                    </p>
                    <div className="flex items-baseline">
                      <h3 className="text-2xl font-bold text-gray-900">
                        {stat.value}
                      </h3>
                      <span className="ml-2 text-sm font-medium text-green-600">
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Produtos com Estoque Baixo */}
        <Card className="rounded-2xl border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              Estoque Baixo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lowStockProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                <div>
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-600">{product.category}</p>
                </div>
                <Badge variant="destructive" className="rounded-lg">
                  {product.stock} restante{product.stock !== 1 ? 's' : ''}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Retiradas Recentes */}
        <Card className="rounded-2xl border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <TrendingUp className="w-5 h-5 text-primary mr-2" />
              Retiradas Recentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentWithdrawals.map((withdrawal, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-primary-50 rounded-xl">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-gray-900">#{withdrawal.id}</p>
                    <span className="text-xs text-gray-500">{withdrawal.time}</span>
                  </div>
                  <p className="text-sm text-gray-600">{withdrawal.supervisor}</p>
                  <p className="text-xs text-gray-500">{withdrawal.destination}</p>
                </div>
                <Badge variant="outline" className="ml-3 rounded-lg">
                  {withdrawal.items} itens
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Estoque por Categoria */}
      <Card className="rounded-2xl border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Estoque por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { category: "Gráfico", total: 65, available: 58, color: "bg-blue-500" },
              { category: "Estrutura de Lojas", total: 45, available: 38, color: "bg-green-500" },
              { category: "Brindes", total: 46, available: 41, color: "bg-purple-500" }
            ].map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">{item.category}</span>
                  <span className="text-sm text-gray-600">
                    {item.available}/{item.total} disponíveis
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full ${item.color}`}
                    style={{ width: `${(item.available / item.total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
