// src/hooks/use-dashboard.ts
import { useState, useEffect } from 'react';
import { DashboardService } from '@/services/dashboardService';
import { DashboardStats } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

export const useDashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await DashboardService.getDashboardStats();
      setDashboardData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar dados do dashboard';
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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return {
    dashboardData,
    loading,
    error,
    refetch: fetchDashboardData
  };
};

export const useQuickStats = () => {
  const [quickStats, setQuickStats] = useState({
    totalProducts: 0,
    withdrawalsToday: 0,
    withdrawalsMonth: 0,
    lowStockCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuickStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await DashboardService.getQuickStats();
      setQuickStats(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar estatísticas rápidas';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuickStats();
  }, []);

  return {
    quickStats,
    loading,
    error,
    refetch: fetchQuickStats
  };
};