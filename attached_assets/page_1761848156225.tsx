"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Package, Sparkles, Gift, Zap } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import BackgroundPaths from "@/components/BackgroundPaths";
import { useCart } from "@/contexts/CartContext";
import { products } from "@/data/products";

export default function Home() {
  const { addToCart } = useCart();

  return (
    <>
      <Navbar />
      <BackgroundPaths title="Mystery Boxes Await" />
    </>
  );
}