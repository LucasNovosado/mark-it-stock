// src/hooks/use-stock.ts
import { useState } from 'react';
import { StockService } from '@/services/stockService';
import { useToast } from '@/hooks/use-toast';

interface WithdrawalItem {
  productId: string;
  quantity: number;
}

interface WithdrawalData {
  destino: string;
  supervisor: string;
  foto_url?: string;
  assinatura_url?: string;
}

export const useStock = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const processWithdrawal = async (
    productId: string,
    quantity: number,
    withdrawalData: WithdrawalData
  ) => {
    try {
      setLoading(true);
      setError(null);

      const result = await StockService.processWithdrawal(
        productId,
        quantity,
        withdrawalData
      );

      toast({
        title: "Retirada Processada",
        description: `${quantity} unidade(s) retirada(s). Estoque atualizado: ${result.previousStock} → ${result.newStock}`,
      });

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao processar retirada';
      setError(errorMessage);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const processMultipleWithdrawals = async (
    items: WithdrawalItem[],
    withdrawalData: WithdrawalData
  ) => {
    try {
      setLoading(true);
      setError(null);

      const results = await StockService.processMultipleWithdrawals(
        items,
        withdrawalData
      );

      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
      toast({
        title: "Retiradas Processadas",
        description: `${totalItems} itens retirados de ${items.length} produto(s) diferentes`,
      });

      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao processar retiradas';
      setError(errorMessage);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addStock = async (productId: string, quantity: number) => {
    try {
      setLoading(true);
      setError(null);

      const result = await StockService.addStock(productId, quantity);

      toast({
        title: "Estoque Adicionado",
        description: `${quantity} unidade(s) adicionada(s). Estoque: ${result.previousStock} → ${result.newStock}`,
      });

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao adicionar estoque';
      setError(errorMessage);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeStock = async (productId: string, quantity: number, reason: string) => {
    try {
      setLoading(true);
      setError(null);

      const result = await StockService.removeStock(productId, quantity, reason);

      toast({
        title: "Estoque Removido",
        description: `${quantity} unidade(s) removida(s). Estoque: ${result.previousStock} → ${result.newStock}`,
      });

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao remover estoque';
      setError(errorMessage);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const validateWithdrawal = async (productId: string, quantity: number) => {
    try {
      const validation = await StockService.validateWithdrawal(productId, quantity);
      
      if (!validation.isValid && validation.message) {
        setError(validation.message);
      }

      return validation;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao validar retirada';
      setError(errorMessage);
      return {
        isValid: false,
        message: errorMessage
      };
    }
  };

  return {
    loading,
    error,
    processWithdrawal,
    processMultipleWithdrawals,
    addStock,
    removeStock,
    validateWithdrawal,
    clearError: () => setError(null)
  };
};

export const useStockStats = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async (startDate?: string, endDate?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await StockService.getStockMovementStats(startDate, endDate);
      setStats(data);
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar estatísticas';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    stats,
    loading,
    error,
    fetchStats
  };
};