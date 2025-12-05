import { useDeveloper } from "@/contexts/DeveloperContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Plus, Edit, Upload, Trash2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
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

export default function DeveloperPanel() {
  const { isDeveloperMode, stockStatus, products, priceFilters, promotionalSettings, toggleStockStatus, createProduct, updateProduct, deleteProduct, setProductPosition, createPriceFilter, updatePriceFilter, deletePriceFilter, updateOfferBanner, isCreatingProduct, isUpdatingProduct, isDeletingProduct, isReordering, isManagingFilters, isLoadingFilters, isUpdatingPromotionalSettings } = useDeveloper();
  const [isVisible, setIsVisible] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newFilterValue, setNewFilterValue] = useState("");
  const [editingFilterId, setEditingFilterId] = useState<number | null>(null);
  const [editingFilterValue, setEditingFilterValue] = useState("");
  const [bannerText, setBannerText] = useState(promotionalSettings?.bannerText || "₹10 off on every product");
  const [timerDays, setTimerDays] = useState(promotionalSettings?.timerDays?.toString() || "7");
  const [deliveryText, setDeliveryText] = useState(promotionalSettings?.deliveryText || "Shop for ₹199 and get free delivery");
  const { toast } = useToast();
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const additionalImagesInputRef = useRef<HTMLInputElement>(null);
  const [editingPositionId, setEditingPositionId] = useState<number | null>(null);
  const [editingPositionValue, setEditingPositionValue] = useState("");

  useEffect(() => {
    if (promotionalSettings) {
      setBannerText(promotionalSettings.bannerText);
      setTimerDays(promotionalSettings.timerDays.toString());
      setDeliveryText(promotionalSettings.deliveryText);
    }
  }, [promotionalSettings]);

  const [formData, setFormData] = useState({
    title: "",
    price: "",
    originalPrice: "",
    image: "",
    additionalImages: "",
    description: "",
    longDescription: DEFAULT_LONG_DESCRIPTION,
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

  const handleMainImagePaste = async (e: React.ClipboardEvent<HTMLInputElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        e.preventDefault();
        const file = items[i].getAsFile();
        if (file) {
          try {
            const base64Image = await convertFileToBase64(file);
            setFormData({ ...formData, image: base64Image });
            toast({
              title: "Image pasted",
              description: "Main image has been set from clipboard.",
            });
          } catch (error) {
            toast({
              title: "Paste failed",
              description: "Failed to process pasted image.",
              variant: "destructive",
            });
          }
        }
        break;
      }
    }
  };

  const handleAdditionalImagesPaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const imageFiles: File[] = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          imageFiles.push(file);
        }
      }
    }

    if (imageFiles.length > 0) {
      e.preventDefault();
      try {
        const base64Images = await Promise.all(
          imageFiles.map(file => convertFileToBase64(file))
        );
        const currentImages = formData.additionalImages ? formData.additionalImages.split("\n").filter(Boolean) : [];
        const allImages = [...currentImages, ...base64Images].join("\n");
        setFormData({ ...formData, additionalImages: allImages });
        toast({
          title: "Images pasted",
          description: `${imageFiles.length} image(s) added from clipboard.`,
        });
      } catch (error) {
        toast({
          title: "Paste failed",
          description: "Failed to process pasted images.",
          variant: "destructive",
        });
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      price: "",
      originalPrice: "",
      image: "",
      additionalImages: "",
      description: "",
      longDescription: DEFAULT_LONG_DESCRIPTION,
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
      price: product.price ?? "",
      originalPrice: product.originalPrice ?? "",
      image: product.image ?? "",
      additionalImages: product.additionalImages?.join("\n") ?? "",
      description: product.description ?? "",
      longDescription: product.longDescription ?? "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const productData = {
        title: formData.title,
        label: "Giveaway Ticket Included",
        price: formData.price,
        originalPrice: formData.originalPrice || undefined,
        image: formData.image,
        additionalImages: formData.additionalImages
          ? formData.additionalImages.split("\n").filter(Boolean)
          : undefined,
        description: formData.description,
        longDescription: formData.longDescription,
        whatsInTheBox: ["A Mystery item (something you would not expect)", "A Letter (guide to use the product)", "GIVEAWAY TICKET (Its all about This)", "GIVEAWAY products are not sent in mystery box"],
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
            <TabsList className="grid w-full grid-cols-4 mb-3">
              <TabsTrigger value="stock" data-testid="tab-stock">Stock</TabsTrigger>
              <TabsTrigger value="products" data-testid="tab-products">Products</TabsTrigger>
              <TabsTrigger value="filters" data-testid="tab-filters">Filters</TabsTrigger>
              <TabsTrigger value="banner" data-testid="tab-banner">Banner</TabsTrigger>
            </TabsList>

            <TabsContent value="stock">
              <p className="text-xs mb-3 opacity-80">Toggle product stock availability</p>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-2 rounded bg-gray-800 dark:bg-gray-200"
                  >
                    <span className="text-sm font-medium truncate flex-1 mr-2">{product.title}</span>
                    <Button
                      size="sm"
                      onClick={() => toggleStockStatus(product.id)}
                      className={`h-8 px-3 text-xs flex-shrink-0 ${
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
                  {products.map((product, index) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-2 p-2 rounded bg-gray-800 dark:bg-gray-200"
                    >
                      {editingPositionId === product.id ? (
                        <>
                          <Input
                            type="number"
                            min="1"
                            max={products.length}
                            value={editingPositionValue}
                            onChange={(e) => setEditingPositionValue(e.target.value)}
                            className="w-16 h-8 text-xs"
                            data-testid={`input-position-${product.id}`}
                          />
                          <Button
                            size="sm"
                            onClick={async () => {
                              const newPos = parseInt(editingPositionValue);
                              if (!editingPositionValue || newPos < 1 || newPos > products.length) {
                                toast({
                                  title: "Invalid position",
                                  description: `Please enter a number between 1 and ${products.length}`,
                                  variant: "destructive",
                                });
                                return;
                              }
                              try {
                                await setProductPosition(product.id, newPos);
                                setEditingPositionId(null);
                                setEditingPositionValue("");
                                toast({
                                  title: "Position updated",
                                  description: "Product position updated successfully",
                                });
                              } catch (error) {
                                toast({
                                  title: "Error",
                                  description: "Failed to update position",
                                  variant: "destructive",
                                });
                              }
                            }}
                            disabled={isReordering}
                            className="h-8 px-2 text-xs bg-green-600 hover:bg-green-700 text-white"
                            data-testid={`button-save-position-${product.id}`}
                          >
                            Set
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              setEditingPositionId(null);
                              setEditingPositionValue("");
                            }}
                            className="h-8 px-2 text-xs"
                            data-testid={`button-cancel-position-${product.id}`}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <div 
                            className="w-8 h-8 flex items-center justify-center bg-gray-700 dark:bg-gray-300 rounded text-xs font-bold cursor-pointer hover-elevate active-elevate-2"
                            onClick={() => {
                              setEditingPositionId(product.id);
                              setEditingPositionValue((index + 1).toString());
                            }}
                            data-testid={`position-indicator-${product.id}`}
                          >
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{product.title}</p>
                            <p className="text-xs opacity-70">{product.price}</p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => openEditDialog(product)}
                            className="h-8 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                            data-testid={`button-edit-product-${product.id}`}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="filters">
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={newFilterValue}
                    onChange={(e) => setNewFilterValue(e.target.value)}
                    placeholder="e.g., 99"
                    className="flex-1"
                    data-testid="input-new-filter-value"
                  />
                  <Button
                    onClick={async () => {
                      if (!newFilterValue || parseInt(newFilterValue) <= 0) {
                        toast({
                          title: "Invalid value",
                          description: "Please enter a positive number",
                          variant: "destructive",
                        });
                        return;
                      }
                      try {
                        await createPriceFilter(parseInt(newFilterValue));
                        setNewFilterValue("");
                        toast({
                          title: "Filter added",
                          description: `Price filter ₹${newFilterValue} added successfully`,
                        });
                      } catch (error) {
                        toast({
                          title: "Error",
                          description: "Failed to add price filter",
                          variant: "destructive",
                        });
                      }
                    }}
                    disabled={isManagingFilters}
                    className="bg-green-600 hover:bg-green-700 text-white"
                    data-testid="button-add-filter"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {isLoadingFilters ? (
                  <p className="text-xs text-center py-4 opacity-70">
                    Loading price filters...
                  </p>
                ) : priceFilters.length === 0 ? (
                  <p className="text-xs text-center py-4 opacity-70">
                    No price filters yet. Add one above to get started.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {priceFilters.map((filter) => (
                    <div
                      key={filter.id}
                      className="flex items-center gap-2 p-2 rounded bg-gray-800 dark:bg-gray-200"
                    >
                      {editingFilterId === filter.id ? (
                        <>
                          <Input
                            type="number"
                            value={editingFilterValue}
                            onChange={(e) => setEditingFilterValue(e.target.value)}
                            className="flex-1"
                            data-testid={`input-edit-filter-${filter.id}`}
                          />
                          <Button
                            size="sm"
                            onClick={async () => {
                              if (!editingFilterValue || parseInt(editingFilterValue) <= 0) {
                                toast({
                                  title: "Invalid value",
                                  description: "Please enter a positive number",
                                  variant: "destructive",
                                });
                                return;
                              }
                              try {
                                await updatePriceFilter(filter.id, parseInt(editingFilterValue));
                                setEditingFilterId(null);
                                setEditingFilterValue("");
                                toast({
                                  title: "Filter updated",
                                  description: "Price filter updated successfully",
                                });
                              } catch (error) {
                                toast({
                                  title: "Error",
                                  description: "Failed to update price filter",
                                  variant: "destructive",
                                });
                              }
                            }}
                            disabled={isManagingFilters}
                            className="h-8 px-3 text-xs bg-green-600 hover:bg-green-700 text-white"
                            data-testid={`button-save-filter-${filter.id}`}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              setEditingFilterId(null);
                              setEditingFilterValue("");
                            }}
                            className="h-8 px-3 text-xs"
                            data-testid={`button-cancel-filter-${filter.id}`}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Under ₹{filter.value}</p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => {
                              setEditingFilterId(filter.id);
                              setEditingFilterValue(filter.value.toString());
                            }}
                            className="h-8 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                            data-testid={`button-edit-filter-${filter.id}`}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={async () => {
                              try {
                                await deletePriceFilter(filter.id);
                                toast({
                                  title: "Filter deleted",
                                  description: "Price filter deleted successfully",
                                });
                              } catch (error) {
                                toast({
                                  title: "Error",
                                  description: "Failed to delete price filter",
                                  variant: "destructive",
                                });
                              }
                            }}
                            disabled={isManagingFilters}
                            className="h-8 px-3 text-xs bg-red-600 hover:bg-red-700 text-white"
                            data-testid={`button-delete-filter-${filter.id}`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </>
                      )}
                    </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="banner">
              <p className="text-xs mb-3 opacity-80">Edit offer banner text and timer duration</p>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="banner-text">Banner Text</Label>
                  <Input
                    id="banner-text"
                    value={bannerText}
                    onChange={(e) => setBannerText(e.target.value)}
                    placeholder="e.g., ₹10 off on every product"
                    className="bg-black text-white focus-visible:ring-0 focus-visible:border-gray-600"
                    data-testid="input-banner-text"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timer-days">Timer Duration (Days)</Label>
                  <Input
                    id="timer-days"
                    type="number"
                    min="1"
                    max="365"
                    value={timerDays}
                    onChange={(e) => setTimerDays(e.target.value)}
                    placeholder="7"
                    className="bg-black text-white focus-visible:ring-0 focus-visible:border-gray-600"
                    data-testid="input-timer-days"
                  />
                  <p className="text-xs text-gray-400">Set how many days the offer countdown should run</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="delivery-text">Delivery Text</Label>
                  <Input
                    id="delivery-text"
                    value={deliveryText}
                    onChange={(e) => setDeliveryText(e.target.value)}
                    placeholder="e.g., Shop for ₹199 and get free delivery"
                    className="bg-black text-white focus-visible:ring-0 focus-visible:border-gray-600"
                    data-testid="input-delivery-text"
                  />
                  <p className="text-xs text-gray-400">Text shown on all product pages about delivery</p>
                </div>

                <Button
                  onClick={async () => {
                    const days = parseInt(timerDays);
                    if (!bannerText || !deliveryText || isNaN(days) || days < 1 || days > 365) {
                      toast({
                        title: "Invalid values",
                        description: "Please enter valid banner text, delivery text and timer duration (1-365 days)",
                        variant: "destructive",
                      });
                      return;
                    }
                    try {
                      await updateOfferBanner(bannerText, days, deliveryText);
                      toast({
                        title: "Banner updated",
                        description: "Promotional settings have been saved and timer has been reset",
                      });
                    } catch (error) {
                      toast({
                        title: "Update failed",
                        description: "Failed to update promotional settings",
                        variant: "destructive",
                      });
                    }
                  }}
                  disabled={isUpdatingPromotionalSettings}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  data-testid="button-save-banner"
                >
                  {isUpdatingPromotionalSettings ? "Saving..." : "Save Banner Settings"}
                </Button>

                <div className="mt-3 p-3 rounded bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900">
                  <p className="text-xs font-semibold mb-2">Preview:</p>
                  <p className="text-sm">{bannerText || "Enter banner text"}</p>
                  <p className="text-xs opacity-70 mt-1">Timer: {timerDays || "0"} days</p>
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
                className="focus-visible:ring-0 focus-visible:border-gray-300 dark:focus-visible:border-gray-600"
                data-testid="input-product-title"
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
                  className="focus-visible:ring-0 focus-visible:border-gray-300 dark:focus-visible:border-gray-600"
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
                  className="focus-visible:ring-0 focus-visible:border-gray-300 dark:focus-visible:border-gray-600"
                  data-testid="input-product-original-price"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Main Image *</Label>
              <div className="flex gap-2">
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  onPaste={handleMainImagePaste}
                  placeholder="https://example.com/image.png or paste/upload image"
                  required
                  data-testid="input-product-image"
                  className="flex-1 focus-visible:ring-0 focus-visible:border-gray-300 dark:focus-visible:border-gray-600"
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
                Paste image URL, paste copied image (Ctrl+V), or upload from device
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalImages">Additional Images</Label>
              <Textarea
                id="additionalImages"
                value={formData.additionalImages}
                onChange={(e) => setFormData({ ...formData, additionalImages: e.target.value })}
                onPaste={handleAdditionalImagesPaste}
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
                Paste URLs (one per line), paste copied images (Ctrl+V), or upload from device
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
