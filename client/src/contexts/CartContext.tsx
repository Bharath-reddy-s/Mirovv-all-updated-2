import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import type { FlashOffer } from "@shared/schema";

interface CartItem {
  id: number;
  productCode?: string;
  title: string;
  label: string;
  price: string;
  image: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  cartCount: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [flashTimeLeft, setFlashTimeLeft] = useState(0);
  const wasFlashOfferActive = useRef(false);
  const { toast } = useToast();

  const { data: flashOffer } = useQuery<FlashOffer | null>({
    queryKey: ["/api/flash-offer"],
    refetchInterval: 1000,
  });

  useEffect(() => {
    setIsHydrated(true);
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error("Failed to parse cart:", error);
      }
    }
  }, []);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("cart", JSON.stringify(items));
    }
  }, [items, isHydrated]);

  useEffect(() => {
    if (!flashOffer?.isActive || !flashOffer?.endsAt) {
      setFlashTimeLeft(0);
      return;
    }

    const calculateFlashTimeLeft = () => {
      const now = Date.now();
      const endTime = new Date(flashOffer.endsAt!).getTime();
      const difference = Math.max(0, Math.floor((endTime - now) / 1000));
      setFlashTimeLeft(difference);
    };

    calculateFlashTimeLeft();
    const timer = setInterval(calculateFlashTimeLeft, 100);

    return () => clearInterval(timer);
  }, [flashOffer?.isActive, flashOffer?.endsAt]);

  const isFlashOfferActive = flashOffer?.isActive && flashTimeLeft > 0 && 
    (flashOffer?.claimedCount ?? 0) < (flashOffer?.maxClaims ?? 0);

  useEffect(() => {
    if (isFlashOfferActive && !wasFlashOfferActive.current && items.length > 0) {
      setItems([]);
      localStorage.removeItem("cart");
      toast({
        title: "Cart cleared for Flash Sale!",
        description: "Start fresh with the flash offer",
        duration: 2000,
      });
    }
    wasFlashOfferActive.current = !!isFlashOfferActive;
  }, [isFlashOfferActive, items.length, toast]);

  const addToCart = (item: Omit<CartItem, "quantity">) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === item.id);
      if (existingItem) {
        toast({
          title: "Quantity updated in cart",
          duration: 1500,
        });
        return prevItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      toast({
        title: "Added to cart",
        duration: 1500,
      });
      return [...prevItems, { ...item, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: number) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
    toast({
      title: "Removed from cart",
      duration: 1500,
    });
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity < 1) return;
    setItems((prevItems) =>
      prevItems.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
    toast({
      title: "Cart cleared",
      duration: 1500,
    });
  };

  const cartCount = items.reduce((total, item) => total + item.quantity, 0);

  const subtotal = items.reduce((total, item) => {
    const price = parseInt(item.price.replace("₹", ""));
    return total + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        cartCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
