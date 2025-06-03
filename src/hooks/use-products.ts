// src/hooks/use-products.ts
import { useState, useEffect } from 'react';
import { ProductService } from '@/services/productService';
import { Product, ProductFilters } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

export const useProducts = (filters?: ProductFilters) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ProductService.getAllProducts(filters);
      setProducts(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar produtos';
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

  const createProduct = async (productData: Omit<Product, 'id' | 'created_at'>) => {
    try {
      const newProduct = await ProductService.createProduct(productData);
      setProducts(prev => [newProduct, ...prev]);
      toast({
        title: "Sucesso",
        description: "Produto criado com sucesso",
      });
      return newProduct;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar produto';
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Omit<Product, 'id' | 'created_at'>>) => {
    try {
      const updatedProduct = await ProductService.updateProduct(id, updates);
      setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
      toast({
        title: "Sucesso",
        description: "Produto atualizado com sucesso",
      });
      return updatedProduct;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar produto';
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await ProductService.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      toast({
        title: "Sucesso",
        description: "Produto excluído com sucesso",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir produto';
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [filters?.search, filters?.category, filters?.sortBy, filters?.sortOrder]);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct
  };
};

export const useLowStockProducts = (threshold: number = 10) => {
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLowStockProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ProductService.getLowStockProducts(threshold);
      setLowStockProducts(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar produtos com estoque baixo';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLowStockProducts();
  }, [threshold]);

  return {
    lowStockProducts,
    loading,
    error,
    refetch: fetchLowStockProducts
  };
};