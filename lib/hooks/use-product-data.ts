"use client";

import { useState, useEffect } from "react";
import { 
  getProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from "@/lib/services/products.service";
import { Product, ProductWithCustomer } from "@/lib/types/products";
import { useToast } from "@/hooks/use-toast";

interface UseProductDataReturn {
  products: ProductWithCustomer[];
  loading: boolean;
  selectedProduct: Product | null;
  openCreate: boolean;
  openEdit: boolean;
  setOpenCreate: (open: boolean) => void;
  setOpenEdit: (open: boolean) => void;
  refreshData: () => Promise<void>;
  handleCreate: (product: Omit<Product, "id" | "created_at" | "updated_at">) => Promise<void>;
  handleUpdate: (id: string, updates: Partial<Product>) => Promise<void>;
  handleDelete: (id: string) => Promise<void>;
  selectProduct: (product: Product) => void;
}

export function useProductData(): UseProductDataReturn {
  const [products, setProducts] = useState<ProductWithCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  const refreshData = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleCreate = async (
    product: Omit<Product, "id" | "created_at" | "updated_at">
  ) => {
    try {
      await createProduct(product);
      toast({
        title: "Success",
        description: "Product created successfully",
      });
      refreshData();
      setOpenCreate(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create product",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async (id: string, updates: Partial<Product>) => {
    try {
      await updateProduct(id, updates);
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
      refreshData();
      setOpenEdit(false);
      setSelectedProduct(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update product",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      refreshData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const selectProduct = (product: Product) => {
    setSelectedProduct(product);
    setOpenEdit(true);
  };

  return {
    products,
    loading,
    selectedProduct,
    openCreate,
    openEdit,
    setOpenCreate,
    setOpenEdit,
    refreshData,
    handleCreate,
    handleUpdate,
    handleDelete,
    selectProduct
  };
} 