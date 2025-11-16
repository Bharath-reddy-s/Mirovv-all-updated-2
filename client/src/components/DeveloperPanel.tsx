import { useDeveloper } from "@/contexts/DeveloperContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Plus, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import type { Product } from "@shared/schema";

export default function DeveloperPanel() {
  const { isDeveloperMode, stockStatus, products, toggleStockStatus, createProduct, updateProduct, isCreatingProduct, isUpdatingProduct } = useDeveloper();
  const [isVisible, setIsVisible] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    label: "Giveaway Ticket Included",
    price: "",
    originalPrice: "",
    pricingText: "",
    image: "",
    additionalImages: "",
    description: "",
    longDescription: "",
    features: "",
    whatsInTheBox: "",
    specifications: "",
    productLink: "",
  });

  if (!isDeveloperMode || !isVisible) return null;

  const resetForm = () => {
    setFormData({
      title: "",
      label: "Giveaway Ticket Included",
      price: "",
      originalPrice: "",
      pricingText: "",
      image: "",
      additionalImages: "",
      description: "",
      longDescription: "",
      features: "",
      whatsInTheBox: "",
      specifications: "",
      productLink: "",
    });
    setEditingProduct(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      label: product.label,
      price: product.price,
      originalPrice: product.originalPrice || "",
      pricingText: product.pricingText || "",
      image: product.image,
      additionalImages: product.additionalImages?.join("\n") || "",
      description: product.description,
      longDescription: product.longDescription,
      features: product.features.join("\n"),
      whatsInTheBox: product.whatsInTheBox.join("\n"),
      specifications: product.specifications.map(s => `${s.label}: ${s.value}`).join("\n"),
      productLink: product.productLink || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const specLines = formData.specifications.split("\n").filter(Boolean);
    const invalidSpecs = specLines.filter(line => !line.includes(":"));
    
    if (invalidSpecs.length > 0) {
      toast({
        title: "Invalid Specifications",
        description: `Each specification must be in the format "label: value". Invalid lines: ${invalidSpecs.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    const specifications = specLines.map(spec => {
      const [label, ...valueParts] = spec.split(":");
      const value = valueParts.join(":").trim();
      if (!label.trim() || !value) {
        throw new Error("Invalid specification format");
      }
      return { label: label.trim(), value };
    });

    try {
      const productData = {
        title: formData.title,
        label: formData.label,
        price: formData.price,
        originalPrice: formData.originalPrice || undefined,
        pricingText: formData.pricingText || undefined,
        image: formData.image,
        additionalImages: formData.additionalImages
          ? formData.additionalImages.split("\n").filter(Boolean)
          : undefined,
        description: formData.description,
        longDescription: formData.longDescription,
        features: formData.features.split("\n").filter(Boolean),
        whatsInTheBox: formData.whatsInTheBox.split("\n").filter(Boolean),
        specifications,
        productLink: formData.productLink || undefined,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        toast({
          title: "Product Updated",
          description: "The product has been updated successfully.",
        });
      } else {
        await createProduct(productData);
        toast({
          title: "Product Created",
          description: "The product has been created successfully.",
        });
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save product. Please check your inputs.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50" data-testid="developer-panel">
        <Card className="p-4 w-96 max-h-[600px] overflow-y-auto shadow-lg bg-black dark:bg-white text-white dark:text-black border-2 border-yellow-500">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-lg">🛠️ Developer Mode</h3>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsVisible(false)}
              className="h-6 w-6"
              data-testid="button-close-dev-panel"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <Tabs defaultValue="stock" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-3">
              <TabsTrigger value="stock" data-testid="tab-stock">Stock</TabsTrigger>
              <TabsTrigger value="products" data-testid="tab-products">Products</TabsTrigger>
            </TabsList>

            <TabsContent value="stock">
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
            </TabsContent>

            <TabsContent value="products">
              <div className="space-y-3">
                <Button
                  onClick={openCreateDialog}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  data-testid="button-create-product"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Product
                </Button>

                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-2 rounded bg-gray-800 dark:bg-gray-200"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{product.title}</p>
                        <p className="text-xs opacity-70">{product.price}</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => openEditDialog(product)}
                        className="h-8 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white ml-2"
                        data-testid={`button-edit-product-${product.id}`}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <p className="text-xs mt-3 opacity-60 italic">
            Changes are saved automatically
          </p>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle data-testid="dialog-title-product">
              {editingProduct ? "Edit Product" : "Create New Product"}
            </DialogTitle>
            <DialogDescription>
              {editingProduct 
                ? "Update the product details below. All fields with asterisk (*) are required." 
                : "Fill in the product details below. All fields with asterisk (*) are required."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Product Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Lightts"
                required
                data-testid="input-product-title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="label">Label *</Label>
              <Input
                id="label"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                placeholder="e.g., Giveaway Ticket Included"
                required
                data-testid="input-product-label"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="e.g., ₹49"
                  required
                  data-testid="input-product-price"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="originalPrice">Original Price</Label>
                <Input
                  id="originalPrice"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                  placeholder="e.g., ₹79"
                  data-testid="input-product-original-price"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pricingText">Pricing Text</Label>
              <Input
                id="pricingText"
                value={formData.pricingText}
                onChange={(e) => setFormData({ ...formData, pricingText: e.target.value })}
                placeholder="e.g., ( Just at a price of 3 Lights )"
                data-testid="input-product-pricing-text"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                This text appears next to the price on the product page
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Main Image URL *</Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://example.com/image.png"
                required
                data-testid="input-product-image"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalImages">Additional Images (one URL per line)</Label>
              <Textarea
                id="additionalImages"
                value={formData.additionalImages}
                onChange={(e) => setFormData({ ...formData, additionalImages: e.target.value })}
                placeholder="https://example.com/image1.png&#10;https://example.com/image2.png"
                rows={3}
                data-testid="input-product-additional-images"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Short Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief product description"
                required
                rows={3}
                data-testid="input-product-description"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="longDescription">Long Description *</Label>
              <Textarea
                id="longDescription"
                value={formData.longDescription}
                onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
                placeholder="Detailed product description"
                required
                rows={4}
                data-testid="input-product-long-description"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="features">Features (one per line) *</Label>
              <Textarea
                id="features"
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                placeholder="5+ Premium Digital Products&#10;Exclusive Software Licenses&#10;Digital Content Access"
                required
                rows={4}
                data-testid="input-product-features"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsInTheBox">What's in the Box (one per line) *</Label>
              <Textarea
                id="whatsInTheBox"
                value={formData.whatsInTheBox}
                onChange={(e) => setFormData({ ...formData, whatsInTheBox: e.target.value })}
                placeholder="A Mystery item&#10;A Letter (guide)&#10;GIVEAWAY TICKET"
                required
                rows={4}
                data-testid="input-product-whats-in-box"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specifications">Specifications (label: value, one per line) *</Label>
              <Textarea
                id="specifications"
                value={formData.specifications}
                onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
                placeholder="Delivery: Instant Digital Download&#10;Value: Up to ₹8,000&#10;Items: 5-8 Digital Products"
                required
                rows={4}
                data-testid="input-product-specifications"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="productLink">Product Link</Label>
              <Input
                id="productLink"
                value={formData.productLink}
                onChange={(e) => setFormData({ ...formData, productLink: e.target.value })}
                placeholder="https://example.com/product"
                data-testid="input-product-link"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                className="flex-1"
                disabled={isCreatingProduct || isUpdatingProduct}
                data-testid="button-save-product"
              >
                {isCreatingProduct || isUpdatingProduct ? "Saving..." : editingProduct ? "Update Product" : "Create Product"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                data-testid="button-cancel-product"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
