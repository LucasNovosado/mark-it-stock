// src/services/withdrawalService.ts
import { supabase } from '@/integrations/supabase/client';
import { Withdrawal, WithdrawalWithProduct, WithdrawalFilters } from '@/types/database';

export class WithdrawalService {
  static async getAllWithdrawals(filters?: WithdrawalFilters): Promise<WithdrawalWithProduct[]> {
    try {
      let query = supabase
        .from('retiradas')
        .select(`
          *,
          produto:produtos(nome, categoria)
        `);

      // Aplicar filtros
      if (filters?.search) {
        query = query.or(`supervisor.ilike.%${filters.search}%,destino.ilike.%${filters.search}%`);
      }

      if (filters?.supervisor) {
        query = query.ilike('supervisor', `%${filters.supervisor}%`);
      }

      if (filters?.destination) {
        query = query.ilike('destino', `%${filters.destination}%`);
      }

      if (filters?.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }

      if (filters?.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      // Ordenar por data mais recente
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching withdrawals:', error);
        throw new Error('Erro ao buscar retiradas');
      }

      return data || [];
    } catch (error) {
      console.error('WithdrawalService.getAllWithdrawals error:', error);
      throw error;
    }
  }

  static async getWithdrawalById(id: string): Promise<WithdrawalWithProduct | null> {
    try {
      const { data, error } = await supabase
        .from('retiradas')
        .select(`
          *,
          produto:produtos(nome, categoria)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching withdrawal:', error);
        throw new Error('Erro ao buscar retirada');
      }

      return data;
    } catch (error) {
      console.error('WithdrawalService.getWithdrawalById error:', error);
      throw error;
    }
  }

  static async getTodayWithdrawals(): Promise<WithdrawalWithProduct[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('retiradas')
        .select(`
          *,
          produto:produtos(nome, categoria)
        `)
        .gte('created_at', `${today}T00:00:00.000Z`)
        .lte('created_at', `${today}T23:59:59.999Z`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching today withdrawals:', error);
        throw new Error('Erro ao buscar retiradas de hoje');
      }

      return data || [];
    } catch (error) {
      console.error('WithdrawalService.getTodayWithdrawals error:', error);
      throw error;
    }
  }

  static async getMonthWithdrawals(): Promise<WithdrawalWithProduct[]> {
    try {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      const { data, error } = await supabase
        .from('retiradas')
        .select(`
          *,
          produto:produtos(nome, categoria)
        `)
        .gte('created_at', firstDay.toISOString())
        .lte('created_at', lastDay.toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching month withdrawals:', error);
        throw new Error('Erro ao buscar retiradas do mês');
      }

      return data || [];
    } catch (error) {
      console.error('WithdrawalService.getMonthWithdrawals error:', error);
      throw error;
    }
  }

  static async getRecentWithdrawals(limit: number = 5): Promise<WithdrawalWithProduct[]> {
    try {
      const { data, error } = await supabase
        .from('retiradas')
        .select(`
          *,
          produto:produtos(nome, categoria)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching recent withdrawals:', error);
        throw new Error('Erro ao buscar retiradas recentes');
      }

      return data || [];
    } catch (error) {
      console.error('WithdrawalService.getRecentWithdrawals error:', error);
      throw error;
    }
  }

  static async createWithdrawal(withdrawal: Omit<Withdrawal, 'id' | 'created_at'>): Promise<Withdrawal> {
    try {
      const { data, error } = await supabase
        .from('retiradas')
        .insert(withdrawal)
        .select()
        .single();

      if (error) {
        console.error('Error creating withdrawal:', error);
        throw new Error('Erro ao criar retirada');
      }

      return data;
    } catch (error) {
      console.error('WithdrawalService.createWithdrawal error:', error);
      throw error;
    }
  }

  static async getWithdrawalStats() {
    try {
      // Total de retiradas hoje
      const todayWithdrawals = await this.getTodayWithdrawals();
      const todayCount = todayWithdrawals.reduce((sum, w) => sum + w.quantidade, 0);

      // Total de retiradas do mês
      const monthWithdrawals = await this.getMonthWithdrawals();
      const monthCount = monthWithdrawals.reduce((sum, w) => sum + w.quantidade, 0);

      return {
        todayCount,
        monthCount,
        todayWithdrawals: todayWithdrawals.length,
        monthWithdrawals: monthWithdrawals.length
      };
    } catch (error) {
      console.error('WithdrawalService.getWithdrawalStats error:', error);
      throw error;
    }
  }

  static formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  static formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  static getTimeAgo(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'agora';
    if (diffInMinutes < 60) return `há ${diffInMinutes} min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `há ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `há ${diffInDays} dia${diffInDays > 1 ? 's' : ''}`;
  }
}