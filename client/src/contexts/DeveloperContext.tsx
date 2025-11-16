import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface StockStatus {
  [productId: number]: boolean;
}

interface DeveloperContextType {
  isDeveloperMode: boolean;
  stockStatus: StockStatus;
  toggleStockStatus: (productId: number) => void;
}

const DeveloperContext = createContext<DeveloperContextType | undefined>(undefined);

export function DeveloperProvider({ children }: { children: ReactNode }) {
  const [isDeveloperMode, setIsDeveloperMode] = useState(false);
  const [keySequence, setKeySequence] = useState("");
  const [stockStatus, setStockStatus] = useState<StockStatus>(() => {
    const saved = localStorage.getItem("stockStatus");
    return saved ? JSON.parse(saved) : { 1: true, 2: true, 3: false };
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

  useEffect(() => {
    localStorage.setItem("stockStatus", JSON.stringify(stockStatus));
  }, [stockStatus]);

  const toggleStockStatus = (productId: number) => {
    setStockStatus((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
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
