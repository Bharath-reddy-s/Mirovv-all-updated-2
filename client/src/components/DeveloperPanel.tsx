import { useDeveloper } from "@/contexts/DeveloperContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { products } from "@shared/schema";

export default function DeveloperPanel() {
  const { isDeveloperMode, stockStatus, toggleStockStatus } = useDeveloper();

  if (!isDeveloperMode) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50" data-testid="developer-panel">
      <Card className="p-4 w-80 shadow-lg bg-black dark:bg-white text-white dark:text-black border-2 border-yellow-500">
        <div className="mb-3">
          <h3 className="font-bold text-lg">🛠️ Developer Mode</h3>
          <p className="text-xs opacity-60 italic mt-1">Type secret code to toggle</p>
        </div>
        <p className="text-xs mb-3 opacity-80">Toggle product stock availability</p>
        <div className="space-y-2">
          {products.filter(p => p.id <= 3).map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between p-2 rounded bg-gray-800 dark:bg-gray-200"
            >
              <span className="text-sm font-medium">{product.title}</span>
              <Button
                size="sm"
                onClick={() => toggleStockStatus(product.id)}
                className={`h-8 px-3 text-xs ${
                  stockStatus[product.id]
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-red-600 hover:bg-red-700 text-white"
                }`}
                data-testid={`button-toggle-stock-${product.id}`}
              >
                {stockStatus[product.id] ? "In Stock" : "Out of Stock"}
              </Button>
            </div>
          ))}
        </div>
        <p className="text-xs mt-3 opacity-60 italic">
          Changes are saved automatically
        </p>
      </Card>
    </div>
  );
}
