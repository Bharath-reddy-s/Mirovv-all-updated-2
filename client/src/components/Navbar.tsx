import { ShoppingCart, Bell, Box } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { Link, useLocation } from "wouter";

export default function Navbar() {
  const { setIsCartOpen, cartCount } = useCart();
  const [location] = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-neutral-950 border-b border-gray-200 dark:border-neutral-800">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer hover-elevate active-elevate-2 p-2 rounded-md" data-testid="link-home-logo">
            <Box className="w-6 h-6 text-black dark:text-white" />
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <Button 
            className={`text-base ${location === '/' ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-black dark:bg-white text-white dark:text-black'}`}
            data-testid="link-home"
            asChild
          >
            <Link href="/">
              Home
            </Link>
          </Button>

          <Link href="/shop">
            <span className="text-base text-black dark:text-white cursor-pointer hover:opacity-70 transition-opacity" data-testid="link-shop">
              Shop
            </span>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            className="relative"
            data-testid="button-notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center">
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
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-600 text-white text-xs rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Button>
        </div>
      </div>
    </nav>
  );
}
