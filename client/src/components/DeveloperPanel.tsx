import { useDeveloper } from "@/contexts/DeveloperContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Plus, Edit, Upload, Trash2 } from "lucide-react";
import { useState, useRef } from "react";
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

const DEFAULT_LONG_DESCRIPTION = "Mystery box is the medium through which we want to give stuff to students (dont expect that stuff guys) . this is for the people who always say \"Thu yak adru college ge band no\" or \"for that one guy whole is always lonely \" or for that one friend who is single  forever and that one friend who looks inocent but only you know about him . Enjoy the experience very time From the moment you order to the thrill of unboxing and even winning a giveaway, every step is designed to make life a little less \"ugh\" and a lot more \"SIKE\"";

const DEFAULT_WHATS_IN_BOX = `A Mystery item (something you would not expect)
A Letter (guide to use the product)
GIVEAWAY TICKET (Its all about This)
GIVEAWAY products are not sent in mystery box`;

export default function DeveloperPanel() {
  const { isDeveloperMode, stockStatus, products, toggleStockStatus, createProduct, updateProduct, deleteProduct, isCreatingProduct, isUpdatingProduct, isDeletingProduct } = useDeveloper();
  const [isVisible, setIsVisible] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { toast } = useToast();
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const additionalImagesInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    label: "Giveaway Ticket Included",
    price: "",
    originalPrice: "",
    pricingText: "",
    image: "",
    additionalImages: "",
    description: "",
    longDescription: DEFAULT_LONG_DESCRIPTION,
    whatsInTheBox: DEFAULT_WHATS_IN_BOX,
    productLink: "",
  });

  if (!isDeveloperMode || !isVisible) return null;

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await convertFileToBase64(file);
        setFormData({ ...formData, image: base64 });
        toast({
          title: "Image uploaded",
          description: "Main image has been uploaded successfully.",
        });
      } catch (error) {
        toast({
          title: "Upload failed",
          description: "Failed to upload image. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleAdditionalImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      try {
        const base64Images = await Promise.all(
          Array.from(files).map(file => convertFileToBase64(file))
        );
        const currentImages = formData.additionalImages ? formData.additionalImages.split("\n").filter(Boolean) : [];
        const allImages = [...currentImages, ...base64Images].join("\n");
        setFormData({ ...formData, additionalImages: allImages });
        toast({
          title: "Images uploaded",
          description: `${files.length} additional image(s) uploaded successfully.`,
        });
      } catch (error) {
        toast({
          title: "Upload failed",
          description: "Failed to upload images. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

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
      longDescription: DEFAULT_LONG_DESCRIPTION,
      whatsInTheBox: DEFAULT_WHATS_IN_BOX,
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
      title: product.title ?? "",
      label: product.label ?? "",
      price: product.price ?? "",
      originalPrice: product.originalPrice ?? "",
      pricingText: product.pricingText ?? "",
      image: product.image ?? "",
      additionalImages: product.additionalImages?.join("\n") ?? "",
      description: product.description ?? "",
      longDescription: product.longDescription ?? "",
      whatsInTheBox: product.whatsInTheBox?.join("\n") ?? "",
      productLink: product.productLink ?? "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const isValidUrl = (url: string) => {
        if (!url) return false;
        try {
          new URL(url);
          return true;
        } catch {
          return false;
        }
      };

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
        whatsInTheBox: formData.whatsInTheBox.split("\n").filter(Boolean),
        productLink: formData.productLink && isValidUrl(formData.productLink) 
          ? formData.productLink 
          : undefined,
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

  const handleDelete = async () => {
    if (!editingProduct) return;

    try {
      await deleteProduct(editingProduct.id);
      toast({
        title: "Product Deleted",
        description: "The product has been deleted successfully.",
      });
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete product.",
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
              <Label htmlFor="image">Main Image *</Label>
              <div className="flex gap-2">
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://example.com/image.png or upload below"
                  required
                  data-testid="input-product-image"
                  className="flex-1"
                />
                <input
                  ref={mainImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleMainImageUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => mainImageInputRef.current?.click()}
                  data-testid="button-upload-main-image"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </Button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Paste a URL or upload an image from your device
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalImages">Additional Images</Label>
              <Textarea
                id="additionalImages"
                value={formData.additionalImages}
                onChange={(e) => setFormData({ ...formData, additionalImages: e.target.value })}
                placeholder="https://example.com/image1.png&#10;https://example.com/image2.png"
                rows={3}
                data-testid="input-product-additional-images"
              />
              <div className="flex gap-2">
                <input
                  ref={additionalImagesInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleAdditionalImagesUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => additionalImagesInputRef.current?.click()}
                  data-testid="button-upload-additional-images"
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Additional Images
                </Button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Paste URLs (one per line) or upload multiple images from your device
              </p>
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
                disabled={isCreatingProduct || isUpdatingProduct || isDeletingProduct}
                data-testid="button-save-product"
              >
                {isCreatingProduct || isUpdatingProduct ? "Saving..." : editingProduct ? "Update Product" : "Create Product"}
              </Button>
              {editingProduct && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeletingProduct || isCreatingProduct || isUpdatingProduct}
                  data-testid="button-delete-product"
                >
                  {isDeletingProduct ? (
                    "Deleting..."
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </>
                  )}
                </Button>
              )}
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
