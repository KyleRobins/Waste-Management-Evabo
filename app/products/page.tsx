"use client";

import { DataTable } from "@/components/shared/data-table";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { columns } from "@/components/products/columns";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState, useEffect } from "react";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/services/products.service";
import { Product } from "@/lib/types/products";
import { useToast } from "@/hooks/use-toast";
import { CreateProductDialog } from "@/components/products/create-product-dialog";
import { EditProductDialog } from "@/components/products/edit-product-dialog";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
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

  const handleCreate = async (
    product: Omit<Product, "id" | "created_at" | "updated_at">
  ) => {
    try {
      await createProduct(product);
      toast({
        title: "Success",
        description: "Product created successfully",
      });
      loadProducts();
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
      loadProducts();
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
      loadProducts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Products
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage products created from recycled materials
          </p>
        </div>
        <Button onClick={() => setOpenCreate(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <DataTable
        columns={columns({
          onEdit: (product) => {
            setSelectedProduct(product);
            setOpenEdit(true);
          },
          onDelete: handleDelete,
        })}
        data={products}
      />

      <CreateProductDialog
        open={openCreate}
        onOpenChange={setOpenCreate}
        onSubmit={handleCreate}
      />

      {selectedProduct && (
        <EditProductDialog
          open={openEdit}
          onOpenChange={setOpenEdit}
          product={selectedProduct}
          onSubmit={handleUpdate}
        />
      )}
    </div>
  );
}
