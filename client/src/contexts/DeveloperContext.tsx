import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { StockStatus, Product, CreateProduct, UpdateProduct, PriceFilter } from "@shared/schema";

interface DeveloperContextType {
  isDeveloperMode: boolean;
  stockStatus: StockStatus;
  products: Product[];
  priceFilters: PriceFilter[];
  offerBannerText: string;
  offerTimerHours: number;
  offerTimerMinutes: number;
  offerTimerSeconds: number;
  toggleStockStatus: (productId: number) => void;
  createProduct: (product: CreateProduct) => Promise<any>;
  updateProduct: (id: number, updates: Partial<UpdateProduct>) => Promise<any>;
  deleteProduct: (id: number) => Promise<any>;
  reorderProduct: (productId: number, direction: 'up' | 'down') => Promise<void>;
  createPriceFilter: (value: number) => Promise<any>;
  updatePriceFilter: (id: number, value: number) => Promise<any>;
  deletePriceFilter: (id: number) => Promise<any>;
  updateOfferBanner: (text: string, hours: number, minutes: number, seconds: number) => void;
  isCreatingProduct: boolean;
  isUpdatingProduct: boolean;
  isDeletingProduct: boolean;
  isReordering: boolean;
  isManagingFilters: boolean;
  isLoadingFilters: boolean;
}

const DeveloperContext = createContext<DeveloperContextType | undefined>(undefined);

export function DeveloperProvider({ children }: { children: ReactNode }) {
  const [isDeveloperMode, setIsDeveloperMode] = useState(false);
  const [keySequence, setKeySequence] = useState("");
  const [offerBannerText, setOfferBannerText] = useState(() => {
    const saved = localStorage.getItem("offerBannerText");
    return saved || "₹10 off on every product";
  });
  const [offerTimerHours, setOfferTimerHours] = useState(() => {
    const saved = localStorage.getItem("offerTimerHours");
    return saved ? parseInt(saved) : 168; // Default 7 days = 168 hours
  });
  const [offerTimerMinutes, setOfferTimerMinutes] = useState(() => {
    const saved = localStorage.getItem("offerTimerMinutes");
    return saved ? parseInt(saved) : 0;
  });
  const [offerTimerSeconds, setOfferTimerSeconds] = useState(() => {
    const saved = localStorage.getItem("offerTimerSeconds");
    return saved ? parseInt(saved) : 0;
  });

  const { data: stockStatus = { 1: true, 2: true, 3: false } } = useQuery<StockStatus>({
    queryKey: ["/api/stock"],
  });

  const { data: products = [], refetch: refetchProducts } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: priceFilters = [], isLoading: isLoadingFilters } = useQuery<PriceFilter[]>({
    queryKey: ["/api/price-filters"],
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

  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
  });

  const reorderProductMutation = useMutation({
    mutationFn: async ({ productId, direction }: { productId: number; direction: 'up' | 'down' }) => {
      return apiRequest("POST", "/api/products/reorder", { productId, direction });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
  });

  const createPriceFilterMutation = useMutation({
    mutationFn: async (value: number) => {
      return apiRequest("POST", "/api/price-filters", { value });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/price-filters"] });
    },
  });

  const updatePriceFilterMutation = useMutation({
    mutationFn: async ({ id, value }: { id: number; value: number }) => {
      return apiRequest("PATCH", `/api/price-filters/${id}`, { value });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/price-filters"] });
    },
  });

  const deletePriceFilterMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/price-filters/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/price-filters"] });
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

  const deleteProduct = async (id: number) => {
    return deleteProductMutation.mutateAsync(id);
  };

  const reorderProduct = async (productId: number, direction: 'up' | 'down') => {
    await reorderProductMutation.mutateAsync({ productId, direction });
  };

  const createPriceFilter = async (value: number) => {
    return createPriceFilterMutation.mutateAsync(value);
  };

  const updatePriceFilter = async (id: number, value: number) => {
    return updatePriceFilterMutation.mutateAsync({ id, value });
  };

  const deletePriceFilter = async (id: number) => {
    return deletePriceFilterMutation.mutateAsync(id);
  };

  const updateOfferBanner = (text: string, hours: number, minutes: number, seconds: number) => {
    setOfferBannerText(text);
    setOfferTimerHours(hours);
    setOfferTimerMinutes(minutes);
    setOfferTimerSeconds(seconds);
    localStorage.setItem("offerBannerText", text);
    localStorage.setItem("offerTimerHours", hours.toString());
    localStorage.setItem("offerTimerMinutes", minutes.toString());
    localStorage.setItem("offerTimerSeconds", seconds.toString());
  };

  return (
    <DeveloperContext.Provider 
      value={{ 
        isDeveloperMode, 
        stockStatus, 
        products,
        priceFilters,
        offerBannerText,
        offerTimerHours,
        offerTimerMinutes,
        offerTimerSeconds,
        toggleStockStatus, 
        createProduct,
        updateProduct,
        deleteProduct,
        reorderProduct,
        createPriceFilter,
        updatePriceFilter,
        deletePriceFilter,
        updateOfferBanner,
        isCreatingProduct: createProductMutation.isPending,
        isUpdatingProduct: updateProductMutation.isPending,
        isDeletingProduct: deleteProductMutation.isPending,
        isReordering: reorderProductMutation.isPending,
        isManagingFilters: createPriceFilterMutation.isPending || updatePriceFilterMutation.isPending || deletePriceFilterMutation.isPending,
        isLoadingFilters,
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
