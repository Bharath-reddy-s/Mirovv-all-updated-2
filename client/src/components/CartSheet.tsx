import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { Link } from "wouter";

export default function CartSheet() {
  const { items, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, clearCart, subtotal } = useCart();

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
            <div className="flex flex-col items-center justify-center h-full text-center px-8">
              <div className="w-32 h-32 mb-8 flex items-center justify-center">
                <ShoppingBag className="w-24 h-24 text-gray-300 dark:text-gray-600" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Your cart is empty
              </h3>
              <p className="text-sm text-gray-400 dark:text-gray-500 mb-8">
                Add some mystery boxes to get started!
              </p>
              <Link href="/shop">
                <Button
                  onClick={() => setIsCartOpen(false)}
                  data-testid="button-shop-empty-cart"
                  className="bg-black dark:bg-white text-white dark:text-black rounded-full px-12 h-12 text-base font-medium"
                >
                  Continue Shopping
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 bg-gray-50 dark:bg-neutral-800 rounded-xl relative"
                    data-testid={`cart-item-${item.id}`}
                  >
                    <div className="w-28 h-28 bg-black rounded-xl flex-shrink-0 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-contain p-3"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-semibold text-base text-gray-900 dark:text-gray-100">
                          {index + 1}. {item.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.label}</p>
                        <p className="font-bold text-lg mt-2 text-gray-900 dark:text-gray-100">{item.price}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-600 dark:text-gray-400"
                        onClick={() => removeFromCart(item.id)}
                        data-testid={`button-remove-${item.id}`}
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                      <div className="flex items-center gap-3 bg-white dark:bg-neutral-900 rounded-full px-4 py-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          data-testid={`button-decrease-${item.id}`}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-6 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          data-testid={`button-increase-${item.id}`}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-6">
                <button
                  onClick={clearCart}
                  className="text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-600 font-medium text-base"
                  data-testid="button-clear-cart"
                >
                  Clear Cart
                </button>
              </div>
            </>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-gray-200 dark:border-neutral-800 p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400 text-base">Subtotal</span>
              <span className="font-bold text-xl text-gray-900 dark:text-gray-100">₹{subtotal}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400 text-base">Shipping</span>
              <span className="font-semibold text-green-600 dark:text-green-500 text-base">FREE</span>
            </div>
            <div className="border-t border-gray-200 dark:border-neutral-800 pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-900 dark:text-gray-100 text-xl font-bold">Total</span>
                <span className="font-bold text-2xl text-gray-900 dark:text-gray-100">₹{subtotal}</span>
              </div>
            </div>
            <Link href="/checkout">
              <Button
                className="w-full bg-black dark:bg-white text-white dark:text-black rounded-full h-14 text-base font-semibold"
                onClick={() => setIsCartOpen(false)}
                data-testid="button-checkout"
              >
                Proceed to Checkout
              </Button>
            </Link>
            <div className="text-center">
              <Link href="/shop">
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 font-medium text-base"
                  data-testid="button-continue-shopping"
                >
                  Continue Shopping
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
