// src/components/admin/WithdrawalHistory.tsx
import { useState } from "react";
import { Search, Download, Calendar, Eye, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useWithdrawals } from "@/hooks/use-withdrawals";
import { WithdrawalService } from "@/services/withdrawalService";
import { ProductService } from "@/services/productService";
import { WithdrawalFilters } from "@/types/database";

const WithdrawalHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filters: WithdrawalFilters = {
    search: searchTerm,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  };

  // Aplicar filtro de data baseado na seleção
  const today = new Date().toISOString().split('T')[0];
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  if (selectedFilter === 'today') {
    filters.dateFrom = today;
    filters.dateTo = today;
  } else if (selectedFilter === 'week') {
    filters.dateFrom = weekAgo;
  } else if (selectedFilter === 'month') {
    filters.dateFrom = monthAgo;
  }

  const { withdrawals, loading, error, refetch } = useWithdrawals(filters);

  const handleExportData = () => {
    // Implementação básica de exportação para CSV
    const csvContent = [
      ['ID', 'Data', 'Supervisor', 'Destino', 'Produto', 'Quantidade'].join(','),
      ...withdrawals.map(w => [
        w.id,
        WithdrawalService.formatDate(w.created_at),
        w.supervisor,
        w.destino,
        w.produto?.nome || 'N/A',
        w.quantidade
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `retiradas_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && withdrawals.length === 0) {
    return (
      <div className="animate-fade-in text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-lg text-gray-600">Carregando histórico...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Histórico de Retiradas
          </h2>
          <p className="text-gray-600">
            {withdrawals.length} retirada{withdrawals.length !== 1 ? 's' : ''} encontrada{withdrawals.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={refetch} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          
          <Button 
            onClick={handleExportData}
            variant="outline"
            className="rounded-xl"
            disabled={withdrawals.length === 0}
          >
            <Download className="w-5 h-5 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="rounded-2xl border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Buscar por supervisor, destino ou protocolo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 rounded-xl"
                />
              </div>
            </div>
            
            <div>
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="w-full h-12 px-3 border border-gray-300 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">Todas as datas</option>
                <option value="today">Hoje</option>
                <option value="week">Esta semana</option>
                <option value="month">Este mês</option>
              </select>
            </div>

            <div className="flex gap-2">
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-12 rounded-xl"
                placeholder="Data inicial"
              />
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-12 rounded-xl"
                placeholder="Data final"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="rounded-2xl border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-700">{error}</p>
            <Button onClick={refetch} variant="outline" className="mt-2">
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      )}

      {/* History List */}
      <div className="space-y-4">
        {withdrawals.map((withdrawal) => (
          <Card key={withdrawal.id} className="rounded-2xl border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg text-gray-900">
                      #{withdrawal.id.slice(-8).toUpperCase()}
                    </h3>
                    <Badge variant="outline" className="rounded-lg">
                      {withdrawal.quantidade} itens
                    </Badge>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {WithdrawalService.formatDateTime(withdrawal.created_at)}
                    </div>
                    <div>
                      <strong>Supervisor:</strong> {withdrawal.supervisor}
                    </div>
                    <div className="sm:col-span-2">
                      <strong>Destino:</strong> {withdrawal.destino}
                    </div>
                    <div className="sm:col-span-2">
                      <strong>Produto:</strong> {withdrawal.produto?.nome || 'Produto não encontrado'}
                      {withdrawal.produto?.categoria && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {ProductService.getCategoryName(withdrawal.produto.categoria)}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="rounded-lg">
                      <Eye className="w-4 h-4 mr-1" />
                      Detalhes
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        Detalhes da Retirada #{withdrawal.id.slice(-8).toUpperCase()}
                      </DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-6">
                      {/* Informações básicas */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900">Informações</h4>
                        <div className="bg-gray-50 rounded-xl p-4 space-y-1 text-sm">
                          <p><strong>ID:</strong> {withdrawal.id}</p>
                          <p><strong>Data/Hora:</strong> {WithdrawalService.formatDateTime(withdrawal.created_at)}</p>
                          <p><strong>Supervisor:</strong> {withdrawal.supervisor}</p>
                          <p><strong>Destino:</strong> {withdrawal.destino}</p>
                          <p><strong>Quantidade:</strong> {withdrawal.quantidade} unidades</p>
                        </div>
                      </div>

                      {/* Produto */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900">Produto</h4>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="font-medium">{withdrawal.produto?.nome || 'Produto não encontrado'}</p>
                          {withdrawal.produto?.categoria && (
                            <Badge variant="secondary" className="mt-2">
                              {ProductService.getCategoryName(withdrawal.produto.categoria)}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Anexos */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Foto</h4>
                          <div className="bg-gray-100 rounded-xl h-24 flex items-center justify-center">
                            {withdrawal.foto_url ? (
                              <img 
                                src={withdrawal.foto_url} 
                                alt="Foto da retirada"
                                className="w-full h-full object-cover rounded-xl cursor-pointer"
                                onClick={() => window.open(withdrawal.foto_url!, '_blank')}
                              />
                            ) : (
                              <span className="text-gray-500 text-sm">📷 Sem foto</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Assinatura</h4>
                          <div className="bg-gray-100 rounded-xl h-24 flex items-center justify-center">
                            {withdrawal.assinatura_url ? (
                              <img 
                                src={withdrawal.assinatura_url} 
                                alt="Assinatura"
                                className="w-full h-full object-contain rounded-xl cursor-pointer"
                                onClick={() => window.open(withdrawal.assinatura_url!, '_blank')}
                              />
                            ) : (
                              <span className="text-gray-500 text-sm">✍️ Sem assinatura</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Quick Summary */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      {withdrawal.produto?.nome || 'Produto não encontrado'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {withdrawal.quantidade} unidade{withdrawal.quantidade !== 1 ? 's' : ''} retirada{withdrawal.quantidade !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {WithdrawalService.getTimeAgo(withdrawal.created_at)}
                    </p>
                    {withdrawal.foto_url && withdrawal.assinatura_url && (
                      <Badge variant="outline" className="mt-1">
                        ✓ Documentado
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {withdrawals.length === 0 && !loading && (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma retirada encontrada
          </h3>
          <p className="text-gray-600">
            {searchTerm || selectedFilter !== 'all' || dateFrom || dateTo
              ? 'Tente ajustar os filtros de busca' 
              : 'Ainda não há retiradas registradas'
            }
          </p>
        </div>
      )}

      {/* Loading overlay */}
      {loading && withdrawals.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 flex items-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
            <span>Atualizando histórico...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default WithdrawalHistory;