import type { Metadata } from "next";
import "./globals.css";
import VisualEditsMessenger from "../visual-edits/VisualEditsMessenger";
import ErrorReporter from "@/components/ErrorReporter";
import Script from "next/script";
import CartProvider from "@/components/CartProvider";

export const metadata: Metadata = {
  title: "MysteryBox - Unbox the Surprise",
  description: "Discover amazing surprises in every mystery box. Premium products, unbeatable value, endless excitement!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ErrorReporter />
        <CartProvider>
          {children}
        </CartProvider>
        <Script
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/scripts//route-messenger.js"
          strategy="afterInteractive"
          data-target-origin="*"
          data-message-type="ROUTE_CHANGE"
          data-include-search-params="true"
          data-only-in-iframe="true"
          data-debug="true"
          data-custom-data='{"appName": "YourApp", "version": "1.0.0", "greeting": "hi"}'
        />
        <VisualEditsMessenger />
      </body>
    </html>
  );
}