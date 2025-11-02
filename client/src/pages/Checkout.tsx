import { useState } from "react";
import { useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";

export default function CheckoutPage() {
  const [, setLocation] = useLocation();
  const { items, subtotal, clearCart } = useCart();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    firstName: "",
    address: "",
    mobile: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.address || !formData.mobile) {
      toast({
        title: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Order placed successfully!",
    });
    clearCart();
    setLocation("/");
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-950">
        <Navbar />
        <div className="container mx-auto px-4 py-32 text-center">
          <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
          <Button onClick={() => setLocation("/shop")}>Go to Shop</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <Navbar />
      
      <main className="container mx-auto px-4 py-24 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <h2 className="text-lg font-normal mb-6">Enter your name and address:</h2>
                <div className="space-y-4">
                  <Input
                    type="text"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="h-14 rounded-xl border-gray-300 bg-white dark:bg-neutral-900"
                    data-testid="input-first-name"
                  />
                  <Input
                    type="text"
                    placeholder="Address Line 1"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="h-14 rounded-xl border-gray-300 bg-white dark:bg-neutral-900"
                    data-testid="input-address"
                  />
                </div>
              </div>

              <div>
                <h2 className="text-lg font-normal mb-6">What's your contact information?</h2>
                <Input
                  type="tel"
                  placeholder="India Mobile Number"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className="h-14 rounded-xl border-gray-300 bg-white dark:bg-neutral-900"
                  data-testid="input-mobile"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-14 bg-black hover:bg-neutral-800 text-white rounded-full text-base font-medium"
                data-testid="button-place-order"
              >
                Place Order
              </Button>
            </form>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-8">Order Summary</h2>
            
            <div className="space-y-6">
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-start gap-4">
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
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Qty: {item.quantity}</p>
                    </div>
                    <div className="font-semibold text-base">
                      {item.price}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 dark:border-neutral-800 pt-6 space-y-3">
                <div className="flex justify-between text-base">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span className="font-semibold">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-base">
                  <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                  <span className="font-semibold text-green-600">FREE</span>
                </div>
                <div className="flex justify-between text-xl font-bold pt-3 border-t border-gray-200 dark:border-neutral-800">
                  <span>Total</span>
                  <span>₹{subtotal}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
