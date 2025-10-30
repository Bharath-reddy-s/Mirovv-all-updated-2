import { ShoppingCart, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { Link } from "wouter";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { setIsCartOpen, cartCount } = useCart();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md border-b border-gray-200 dark:border-neutral-800">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="text-2xl font-bold text-black dark:text-white">MysteryBox</div>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/shop">
            <Button variant="ghost" className="text-base" data-testid="link-shop">
              Shop
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            data-testid="button-theme-toggle"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
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
