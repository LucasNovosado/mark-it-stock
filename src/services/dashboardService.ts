// src/services/dashboardService.ts
import { ProductService } from './productService';
import { WithdrawalService } from './withdrawalService';
import { DashboardStats, CategoryStats } from '@/types/database';

export class DashboardService {
  static async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Buscar dados em paralelo
      const [
        allProducts,
        lowStockProducts,
        todayWithdrawals,
        monthWithdrawals,
        recentWithdrawals,
        productsByCategory
      ] = await Promise.all([
        ProductService.getAllProducts(),
        ProductService.getLowStockProducts(10),
        WithdrawalService.getTodayWithdrawals(),
        WithdrawalService.getMonthWithdrawals(),
        WithdrawalService.getRecentWithdrawals(5),
        ProductService.getProductsByCategory()
      ]);

      // Calcular estatísticas de retiradas
      const todayWithdrawalsCount = todayWithdrawals.reduce((sum, w) => sum + w.quantidade, 0);
      const monthWithdrawalsCount = monthWithdrawals.reduce((sum, w) => sum + w.quantidade, 0);

      // Formatar estatísticas por categoria
      const categoryStats: CategoryStats[] = productsByCategory.map(cat => ({
        categoria: ProductService.getCategoryName(cat.categoria),
        total: cat.count,
        available: cat.total_quantity
      }));

      return {
        totalProducts: allProducts.length,
        totalWithdrawalsToday: todayWithdrawalsCount,
        totalWithdrawalsMonth: monthWithdrawalsCount,
        lowStockProducts: lowStockProducts.length,
        productsByCategory: categoryStats,
        recentWithdrawals,
        lowStockItems: lowStockProducts.map(product => ({
          ...product,
          isLowStock: true
        }))
      };
    } catch (error) {
      console.error('DashboardService.getDashboardStats error:', error);
      throw new Error('Erro ao carregar dados do dashboard');
    }
  }

  static async getQuickStats() {
    try {
      const [products, withdrawalStats] = await Promise.all([
        ProductService.getAllProducts(),
        WithdrawalService.getWithdrawalStats()
      ]);

      const lowStock = await ProductService.getLowStockProducts(10);

      return {
        totalProducts: products.length,
        withdrawalsToday: withdrawalStats.todayCount,
        withdrawalsMonth: withdrawalStats.monthCount,
        lowStockCount: lowStock.length
      };
    } catch (error) {
      console.error('DashboardService.getQuickStats error:', error);
      throw error;
    }
  }

  static async getCategoryInsights() {
    try {
      const categoryData = await ProductService.getProductsByCategory();
      
      return categoryData.map(cat => ({
        category: cat.categoria,
        categoryName: ProductService.getCategoryName(cat.categoria),
        totalProducts: cat.count,
        totalQuantity: cat.total_quantity,
        color: ProductService.getCategoryColor(cat.categoria),
        percentage: 0 // Será calculado no frontend
      }));
    } catch (error) {
      console.error('DashboardService.getCategoryInsights error:', error);
      throw error;
    }
  }

  static calculatePercentages<T extends { totalQuantity: number }>(items: T[]): (T & { percentage: number })[] {
    const total = items.reduce((sum, item) => sum + item.totalQuantity, 0);
    
    return items.map(item => ({
      ...item,
      percentage: total > 0 ? Math.round((item.totalQuantity / total) * 100) : 0
    }));
  }

  static getStockStatus(quantity: number): {
    status: 'low' | 'medium' | 'high';
    color: string;
    label: string;
  } {
    if (quantity <= 5) {
      return {
        status: 'low',
        color: 'text-red-600 bg-red-50',
        label: 'Estoque Baixo'
      };
    } else if (quantity <= 20) {
      return {
        status: 'medium',
        color: 'text-yellow-600 bg-yellow-50',
        label: 'Estoque Médio'
      };
    } else {
      return {
        status: 'high',
        color: 'text-green-600 bg-green-50',
        label: 'Estoque Alto'
      };
    }
  }
}