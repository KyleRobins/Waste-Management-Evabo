"use client";

import { DataTable } from "@/components/shared/data-table";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { columns } from "@/components/products/columns";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CreateProductDialog } from "@/components/products/create-product-dialog";
import { EditProductDialog } from "@/components/products/edit-product-dialog";
import { useProductData } from "@/lib/hooks/use-product-data";

export default function ProductsPage() {
  const {
    products,
    loading,
    selectedProduct,
    openCreate,
    openEdit,
    setOpenCreate,
    setOpenEdit,
    handleCreate,
    handleUpdate,
    handleDelete,
    selectProduct,
  } = useProductData();

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
          onEdit: selectProduct,
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
