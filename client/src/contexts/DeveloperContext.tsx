import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { StockStatus } from "@shared/schema";

interface DeveloperContextType {
  isDeveloperMode: boolean;
  stockStatus: StockStatus;
  toggleStockStatus: (productId: number) => void;
}

const DeveloperContext = createContext<DeveloperContextType | undefined>(undefined);

export function DeveloperProvider({ children }: { children: ReactNode }) {
  const [isDeveloperMode, setIsDeveloperMode] = useState(false);
  const [keySequence, setKeySequence] = useState("");

  const { data: stockStatus = { 1: true, 2: true, 3: false } } = useQuery<StockStatus>({
    queryKey: ["/api/stock"],
  });

  const updateStockMutation = useMutation({
    mutationFn: async ({ productId, isInStock }: { productId: number; isInStock: boolean }) => {
      return apiRequest("/api/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, isInStock }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stock"] });
    },
  });

  const secretPhrase = "dormamu is a aunty";

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const newSequence = (keySequence + e.key).toLowerCase();
      setKeySequence(newSequence);

      if (newSequence.includes(secretPhrase)) {
        setIsDeveloperMode(true);
        setKeySequence("");
      }

      if (newSequence.length > secretPhrase.length) {
        setKeySequence(newSequence.slice(-secretPhrase.length));
      }
    };

    window.addEventListener("keypress", handleKeyPress);
    return () => window.removeEventListener("keypress", handleKeyPress);
  }, [keySequence]);

  const toggleStockStatus = (productId: number) => {
    const currentStatus = stockStatus[productId] ?? true;
    updateStockMutation.mutate({
      productId,
      isInStock: !currentStatus,
    });
  };

  return (
    <DeveloperContext.Provider value={{ isDeveloperMode, stockStatus, toggleStockStatus }}>
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
