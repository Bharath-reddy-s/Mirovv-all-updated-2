import { ShoppingCart, Bell, Box } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { Link, useLocation } from "wouter";

export default function Navbar() {
  const { setIsCartOpen, cartCount } = useCart();
  const [location] = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800">
      <div className="container mx-auto px-6 h-16 flex items-center justify-start gap-3 md:gap-4">
        <Link href="/" onClick={() => setIsCartOpen(false)}>
          <div className="flex items-center cursor-pointer hover-elevate active-elevate-2 p-2 rounded-md" data-testid="link-home-logo">
            <Box className="w-6 h-6 text-black dark:text-white" />
          </div>
        </Link>

        <div className="flex items-center gap-2 md:gap-6">
          <Link href="/" onClick={() => setIsCartOpen(false)}>
            <Button 
              className={`rounded-full px-6 h-9 text-sm font-medium ${
                location === "/" 
                  ? "bg-black dark:bg-white text-white dark:text-black" 
                  : "bg-transparent text-black dark:text-white"
              }`}
              variant={location === "/" ? "default" : "ghost"}
              data-testid="link-home"
            >
              Home
            </Button>
          </Link>

          <Link href="/shop" onClick={() => setIsCartOpen(false)}>
            <Button 
              className={`rounded-full px-6 h-9 text-sm font-medium ${
                location === "/shop" 
                  ? "bg-black dark:bg-white text-white dark:text-black" 
                  : "bg-transparent text-black dark:text-white"
              }`}
              variant={location === "/shop" ? "default" : "ghost"}
              data-testid="link-shop"
            >
              Shop
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            className="relative"
            data-testid="button-notifications"
          >
            <Bell className="w-5 h-5 text-black dark:text-white" />
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 rounded-full flex items-center justify-center text-[10px] font-semibold text-white">
              1
            </span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => setIsCartOpen(true)}
            data-testid="button-cart"
          >
            <ShoppingCart className="w-5 h-5 text-black dark:text-white" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-black dark:bg-white text-white dark:text-black text-xs font-semibold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Button>
        </div>
      </div>
    </nav>
  );
}
