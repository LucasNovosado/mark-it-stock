// src/hooks/use-withdrawals.ts
import { useState, useEffect } from 'react';
import { WithdrawalService } from '@/services/withdrawalService';
import { WithdrawalWithProduct, WithdrawalFilters, Withdrawal } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

export const useWithdrawals = (filters?: WithdrawalFilters) => {
  const [withdrawals, setWithdrawals] = useState<WithdrawalWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await WithdrawalService.getAllWithdrawals(filters);
      setWithdrawals(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar retiradas';
      setError(errorMessage);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createWithdrawal = async (withdrawalData: Omit<Withdrawal, 'id' | 'created_at'>) => {
    try {
      const newWithdrawal = await WithdrawalService.createWithdrawal(withdrawalData);
      // Refresh the list after creating
      await fetchWithdrawals();
      toast({
        title: "Sucesso",
        description: "Retirada registrada com sucesso",
      });
      return newWithdrawal;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao registrar retirada';
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, [filters?.search, filters?.dateFrom, filters?.dateTo, filters?.supervisor, filters?.destination]);

  return {
    withdrawals,
    loading,
    error,
    refetch: fetchWithdrawals,
    createWithdrawal
  };
};

export const useRecentWithdrawals = (limit: number = 5) => {
  const [recentWithdrawals, setRecentWithdrawals] = useState<WithdrawalWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecentWithdrawals = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await WithdrawalService.getRecentWithdrawals(limit);
      setRecentWithdrawals(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar retiradas recentes';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentWithdrawals();
  }, [limit]);

  return {
    recentWithdrawals,
    loading,
    error,
    refetch: fetchRecentWithdrawals
  };
};

export const useWithdrawalStats = () => {
  const [stats, setStats] = useState({
    todayCount: 0,
    monthCount: 0,
    todayWithdrawals: 0,
    monthWithdrawals: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await WithdrawalService.getWithdrawalStats();
      setStats(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar estatísticas';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  };
};

export const useTodayWithdrawals = () => {
  const [todayWithdrawals, setTodayWithdrawals] = useState<WithdrawalWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTodayWithdrawals = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await WithdrawalService.getTodayWithdrawals();
      setTodayWithdrawals(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar retiradas de hoje';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayWithdrawals();
  }, []);

  return {
    todayWithdrawals,
    loading,
    error,
    refetch: fetchTodayWithdrawals
  };
};

export const useMonthWithdrawals = () => {
  const [monthWithdrawals, setMonthWithdrawals] = useState<WithdrawalWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMonthWithdrawals = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await WithdrawalService.getMonthWithdrawals();
      setMonthWithdrawals(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar retiradas do mês';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthWithdrawals();
  }, []);

  return {
    monthWithdrawals,
    loading,
    error,
    refetch: fetchMonthWithdrawals
  };
};

export const useWithdrawalById = (id: string | null) => {
  const [withdrawal, setWithdrawal] = useState<WithdrawalWithProduct | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWithdrawal = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await WithdrawalService.getWithdrawalById(id);
      setWithdrawal(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar retirada';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawal();
  }, [id]);

  return {
    withdrawal,
    loading,
    error,
    refetch: fetchWithdrawal
  };
};