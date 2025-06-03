// src/types/database.ts
export interface Product {
  id: string;
  nome: string;
  categoria: 'grafico' | 'estrutura_lojas' | 'brindes';
  quantidade_disponivel: number;
  imagem_url: string | null;
  created_at: string;
}

export interface Withdrawal {
  id: string;
  produto_id: string;
  quantidade: number;
  destino: string;
  supervisor: string;
  foto_url: string | null;
  assinatura_url: string | null;
  created_at: string;
  // Dados do produto relacionado
  produto?: {
    nome: string;
    categoria: string;
  };
}

export interface Admin {
  id: string;
  email: string;
  nome: string;
  senha_hash: string;
  created_at: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalWithdrawalsToday: number;
  totalWithdrawalsMonth: number;
  lowStockProducts: number;
  productsByCategory: CategoryStats[];
  recentWithdrawals: WithdrawalWithProduct[];
  lowStockItems: ProductWithLowStock[];
}

export interface CategoryStats {
  categoria: string;
  total: number;
  available: number;
}

export interface WithdrawalWithProduct extends Withdrawal {
  produto: {
    nome: string;
    categoria: string;
  };
}

export interface ProductWithLowStock extends Product {
  isLowStock: boolean;
}

export type CategoryType = 'grafico' | 'estrutura_lojas' | 'brindes';

export const CATEGORY_OPTIONS = [
  { value: 'grafico' as CategoryType, label: 'Gráfico' },
  { value: 'estrutura_lojas' as CategoryType, label: 'Estrutura de Lojas' },
  { value: 'brindes' as CategoryType, label: 'Brindes' }
] as const;

export interface ProductFilters {
  search?: string;
  category?: CategoryType | 'all';
  sortBy?: 'nome' | 'quantidade_disponivel' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

export interface WithdrawalFilters {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  supervisor?: string;
  destination?: string;
}