export type Product = {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  customer_id: string;
  created_at: string;
  updated_at: string;
};

export type ProductWithCustomer = Product & {
  customer: {
    id: string;
    name: string;
    email: string;
  };
};
