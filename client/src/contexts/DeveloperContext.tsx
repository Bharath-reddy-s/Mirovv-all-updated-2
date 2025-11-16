import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { StockStatus, Product, CreateProduct, UpdateProduct } from "@shared/schema";

interface DeveloperContextType {
  isDeveloperMode: boolean;
  stockStatus: StockStatus;
  products: Product[];
  toggleStockStatus: (productId: number) => void;
  createProduct: (product: CreateProduct) => Promise<any>;
  updateProduct: (id: number, updates: Partial<UpdateProduct>) => Promise<any>;
  isCreatingProduct: boolean;
  isUpdatingProduct: boolean;
}

const DeveloperContext = createContext<DeveloperContextType | undefined>(undefined);

export function DeveloperProvider({ children }: { children: ReactNode }) {
  const [isDeveloperMode, setIsDeveloperMode] = useState(false);
  const [keySequence, setKeySequence] = useState("");

  const { data: stockStatus = { 1: true, 2: true, 3: false } } = useQuery<StockStatus>({
    queryKey: ["/api/stock"],
  });

  const { data: products = [], refetch: refetchProducts } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const updateStockMutation = useMutation({
    mutationFn: async ({ productId, isInStock }: { productId: number; isInStock: boolean }) => {
      return apiRequest("POST", "/api/stock", { productId, isInStock });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stock"] });
    },
  });

  const createProductMutation = useMutation({
    mutationFn: async (product: CreateProduct) => {
      return apiRequest("POST", "/api/products", product);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<UpdateProduct> }) => {
      return apiRequest("PATCH", `/api/products/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
  });

  const secretPhrase = "dormamu is a aunty";

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key && e.key.length === 1) {
        const newSequence = (keySequence + e.key).toLowerCase();
        setKeySequence(newSequence);

        if (newSequence.includes(secretPhrase)) {
          setIsDeveloperMode(true);
          setKeySequence("");
          refetchProducts();
        }

        if (newSequence.length > secretPhrase.length) {
          setKeySequence(newSequence.slice(-secretPhrase.length));
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [keySequence, refetchProducts]);

  const toggleStockStatus = (productId: number) => {
    const currentStatus = stockStatus[productId] ?? true;
    updateStockMutation.mutate({
      productId,
      isInStock: !currentStatus,
    });
  };

  const createProduct = async (product: CreateProduct) => {
    return createProductMutation.mutateAsync(product);
  };

  const updateProduct = async (id: number, updates: Partial<UpdateProduct>) => {
    return updateProductMutation.mutateAsync({ id, updates });
  };

  return (
    <DeveloperContext.Provider 
      value={{ 
        isDeveloperMode, 
        stockStatus, 
        products,
        toggleStockStatus, 
        createProduct,
        updateProduct,
        isCreatingProduct: createProductMutation.isPending,
        isUpdatingProduct: updateProductMutation.isPending,
      }}
    >
      {children}
    </DeveloperContext.Provider>
  );
}

export function useDeveloper() {
  const context = useContext(DeveloperContext);
  if (!context) {
    throw new Error("useDeveloper must be used within DeveloperProvider");
  }
  return context;
}
