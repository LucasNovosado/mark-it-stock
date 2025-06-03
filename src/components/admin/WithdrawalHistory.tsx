
import { useState } from "react";
import { Search, Download, Filter, Calendar, Eye } from "lucide-react";
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

const WithdrawalHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Dados mock do histórico
  const withdrawalHistory = [
    {
      id: 'RET001',
      date: '2024-06-03',
      time: '14:30',
      supervisor: 'João Silva',
      destination: 'São Paulo - Shopping ABC',
      products: [
        { name: 'Banner Roll-up', quantity: 2 },
        { name: 'Flyers A4', quantity: 100 }
      ],
      totalItems: 102,
      photo: '/api/placeholder/300/200',
      signature: '/api/placeholder/200/100'
    },
    {
      id: 'RET002',
      date: '2024-06-03',
      time: '11:15',
      supervisor: 'Maria Santos',
      destination: 'Rio de Janeiro - Loja Centro',
      products: [
        { name: 'Display de Mesa', quantity: 3 }
      ],
      totalItems: 3,
      photo: '/api/placeholder/300/200',
      signature: '/api/placeholder/200/100'
    },
    {
      id: 'RET003',
      date: '2024-06-02',
      time: '16:45',
      supervisor: 'Pedro Costa',
      destination: 'Belo Horizonte - Shopping DEF',
      products: [
        { name: 'Canetas Personalizadas', quantity: 50 },
        { name: 'Chaveiros', quantity: 30 },
        { name: 'Camisetas', quantity: 10 }
      ],
      totalItems: 90,
      photo: '/api/placeholder/300/200',
      signature: '/api/placeholder/200/100'
    },
  ];

  const filteredHistory = withdrawalHistory.filter(withdrawal => {
    const matchesSearch = 
      withdrawal.supervisor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      withdrawal.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      withdrawal.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedFilter === 'today') {
      return matchesSearch && withdrawal.date === '2024-06-03';
    }
    
    return matchesSearch;
  });

  const handleExportData = () => {
    // Em produção, aqui seria implementada a exportação real
    console.log('Exportando dados...', filteredHistory);
    alert('Exportação iniciada! (Demo)');
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Histórico de Retiradas
        </h2>
        
        <Button 
          onClick={handleExportData}
          variant="outline"
          className="rounded-xl"
        >
          <Download className="w-5 h-5 mr-2" />
          Exportar
        </Button>
      </div>

      {/* Filters */}
      <Card className="rounded-2xl border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
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
            
            <div className="sm:w-48">
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
          </div>
        </CardContent>
      </Card>

      {/* History List */}
      <div className="space-y-4">
        {filteredHistory.map((withdrawal) => (
          <Card key={withdrawal.id} className="rounded-2xl border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg text-gray-900">
                      #{withdrawal.id}
                    </h3>
                    <Badge variant="outline" className="rounded-lg">
                      {withdrawal.totalItems} itens
                    </Badge>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(withdrawal.date)} às {withdrawal.time}
                    </div>
                    <div>
                      <strong>Supervisor:</strong> {withdrawal.supervisor}
                    </div>
                    <div className="sm:col-span-2">
                      <strong>Destino:</strong> {withdrawal.destination}
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
                  <DialogContent className="sm:max-w-lg rounded-2xl">
                    <DialogHeader>
                      <DialogTitle>Detalhes da Retirada #{withdrawal.id}</DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-6">
                      {/* Informações básicas */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900">Informações</h4>
                        <div className="bg-gray-50 rounded-xl p-4 space-y-1 text-sm">
                          <p><strong>Data/Hora:</strong> {formatDate(withdrawal.date)} às {withdrawal.time}</p>
                          <p><strong>Supervisor:</strong> {withdrawal.supervisor}</p>
                          <p><strong>Destino:</strong> {withdrawal.destination}</p>
                        </div>
                      </div>

                      {/* Lista de produtos */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900">Produtos Retirados</h4>
                        <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                          {withdrawal.products.map((product, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>{product.name}</span>
                              <span className="font-medium">{product.quantity}x</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Foto e assinatura */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Foto</h4>
                          <div className="bg-gray-100 rounded-xl h-24 flex items-center justify-center">
                            <span className="text-gray-500 text-sm">📷 Foto</span>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Assinatura</h4>
                          <div className="bg-gray-100 rounded-xl h-24 flex items-center justify-center">
                            <span className="text-gray-500 text-sm">✍️ Assinatura</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Products Summary */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-medium text-gray-900 mb-2">Produtos:</h4>
                <div className="flex flex-wrap gap-2">
                  {withdrawal.products.map((product, index) => (
                    <Badge key={index} variant="outline" className="rounded-lg">
                      {product.name} ({product.quantity}x)
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredHistory.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma retirada encontrada
          </h3>
          <p className="text-gray-600">
            {searchTerm || selectedFilter !== 'all' 
              ? 'Tente ajustar os filtros de busca' 
              : 'Ainda não há retiradas registradas'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default WithdrawalHistory;
