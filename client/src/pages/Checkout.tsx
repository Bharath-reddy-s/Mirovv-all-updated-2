import { useState } from "react";
import { useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Copy, CheckCircle2 } from "lucide-react";

export default function CheckoutPage() {
  const [, setLocation] = useLocation();
  const { items, subtotal, clearCart } = useCart();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    address: "",
    mobile: "",
    instagram: "",
  });

  const copyOrderNumber = () => {
    if (orderDetails?.orderNumber) {
      navigator.clipboard.writeText(orderDetails.orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied!",
        description: "Order number copied to clipboard",
      });
    }
  };

  const handleCloseDialog = () => {
    const orderNumber = orderDetails?.orderNumber;
    const message = `Order Number: #${orderNumber}`;
    const instagramDMUrl = `https://ig.me/m/mordensale?text=${encodeURIComponent(message)}`;
    
    window.open(instagramDMUrl, '_blank');
    
    setShowOrderSuccess(false);
    clearCart();
    setLocation("/");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.address || !formData.mobile || !formData.instagram) {
      toast({
        title: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (formData.mobile.length < 10) {
      toast({
        title: "Invalid mobile number",
        description: "Mobile number must be at least 10 digits",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        customerName: formData.firstName,
        mobile: formData.mobile,
        address: formData.address,
        instagram: formData.instagram,
        items: items.map(item => ({
          productId: item.id,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        total: `₹${subtotal}`,
      };

      const response: any = await apiRequest('POST', '/api/orders', orderData);

      setOrderDetails({
        orderNumber: response.orderNumber,
        items: items,
        total: subtotal,
        customerName: formData.firstName,
        mobile: formData.mobile,
        address: formData.address,
        instagram: formData.instagram,
      });
      setShowOrderSuccess(true);
    } catch (error: any) {
      console.error("Failed to place order:", error);
      
      let errorMessage = "Please try again or contact support.";
      
      if (error?.error?.issues) {
        const firstIssue = error.error.issues[0];
        errorMessage = firstIssue.message || errorMessage;
      }
      
      toast({
        title: "Failed to place order",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <h2 className="text-lg font-normal mb-6">Enter your name and address:</h2>
                <div className="space-y-4">
                  <Input
                    type="text"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="h-14 rounded-xl border-gray-300 bg-white dark:bg-neutral-900 transition-all duration-300 focus-visible:ring-0 focus-visible:border-gray-400 dark:focus-visible:border-gray-600 focus-visible:scale-[1.01]"
                    data-testid="input-first-name"
                  />
                  <select
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full h-14 rounded-xl border border-gray-300 bg-white dark:bg-neutral-900 px-4 text-gray-900 dark:text-gray-100 transition-all duration-300 focus-visible:outline-none focus-visible:ring-0 focus-visible:border-gray-400 dark:focus-visible:border-gray-600 focus-visible:scale-[1.01]"
                    data-testid="select-address"
                  >
                    <option value="">Select Delivery Address</option>
                    <option value="BMSIT (Institute of Technology and Management) Yelahanka">BMSIT (Institute of Technology and Management) Yelahanka</option>
                    <option value="NITTE (Meenakshi Institute of Technology) Yelahanka">NITTE (Meenakshi Institute of Technology) Yelahanka</option>
                    <option value="Manipal University Yelahanka">Manipal University Yelahanka</option>
                  </select>
                  <Input
                    type="tel"
                    placeholder="Mobile Number"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="h-14 rounded-xl border-gray-300 bg-white dark:bg-neutral-900 transition-all duration-300 focus-visible:ring-0 focus-visible:border-gray-400 dark:focus-visible:border-gray-600 focus-visible:scale-[1.01]"
                    data-testid="input-mobile"
                  />
                  <Input
                    type="text"
                    placeholder="Instagram Username"
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    className="h-14 rounded-xl border-gray-300 bg-white dark:bg-neutral-900 transition-all duration-300 focus-visible:ring-0 focus-visible:border-gray-400 dark:focus-visible:border-gray-600 focus-visible:scale-[1.01]"
                    data-testid="input-instagram"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-14 bg-black hover:bg-neutral-800 text-white rounded-full text-base font-medium"
                data-testid="button-place-order"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Placing Order..." : "Place Order"}
              </Button>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
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
                  <span className="font-semibold text-gray-900 dark:text-gray-100">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-base">
                  <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">Included</span>
                </div>
                <div className="flex justify-between text-base pt-3 border-t border-gray-200 dark:border-neutral-800">
                  <span className="text-gray-600 dark:text-gray-400">Total</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">₹{subtotal}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Dialog open={showOrderSuccess} onOpenChange={setShowOrderSuccess}>
        <DialogContent className="sm:max-w-sm max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex justify-center mb-2">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>
            <DialogTitle className="text-center text-xl">Order Placed!</DialogTitle>
            <DialogDescription className="text-center text-sm">
              Send the order number to us on Instagram and Recive the payment link to confirm order
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-neutral-900 rounded-lg p-4 space-y-3">
              <div className="text-center">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Your Order Number</p>
                <div className="flex items-center justify-center gap-1">
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">#{orderDetails?.orderNumber}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={copyOrderNumber}
                    data-testid="button-copy-order-number"
                    className="h-8 w-8"
                  >
                    {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-neutral-800 pt-3 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">Customer:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{orderDetails?.customerName}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">Mobile:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{orderDetails?.mobile}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">Instagram:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">@{orderDetails?.instagram}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-neutral-800 pt-3">
                <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-1.5">Items:</p>
                <div className="space-y-1.5">
                  {orderDetails?.items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">{item.title} x{item.quantity}</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{item.price}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-sm font-bold mt-2 pt-2 border-t border-gray-200 dark:border-neutral-800">
                  <span className="text-gray-900 dark:text-gray-100">Total:</span>
                  <span className="text-gray-900 dark:text-gray-100">₹{orderDetails?.total}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
              <p className="text-xs text-blue-900 dark:text-blue-100 text-center">
                📸 Send <span className="font-bold">#{orderDetails?.orderNumber}</span> to our Instagram DM
              </p>
            </div>

            <Button
              onClick={handleCloseDialog}
              className="w-full h-10 bg-black hover:bg-neutral-800 text-white rounded-full text-sm"
              data-testid="button-close-order-success"
            >Instagram DM</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
