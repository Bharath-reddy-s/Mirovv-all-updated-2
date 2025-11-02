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
    instagram: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.address || !formData.mobile || !formData.instagram) {
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
                  <select
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full h-14 rounded-xl border border-gray-300 bg-white dark:bg-neutral-900 px-4 text-gray-900 dark:text-gray-100"
                    data-testid="select-address"
                  >
                    <option value="">Select Delivery Address</option>
                    <option value="BMSIT (Institute of Technology and Management) Yelahanka">BMSIT (Institute of Technology and Management) Yelahanka</option>
                    <option value="NITTE (Meenakshi Institute of Technology) Yelahanka">NITTE (Meenakshi Institute of Technology) Yelahanka</option>
                    <option value="Manipal University Yelahanka">Manipal University Yelahanka</option>
                  </select>
                  <Input
                    type="tel"
                    placeholder="India Mobile Number"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="h-14 rounded-xl border-gray-300 bg-white dark:bg-neutral-900"
                    data-testid="input-mobile"
                  />
                  <Input
                    type="text"
                    placeholder="Instagram Username"
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    className="h-14 rounded-xl border-gray-300 bg-white dark:bg-neutral-900"
                    data-testid="input-instagram"
                  />
                </div>
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
