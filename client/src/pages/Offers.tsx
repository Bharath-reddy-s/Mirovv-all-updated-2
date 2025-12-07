import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";

export default function OffersPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <Navbar />
      <main className="container mx-auto px-4 pt-32 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-black dark:text-white">
            Special Offers
          </h1>
        </motion.div>
      </main>
    </div>
  );
}
