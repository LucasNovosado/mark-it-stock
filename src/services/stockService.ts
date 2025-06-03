// src/services/stockService.ts
import { supabase } from '@/integrations/supabase/client';
import { ProductService } from './productService';
import { WithdrawalService } from './withdrawalService';

export class StockService {
  /**
   * Processa uma retirada e atualiza o estoque automaticamente
   */
  static async processWithdrawal(
    productId: string, 
    quantity: number, 
    withdrawalData: {
      destino: string;
      supervisor: string;
      foto_url?: string;
      assinatura_url?: string;
    }
  ) {
    try {
      // Iniciar uma transação
      const { data: product, error: productError } = await supabase
        .from('produtos')
        .select('*')
        .eq('id', productId)
        .single();

      if (productError || !product) {
        throw new Error('Produto não encontrado');
      }

      // Verificar se há estoque suficiente
      if (product.quantidade_disponivel < quantity) {
        throw new Error(`Estoque insuficiente. Disponível: ${product.quantidade_disponivel}, Solicitado: ${quantity}`);
      }

      // Criar o registro de retirada
      const { data: withdrawal, error: withdrawalError } = await supabase
        .from('retiradas')
        .insert({
          produto_id: productId,
          quantidade: quantity,
          destino: withdrawalData.destino,
          supervisor: withdrawalData.supervisor,
          foto_url: withdrawalData.foto_url || null,
          assinatura_url: withdrawalData.assinatura_url || null,
        })
        .select()
        .single();

      if (withdrawalError) {
        throw new Error('Erro ao registrar retirada');
      }

      // Atualizar o estoque do produto
      const newQuantity = product.quantidade_disponivel - quantity;
      const { error: updateError } = await supabase
        .from('produtos')
        .update({ quantidade_disponivel: newQuantity })
        .eq('id', productId);

      if (updateError) {
        // Se falhar ao atualizar o estoque, remover a retirada
        await supabase
          .from('retiradas')
          .delete()
          .eq('id', withdrawal.id);
        
        throw new Error('Erro ao atualizar estoque');
      }

      return {
        withdrawal,
        previousStock: product.quantidade_disponivel,
        newStock: newQuantity
      };
    } catch (error) {
      console.error('StockService.processWithdrawal error:', error);
      throw error;
    }
  }

  /**
   * Processa múltiplas retiradas em uma única transação
   */
  static async processMultipleWithdrawals(
    items: Array<{
      productId: string;
      quantity: number;
    }>,
    withdrawalData: {
      destino: string;
      supervisor: string;
      foto_url?: string;
      assinatura_url?: string;
    }
  ) {
    try {
      const results = [];
      
      // Verificar estoque de todos os produtos primeiro
      for (const item of items) {
        const product = await ProductService.getProductById(item.productId);
        if (!product) {
          throw new Error(`Produto ${item.productId} não encontrado`);
        }
        if (product.quantidade_disponivel < item.quantity) {
          throw new Error(`Estoque insuficiente para ${product.nome}. Disponível: ${product.quantidade_disponivel}, Solicitado: ${item.quantity}`);
        }
      }

      // Processar cada retirada
      for (const item of items) {
        const result = await this.processWithdrawal(
          item.productId,
          item.quantity,
          withdrawalData
        );
        results.push(result);
      }

      return results;
    } catch (error) {
      console.error('StockService.processMultipleWithdrawals error:', error);
      throw error;
    }
  }

  /**
   * Adiciona estoque a um produto
   */
  static async addStock(productId: string, quantity: number): Promise<{ previousStock: number; newStock: number }> {
    try {
      const product = await ProductService.getProductById(productId);
      if (!product) {
        throw new Error('Produto não encontrado');
      }

      const newQuantity = product.quantidade_disponivel + quantity;
      await ProductService.updateProduct(productId, {
        quantidade_disponivel: newQuantity
      });

      return {
        previousStock: product.quantidade_disponivel,
        newStock: newQuantity
      };
    } catch (error) {
      console.error('StockService.addStock error:', error);
      throw error;
    }
  }

