import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/contexts/CartContext";
import { DeveloperProvider } from "@/contexts/DeveloperContext";
import { TimeChallengeProvider } from "@/contexts/TimeChallengeContext";
import { TryNowChallengeProvider } from "@/contexts/TryNowChallengeContext";
import CartSheet from "@/components/CartSheet";
import DeveloperPanel from "@/components/DeveloperPanel";
import { TimeChallengeButton } from "@/components/TimeChallengeButton";
import { TryNowChallengePopup } from "@/components/TryNowChallengePopup";
import { TryNowChallengeTimer } from "@/components/TryNowChallengeTimer";
import Navbar from "@/components/Navbar";
import Home from "@/pages/Home";
import Shop from "@/pages/Shop";
import ProductDetail from "@/pages/ProductDetail";
import Checkout from "@/pages/Checkout";
import Offers from "@/pages/Offers";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/shop" component={Shop} />
      <Route path="/shop/:id" component={ProductDetail} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/offers" component={Offers} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <DeveloperProvider>
          <TimeChallengeProvider>
            <CartProvider>
              <TryNowChallengeProvider>
                <Toaster />
                <CartSheet />
                <DeveloperPanel />
                <TimeChallengeButton />
                <TryNowChallengeTimer />
                <TryNowChallengePopup />
                <Navbar />
                <Router />
              </TryNowChallengeProvider>
            </CartProvider>
          </TimeChallengeProvider>
        </DeveloperProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
