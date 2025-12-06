import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { StockStatus, Product, CreateProduct, UpdateProduct, PriceFilter, PromotionalSettings, FlashOffer } from "@shared/schema";

interface DeveloperContextType {
  isDeveloperMode: boolean;
  stockStatus: StockStatus;
  products: Product[];
  priceFilters: PriceFilter[];
  promotionalSettings: PromotionalSettings | null;
  flashOffer: FlashOffer | null;
  toggleStockStatus: (productId: number) => void;
  createProduct: (product: CreateProduct) => Promise<any>;
  updateProduct: (id: number, updates: Partial<UpdateProduct>) => Promise<any>;
  deleteProduct: (id: number) => Promise<any>;
  reorderProduct: (productId: number, direction: 'up' | 'down') => Promise<void>;
  setProductPosition: (productId: number, position: number) => Promise<void>;
  createPriceFilter: (value: number) => Promise<any>;
  updatePriceFilter: (id: number, value: number) => Promise<any>;
  deletePriceFilter: (id: number) => Promise<any>;
  updateOfferBanner: (text: string, days: number, deliveryText: string) => Promise<void>;
  startFlashOffer: () => Promise<FlashOffer>;
  stopFlashOffer: () => Promise<FlashOffer | null>;
  isCreatingProduct: boolean;
  isUpdatingProduct: boolean;
  isDeletingProduct: boolean;
  isReordering: boolean;
  isManagingFilters: boolean;
  isLoadingFilters: boolean;
  isUpdatingPromotionalSettings: boolean;
  isTogglingFlashOffer: boolean;
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

  const { data: priceFilters = [], isLoading: isLoadingFilters } = useQuery<PriceFilter[]>({
    queryKey: ["/api/price-filters"],
  });

  const { data: promotionalSettings = null } = useQuery<PromotionalSettings>({
    queryKey: ["/api/promotional-settings"],
  });

  const { data: flashOffer = null } = useQuery<FlashOffer | null>({
    queryKey: ["/api/flash-offer"],
    refetchInterval: 1000,
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

  const setProductPositionMutation = useMutation({
    mutationFn: async ({ productId, position }: { productId: number; position: number }) => {
      return apiRequest("POST", "/api/products/set-position", { productId, position });
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

  const updatePromotionalSettingsMutation = useMutation({
    mutationFn: async ({ bannerText, timerDays, deliveryText }: { bannerText: string; timerDays: number; deliveryText: string }) => {
      return apiRequest("PATCH", "/api/promotional-settings", { bannerText, timerDays, deliveryText });
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/promotional-settings"], data);
      queryClient.invalidateQueries({ queryKey: ["/api/promotional-settings"] });
    },
  });

  const startFlashOfferMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/flash-offer/start");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/flash-offer"] });
    },
  });

  const stopFlashOfferMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/flash-offer/stop");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/flash-offer"] });
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

  const setProductPosition = async (productId: number, position: number) => {
    await setProductPositionMutation.mutateAsync({ productId, position });
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

  const updateOfferBanner = async (text: string, days: number, deliveryText: string) => {
    await updatePromotionalSettingsMutation.mutateAsync({ bannerText: text, timerDays: days, deliveryText });
  };

  const startFlashOffer = async (): Promise<FlashOffer> => {
    return startFlashOfferMutation.mutateAsync();
  };

  const stopFlashOffer = async (): Promise<FlashOffer | null> => {
    return stopFlashOfferMutation.mutateAsync();
  };

  return (
    <DeveloperContext.Provider 
      value={{ 
        isDeveloperMode, 
        stockStatus, 
        products,
        priceFilters,
        promotionalSettings,
        flashOffer,
        toggleStockStatus, 
        createProduct,
        updateProduct,
        deleteProduct,
        reorderProduct,
        setProductPosition,
        createPriceFilter,
        updatePriceFilter,
        deletePriceFilter,
        updateOfferBanner,
        startFlashOffer,
        stopFlashOffer,
        isCreatingProduct: createProductMutation.isPending,
        isUpdatingProduct: updateProductMutation.isPending,
        isDeletingProduct: deleteProductMutation.isPending,
        isReordering: reorderProductMutation.isPending || setProductPositionMutation.isPending,
        isManagingFilters: createPriceFilterMutation.isPending || updatePriceFilterMutation.isPending || deletePriceFilterMutation.isPending,
        isLoadingFilters,
        isUpdatingPromotionalSettings: updatePromotionalSettingsMutation.isPending,
        isTogglingFlashOffer: startFlashOfferMutation.isPending || stopFlashOfferMutation.isPending,
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