  /**
   * Remove estoque de um produto (para ajustes manuais)
   */
  static async removeStock(productId: string, quantity: number, reason: string): Promise<{ previousStock: number; newStock: number }> {
    try {
      const product = await ProductService.getProductById(productId);
      if (!product) {
        throw new Error('Produto não encontrado');
      }

      if (product.quantidade_disponivel < quantity) {
        throw new Error(`Estoque insuficiente. Disponível: ${product.quantidade_disponivel}, Tentando remover: ${quantity}`);
      }

      const newQuantity = product.quantidade_disponivel - quantity;
      await ProductService.updateProduct(productId, {
        quantidade_disponivel: newQuantity
      });

      // Registrar o ajuste como uma retirada especial
      await supabase
        .from('retiradas')
        .insert({
          produto_id: productId,
          quantidade: quantity,
          destino: 'AJUSTE_MANUAL',
          supervisor: 'SISTEMA',
          foto_url: null,
          assinatura_url: null,
        });

      return {
        previousStock: product.quantidade_disponivel,
        newStock: newQuantity
      };
    } catch (error) {
      console.error('StockService.removeStock error:', error);
      throw error;
    }
  }

  /**
   * Calcula estatísticas de movimentação de estoque
   */
  static async getStockMovementStats(startDate?: string, endDate?: string) {
    try {
      let query = supabase
        .from('retiradas')
        .select(`
          *,
          produto:produtos(nome, categoria)
        `);

      if (startDate) {
        query = query.gte('created_at', startDate);
      }

      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      const { data: withdrawals, error } = await query;

      if (error) {
        throw new Error('Erro ao buscar movimentações');
      }

      // Calcular estatísticas
      const totalWithdrawals = withdrawals?.length || 0;
      const totalItems = withdrawals?.reduce((sum, w) => sum + w.quantidade, 0) || 0;
      
      // Agrupar por categoria
      const byCategory = withdrawals?.reduce((acc, w) => {
        const category = w.produto?.categoria || 'unknown';
        if (!acc[category]) {
          acc[category] = { count: 0, quantity: 0 };
        }
        acc[category].count += 1;
        acc[category].quantity += w.quantidade;
        return acc;
      }, {} as Record<string, { count: number; quantity: number }>) || {};

      // Top produtos mais retirados
      const productCounts = withdrawals?.reduce((acc, w) => {
        const productName = w.produto?.nome || 'Produto não encontrado';
        if (!acc[productName]) {
          acc[productName] = 0;
        }
        acc[productName] += w.quantidade;
        return acc;
      }, {} as Record<string, number>) || {};

      const topProducts = Object.entries(productCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([name, quantity]) => ({ name, quantity }));

      return {
        totalWithdrawals,
        totalItems,
        byCategory,
        topProducts
      };
    } catch (error) {
      console.error('StockService.getStockMovementStats error:', error);
      throw error;
    }
  }

  /**
   * Valida se uma retirada é possível
   */
  static async validateWithdrawal(productId: string, quantity: number): Promise<{
    isValid: boolean;
    message?: string;
    availableStock?: number;
  }> {
    try {
      const product = await ProductService.getProductById(productId);
      
      if (!product) {
        return {
          isValid: false,
          message: 'Produto não encontrado'
        };
      }

      if (product.quantidade_disponivel < quantity) {
        return {
          isValid: false,
          message: `Estoque insuficiente. Disponível: ${product.quantidade_disponivel}`,
          availableStock: product.quantidade_disponivel
        };
      }

      return {
        isValid: true,
        availableStock: product.quantidade_disponivel
      };
    } catch (error) {
      console.error('StockService.validateWithdrawal error:', error);
      return {
        isValid: false,
        message: 'Erro ao validar retirada'
      };
    }
  }
}