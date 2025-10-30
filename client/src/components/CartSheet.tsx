import { X, Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { Link } from "wouter";

export default function CartSheet() {
  const { items, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, subtotal } = useCart();

  if (!isCartOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={() => setIsCartOpen(false)}
      />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-neutral-900 z-50 shadow-xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-neutral-800">
          <h2 className="text-2xl font-bold">Shopping Cart</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCartOpen(false)}
            data-testid="button-close-cart"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 mb-4">Your cart is empty</p>
              <Link href="/shop">
                <Button
                  onClick={() => setIsCartOpen(false)}
                  data-testid="button-shop-empty-cart"
                >
                  Continue Shopping
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 bg-gray-50 dark:bg-neutral-800 rounded-lg"
                  data-testid={`cart-item-${item.id}`}
                >
                  <div className="w-20 h-20 bg-black rounded-lg flex-shrink-0 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-contain p-2"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-base">{item.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.label}</p>
                    <p className="font-semibold mt-2">{item.price}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        data-testid={`button-decrease-${item.id}`}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        data-testid={`button-increase-${item.id}`}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 ml-auto text-red-600"
                        onClick={() => removeFromCart(item.id)}
                        data-testid={`button-remove-${item.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-gray-200 dark:border-neutral-800 p-4 space-y-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Subtotal:</span>
              <span>₹{subtotal}</span>
            </div>
            <Link href="/checkout">
              <Button
                className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 rounded-full h-14 text-lg font-semibold"
                onClick={() => setIsCartOpen(false)}
                data-testid="button-checkout"
              >
                Proceed to Checkout
              </Button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
