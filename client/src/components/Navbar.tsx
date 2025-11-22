import { ShoppingCart, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { Link, useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { products } from "@shared/schema";

export default function Navbar() {
  const { setIsCartOpen, cartCount } = useCart();
  const [location, setLocation] = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const query = searchQuery.toLowerCase();
    return products.filter(
      (product) =>
        product.title.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleProductClick = (productId: number) => {
    setIsSearchOpen(false);
    setSearchQuery("");
    setLocation(`/product/${productId}`);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSearchOpen(true)}
            data-testid="button-search"
          >
            <Search className="w-5 h-5 text-black dark:text-white" />
          </Button>

          <div className="flex items-center gap-1">
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

      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Search Products</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
            <Input
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full focus-visible:ring-0 focus-visible:border-gray-300 dark:focus-visible:border-gray-600"
              autoFocus
              data-testid="input-search"
            />
            <div className="flex-1 overflow-y-auto space-y-2">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleProductClick(product.id)}
                    className="flex gap-4 p-3 rounded-lg hover-elevate active-elevate-2 cursor-pointer"
                    data-testid={`search-result-${product.id}`}
                  >
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-black dark:text-white">
                        {product.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {product.description}
                      </p>
                      <p className="text-sm font-bold text-black dark:text-white mt-1">
                        {product.price}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No products found
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </nav>
  );
}
