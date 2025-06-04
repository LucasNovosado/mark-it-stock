// src/services/productService.ts
import { supabase } from '@/integrations/supabase/client';
import { Product, ProductFilters, CategoryType } from '@/types/database';

export class ProductService {
  static async getAllProducts(filters?: ProductFilters): Promise<Product[]> {
    try {
      let query = supabase
        .from('produtos')
        .select('*');

      // Aplicar filtros
      if (filters?.search) {
        query = query.ilike('nome', `%${filters.search}%`);
      }

      if (filters?.category && filters.category !== 'all') {
        query = query.eq('categoria', filters.category);
      }

      // Ordenação
      const sortBy = filters?.sortBy || 'nome';
      const sortOrder = filters?.sortOrder || 'asc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching products:', error);
        throw new Error('Erro ao buscar produtos');
      }

      return data || [];
    } catch (error) {
      console.error('ProductService.getAllProducts error:', error);
      throw error;
    }
  }

  static async getProductById(id: string): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching product:', error);
        throw new Error('Erro ao buscar produto');
      }

      return data;
    } catch (error) {
      console.error('ProductService.getProductById error:', error);
      throw error;
    }
  }

  static async createProduct(product: Omit<Product, 'id' | 'created_at'>): Promise<Product> {
    try {
      const { data, error } = await supabase
        .from('produtos')
        .insert(product)
        .select()
        .single();

      if (error) {
        console.error('Error creating product:', error);
        throw new Error('Erro ao criar produto');
      }

      return data;
    } catch (error) {
      console.error('ProductService.createProduct error:', error);
      throw error;
    }
  }

  static async updateProduct(id: string, updates: Partial<Omit<Product, 'id' | 'created_at'>>): Promise<Product> {
    try {
      const { data, error } = await supabase
        .from('produtos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating product:', error);
        throw new Error('Erro ao atualizar produto');
      }

      return data;
    } catch (error) {
      console.error('ProductService.updateProduct error:', error);
      throw error;
    }
  }

  static async deleteProduct(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('produtos')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting product:', error);
        throw new Error('Erro ao deletar produto');
      }
    } catch (error) {
      console.error('ProductService.deleteProduct error:', error);
      throw error;
    }
  }

  static async getLowStockProducts(threshold: number = 10): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .lte('quantidade_disponivel', threshold)
        .order('quantidade_disponivel', { ascending: true });

      if (error) {
        console.error('Error fetching low stock products:', error);
        throw new Error('Erro ao buscar produtos com estoque baixo');
      }

      return data || [];
    } catch (error) {
      console.error('ProductService.getLowStockProducts error:', error);
      throw error;
    }
  }

  static async getProductsByCategory(): Promise<{ categoria: CategoryType; count: number; total_quantity: number }[]> {
    try {
      const { data, error } = await supabase
        .from('produtos')
        .select('categoria, quantidade_disponivel');

      if (error) {
        console.error('Error fetching products by category:', error);
        throw new Error('Erro ao buscar produtos por categoria');
      }

      // Agrupar por categoria
      const categoryMap = new Map<CategoryType, { count: number; total_quantity: number }>();
      
      data?.forEach(product => {
        const existing = categoryMap.get(product.categoria) || { count: 0, total_quantity: 0 };
        categoryMap.set(product.categoria, {
          count: existing.count + 1,
          total_quantity: existing.total_quantity + product.quantidade_disponivel
        });
      });

      return Array.from(categoryMap.entries()).map(([categoria, stats]) => ({
        categoria,
        count: stats.count,
        total_quantity: stats.total_quantity
      }));
    } catch (error) {
      console.error('ProductService.getProductsByCategory error:', error);
      throw error;
    }
  }

  static getCategoryName(category: CategoryType): string {
    const names = {
      'grafico': 'Gráfico',
      'estrutura_lojas': 'Estrutura de Lojas',
      'brindes': 'Brindes'
    };
    return names[category];
  }

  static getCategoryColor(category: CategoryType): string {
    const colors = {
      'grafico': 'bg-blue-500',
      'estrutura_lojas': 'bg-green-500',
      'brindes': 'bg-purple-500'
    };
    return colors[category];
  }
}
