import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import { useDeveloper } from "@/contexts/DeveloperContext";
import { useTimeChallenge } from "@/contexts/TimeChallengeContext";
import { useTryNowChallenge } from "@/contexts/TryNowChallengeContext";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import type { DeliveryAddress } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Copy, CheckCircle2, Zap, Timer, Percent, Play, X } from "lucide-react";

export default function CheckoutPage() {
  const [, setLocation] = useLocation();
  const { items, subtotal, clearCart } = useCart();
  const { flashOffer, checkoutDiscount } = useDeveloper();
  const { challengeStarted, challengeExpired, timeRemaining, discountPercent, markChallengeCompleted } = useTimeChallenge();
  const { 
    isTryNowActive, 
    challengeType: tryNowType, 
    discountPercent: tryNowDiscount, 
    timeRemaining: tryNowTimeRemaining,
    completeTryNowChallenge 
  } = useTryNowChallenge();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [flashTimeLeft, setFlashTimeLeft] = useState(0);
  const [formData, setFormData] = useState({
    firstName: "",
    address: "",
    mobile: "",
    instagram: "",
  });

  const { data: deliveryAddresses = [], isLoading: isLoadingAddresses, isError: isAddressError } = useQuery<DeliveryAddress[]>({
    queryKey: ["/api/delivery-addresses"],
  });

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
    flashOffer.claimedCount < flashOffer.maxClaims;
  const spotsRemaining = flashOffer ? flashOffer.maxClaims - flashOffer.claimedCount : 0;
  
  const isTimeChallengeActive = challengeStarted && !challengeExpired && discountPercent > 0;
  const timeChallengeDiscount = isTimeChallengeActive ? Math.round(subtotal * discountPercent / 100) : 0;
  
  const tryNowChallengeDiscount = isTryNowActive ? Math.round(subtotal * tryNowDiscount / 100) : 0;
  
  const isCheckoutDiscountActive = checkoutDiscount && checkoutDiscount.discountPercent > 0;
  const checkoutDiscountAmount = isCheckoutDiscountActive ? Math.round(subtotal * checkoutDiscount.discountPercent / 100) : 0;
  
  const shippingCost = 39;
  const flashOfferLimit = 200;
  const flashOfferDiscount = isFlashOfferActive ? Math.min(subtotal, flashOfferLimit) : 0;
  const flashOfferBalance = isFlashOfferActive ? Math.max(0, subtotal - flashOfferLimit) : 0;
  
  const isTryNowFlashActive = isTryNowActive && tryNowType === "flash";
  const tryNowFlashDiscount = isTryNowFlashActive ? Math.min(subtotal, flashOfferLimit) : 0;
  const tryNowFlashBalance = isTryNowFlashActive ? Math.max(0, subtotal - flashOfferLimit) : 0;
  
  const displayTotal = isFlashOfferActive 
    ? flashOfferBalance + shippingCost 
    : isTryNowFlashActive
    ? tryNowFlashBalance + shippingCost
    : (subtotal + shippingCost - timeChallengeDiscount - tryNowChallengeDiscount - checkoutDiscountAmount);

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

  const handleCloseTrialDialog = () => {
    setShowOrderSuccess(false);
    clearCart();
    setLocation("/");
  };

  const isTrialOrder = orderDetails?.orderNumber?.startsWith("TRY-");

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
      const isFlashOrder = isFlashOfferActive;
      const hasTimeChallengeDiscount = isTimeChallengeActive;
      const hasTryNowDiscount = isTryNowActive;
      const hasTryNowFlash = isTryNowFlashActive;
      
      const finalTotal = displayTotal;
      const finalTryNowDiscount = hasTryNowFlash ? tryNowFlashDiscount : tryNowChallengeDiscount;
      const finalTryNowType = tryNowType;
      
      if (isFlashOrder) {
        await apiRequest('POST', '/api/flash-offer/claim');
      }
      
      if (hasTimeChallengeDiscount) {
        markChallengeCompleted();
      }
      
      if (hasTryNowDiscount) {
        completeTryNowChallenge();
      }
      
      const orderData = {
        customerName: formData.firstName,
        mobile: formData.mobile,
        address: formData.address,
        instagram: formData.instagram,
        items: items.map(item => ({
          productId: item.id,
          productCode: item.productCode || '',
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        total: `₹${finalTotal}`,
        isFlashOffer: isFlashOrder,
        flashOfferDiscount: isFlashOrder ? flashOfferDiscount : 0,
        isTryNowChallenge: hasTryNowDiscount,
      };

      const response: any = await apiRequest('POST', '/api/orders', orderData);

      setOrderDetails({
        orderNumber: response.orderNumber,
        items: items,
        total: finalTotal,
        isFlashOffer: isFlashOrder,
        flashOfferDiscount: isFlashOrder ? flashOfferDiscount : 0,
        hasTimeChallengeDiscount,
        timeChallengeDiscount,
        discountPercent,
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
                    placeholder="First Name (eg: John)"
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
                    disabled={isLoadingAddresses}
                  >
                    {isLoadingAddresses ? (
                      <option value="">Loading addresses...</option>
                    ) : isAddressError ? (
                      <option value="">Failed to load addresses</option>
                    ) : deliveryAddresses.length === 0 ? (
                      <option value="">No delivery addresses available</option>
                    ) : (
                      <>
                        <option value="">Select Delivery Address</option>
                        {deliveryAddresses.map((address) => (
                          <option key={address.id} value={address.name}>
                            {address.name}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                  <Input
                    type="tel"
                    placeholder="Mobile Number (eg: 9876543210)"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="h-14 rounded-xl border-gray-300 bg-white dark:bg-neutral-900 transition-all duration-300 focus-visible:ring-0 focus-visible:border-gray-400 dark:focus-visible:border-gray-600 focus-visible:scale-[1.01]"
                    data-testid="input-mobile"
                  />
                  <Input
                    type="text"
                    placeholder="Instagram Username (eg: @yourname)"
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
            
            {isFlashOfferActive && (
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black rounded-xl p-4 mb-6" data-testid="flash-offer-applied">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5" />
                  <span className="font-bold">Flash Offer Applied!</span>
                </div>
                <p className="text-sm">
                  {subtotal <= flashOfferLimit 
                    ? `Products FREE! Just pay delivery.` 
                    : `First ₹${flashOfferLimit} FREE! Pay ₹${flashOfferBalance} + delivery.`}
                </p>
                <p className="text-xs mt-1 opacity-80">
                  {spotsRemaining} spot{spotsRemaining !== 1 ? 's' : ''} left | Time: {flashTimeLeft}s
                </p>
              </div>
            )}
            
            {isTimeChallengeActive && !isFlashOfferActive && (
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl p-4 mb-6" data-testid="time-challenge-applied">
                <div className="flex items-center gap-2 mb-2">
                  <Timer className="w-5 h-5" />
                  <span className="font-bold">{discountPercent}% Discount Active!</span>
                </div>
                <p className="text-sm">Complete checkout now to save ₹{timeChallengeDiscount}!</p>
                <p className="text-xs mt-1 opacity-80">Time remaining: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</p>
              </div>
            )}
            
            {isTryNowActive && !isFlashOfferActive && (
              <div className={`rounded-xl p-4 mb-6 ${
                tryNowType === "timer" 
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white" 
                  : "bg-gradient-to-r from-yellow-500 to-orange-500 text-black"
              }`} data-testid="try-now-challenge-applied">
                <div className="flex items-center gap-2 mb-2">
                  {tryNowType === "timer" ? <Timer className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                  <span className="font-bold flex items-center gap-1">
                    <Play className="w-4 h-4" />
                    Try Now Challenge Active!
                  </span>
                </div>
                <p className="text-sm">
                  {isTryNowFlashActive 
                    ? (subtotal <= flashOfferLimit 
                        ? `Products FREE! Just pay delivery.` 
                        : `First ₹${flashOfferLimit} FREE! Pay ₹${tryNowFlashBalance} + delivery.`)
                    : `Complete checkout now to save ₹${tryNowChallengeDiscount}!`
                  }
                </p>
                <p className="text-xs mt-1 opacity-80">
                  Time remaining: {Math.floor(tryNowTimeRemaining / 60)}:{(tryNowTimeRemaining % 60).toString().padStart(2, '0')}
                </p>
              </div>
            )}
            
            {isCheckoutDiscountActive && !isFlashOfferActive && (
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl p-4 mb-6" data-testid="checkout-discount-banner">
                <div className="flex items-center gap-2 mb-2">
                  <Percent className="w-5 h-5" />
                  <span className="font-bold">{checkoutDiscount.discountPercent}% Special Discount!</span>
                </div>
                <p className="text-sm">You're saving ₹{checkoutDiscountAmount} on this order!</p>
              </div>
            )}
            
            <div className="space-y-6">
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-start gap-4">
                    <div className="w-20 h-20 bg-black rounded-xl flex-shrink-0 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-contain p-2 rounded-xl"
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
                  <span className="text-gray-600 dark:text-gray-400">Delivery fees</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">₹{shippingCost}</span>
                </div>
                {isFlashOfferActive && (
                  <div className="flex justify-between text-base text-green-600 dark:text-green-400">
                    <span className="flex items-center gap-1">
                      <Zap className="w-4 h-4" />
                      Flash Discount (up to ₹{flashOfferLimit})
                    </span>
                    <span className="font-semibold">-₹{flashOfferDiscount}</span>
                  </div>
                )}
                {isTimeChallengeActive && !isFlashOfferActive && (
                  <div className="flex justify-between text-base text-green-600 dark:text-green-400">
                    <span className="flex items-center gap-1">
                      <Timer className="w-4 h-4" />
                      Time Challenge ({discountPercent}% off)
                    </span>
                    <span className="font-semibold">-₹{timeChallengeDiscount}</span>
                  </div>
                )}
                {isTryNowActive && !isFlashOfferActive && !isTryNowFlashActive && (
                  <div className="flex justify-between text-base text-green-600 dark:text-green-400" data-testid="try-now-discount-line">
                    <span className="flex items-center gap-1">
                      <Play className="w-4 h-4" />
                      Try Now Challenge ({tryNowDiscount}% off)
                    </span>
                    <span className="font-semibold">-₹{tryNowChallengeDiscount}</span>
                  </div>
                )}
                {isTryNowFlashActive && (
                  <div className="flex justify-between text-base text-green-600 dark:text-green-400" data-testid="try-now-flash-discount-line">
                    <span className="flex items-center gap-1">
                      <Play className="w-4 h-4" />
                      Try Now Flash (up to ₹{flashOfferLimit})
                    </span>
                    <span className="font-semibold">-₹{tryNowFlashDiscount}</span>
                  </div>
                )}
                {isCheckoutDiscountActive && !isFlashOfferActive && (
                  <div className="flex justify-between text-base text-green-600 dark:text-green-400" data-testid="checkout-discount-applied">
                    <span className="flex items-center gap-1">
                      Special Discount ({checkoutDiscount.discountPercent}% off)
                    </span>
                    <span className="font-semibold">-₹{checkoutDiscountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-base pt-3 border-t border-gray-200 dark:border-neutral-800">
                  <span className="text-gray-600 dark:text-gray-400">Total</span>
                  <span className={`font-semibold ${isFlashOfferActive ? 'text-green-600 dark:text-green-400 text-xl' : 'text-gray-900 dark:text-gray-100'}`}>
                    ₹{displayTotal}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Dialog open={showOrderSuccess} onOpenChange={isTrialOrder ? handleCloseTrialDialog : () => {}}>
        <DialogContent className="sm:max-w-sm max-h-[90vh] overflow-y-auto [&>button]:hidden">
          {isTrialOrder && (
            <div className="absolute right-4 top-4 z-10">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCloseTrialDialog}
                className="h-6 w-6"
                data-testid="button-close-dialog"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          <DialogHeader>
            <div className="flex justify-center mb-2">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>
            <DialogTitle className="text-center text-xl">
              {isTrialOrder ? "Trial Order Complete!" : "Order Placed!"}
            </DialogTitle>
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
                {orderDetails?.isFlashOffer && (
                  <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black rounded-md p-2 mb-2 flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    <span className="text-xs font-bold">Flash Offer - ₹{orderDetails.flashOfferDiscount} Discount!</span>
                  </div>
                )}
                <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-1.5">Items:</p>
                <div className="space-y-1.5">
                  {orderDetails?.items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">{item.title} x{item.quantity}</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {item.price}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-sm font-bold mt-2 pt-2 border-t border-gray-200 dark:border-neutral-800">
                  <span className="text-gray-900 dark:text-gray-100">Total:</span>
                  <span className={orderDetails?.isFlashOffer ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-gray-100'}>
                    ₹{orderDetails?.total}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
              <p className="text-xs text-blue-900 dark:text-blue-100 text-center">
                📸 Send <span className="font-bold">#{orderDetails?.orderNumber}</span> to our Instagram DM do the paymnet and confirm order
              </p>
            </div>

            <div className="text-center">
              <p className="text-xs text-red-600 dark:text-red-400 italic">
                Note: Orders are only confirmed when the order number is sent to Instagram DM
              </p>
            </div>

            <Button
              onClick={isTrialOrder ? handleCloseTrialDialog : handleCloseDialog}
              className="w-full h-10 bg-black hover:bg-neutral-800 text-white rounded-full text-sm"
              data-testid="button-close-order-success"
            >{isTrialOrder ? "Close" : "Instagram DM"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
