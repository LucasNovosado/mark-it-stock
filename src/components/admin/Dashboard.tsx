// src/components/admin/Dashboard.tsx
import { BarChart3, Package, TrendingUp, AlertCircle, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/hooks/use-dashboard";
import { DashboardService } from "@/services/dashboardService";
import { WithdrawalService } from "@/services/withdrawalService";
import { ProductService } from "@/services/productService";

const Dashboard = () => {
  const { dashboardData, loading, error, refetch } = useDashboard();

  if (loading) {
    return (
      <div className="animate-fade-in text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-lg text-gray-600">Carregando dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="animate-fade-in text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <p className="text-lg text-gray-600 mb-4">{error}</p>
        <Button onClick={refetch} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Tentar Novamente
        </Button>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="animate-fade-in text-center py-12">
        <p className="text-lg text-gray-600">Nenhum dado disponível</p>
      </div>
    );
  }

  const stats = [
    {
      title: "Total de Produtos",
      value: dashboardData.totalProducts.toString(),
      change: "+12%",
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Retiradas Hoje",
      value: dashboardData.totalWithdrawalsToday.toString(),
      change: "+8%",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Produtos em Falta",
      value: dashboardData.lowStockProducts.toString(),
      change: dashboardData.lowStockProducts > 0 ? "+3" : "0",
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      title: "Retiradas Mês",
      value: dashboardData.totalWithdrawalsMonth.toString(),
      change: "+25%",
      icon: BarChart3,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header com botão de refresh */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <Button onClick={refetch} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

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
            {dashboardData.lowStockItems.length === 0 ? (
              <p className="text-center text-gray-500 py-4">
                Nenhum produto com estoque baixo
              </p>
            ) : (
              dashboardData.lowStockItems.slice(0, 5).map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-900">{product.nome}</p>
                    <p className="text-sm text-gray-600">
                      {ProductService.getCategoryName(product.categoria)}
                    </p>
                  </div>
                  <Badge variant="destructive" className="rounded-lg">
                    {product.quantidade_disponivel} restante{product.quantidade_disponivel !== 1 ? 's' : ''}
                  </Badge>
                </div>
              ))
            )}
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
            {dashboardData.recentWithdrawals.length === 0 ? (
              <p className="text-center text-gray-500 py-4">
                Nenhuma retirada registrada
              </p>
            ) : (
              dashboardData.recentWithdrawals.map((withdrawal, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-primary-50 rounded-xl">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-gray-900">
                        {withdrawal.produto?.nome || 'Produto não encontrado'}
                      </p>
                      <span className="text-xs text-gray-500">
                        {WithdrawalService.getTimeAgo(withdrawal.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{withdrawal.supervisor}</p>
                    <p className="text-xs text-gray-500">{withdrawal.destino}</p>
                  </div>
                  <Badge variant="outline" className="ml-3 rounded-lg">
                    {withdrawal.quantidade} itens
                  </Badge>
                </div>
              ))
            )}
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
            {dashboardData.productsByCategory.map((item, index) => {
              const colors = [
                { bg: "bg-blue-500", light: "bg-blue-100" },
                { bg: "bg-green-500", light: "bg-green-100" },
                { bg: "bg-purple-500", light: "bg-purple-100" }
              ];
              const color = colors[index % colors.length];
              const percentage = dashboardData.productsByCategory.length > 0 
                ? Math.round((item.available / dashboardData.productsByCategory.reduce((sum, cat) => sum + cat.available, 0)) * 100)
                : 0;

              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">{item.categoria}</span>
                    <span className="text-sm text-gray-600">
                      {item.available} disponíveis de {item.total} produtos
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full ${color.bg}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;