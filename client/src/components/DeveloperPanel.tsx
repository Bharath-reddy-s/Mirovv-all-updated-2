import { useDeveloper } from "@/contexts/DeveloperContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Plus, Edit, Upload, Trash2, Zap, MapPin, Clock, Percent, Gift } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatBoldText } from "@/lib/formatText";
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
import type { Product, Offer } from "@shared/schema";

const DEFAULT_LONG_DESCRIPTION = "Mystery box is the medium through which we want to give stuff to students (dont expect that stuff guys) . this is for the people who always say \"Thu yak adru college ge band no\" or \"for that one guy whole is always lonely \" or for that one friend who is single  forever and that one friend who looks inocent but only you know about him . Enjoy the experience very time From the moment you order to the thrill of unboxing and even winning a giveaway, every step is designed to make life a little less \"ugh\" and a lot more \"SIKE\"";

export default function DeveloperPanel() {
  const { isDeveloperMode, stockStatus, products, priceFilters, promotionalSettings, flashOffer, deliveryAddresses, timeChallenge, checkoutDiscount, toggleStockStatus, createProduct, updateProduct, deleteProduct, setProductPosition, createPriceFilter, updatePriceFilter, deletePriceFilter, updateOfferBanner, startFlashOffer, stopFlashOffer, createDeliveryAddress, updateDeliveryAddress, deleteDeliveryAddress, updateTimeChallenge, updateCheckoutDiscount, isCreatingProduct, isUpdatingProduct, isDeletingProduct, isReordering, isManagingFilters, isLoadingFilters, isUpdatingPromotionalSettings, isTogglingFlashOffer, isManagingAddresses, isLoadingAddresses, isUpdatingTimeChallenge, isUpdatingCheckoutDiscount } = useDeveloper();
  const [isVisible, setIsVisible] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newFilterValue, setNewFilterValue] = useState("");
  const [editingFilterId, setEditingFilterId] = useState<number | null>(null);
  const [editingFilterValue, setEditingFilterValue] = useState("");
  const [bannerText, setBannerText] = useState(promotionalSettings?.bannerText || "₹10 off on every product");
  const [timerHours, setTimerHours] = useState("0");
  const [timerMinutes, setTimerMinutes] = useState("0");
  const [timerSeconds, setTimerSeconds] = useState("0");
  const [deliveryText, setDeliveryText] = useState(promotionalSettings?.deliveryText || "Shop for ₹199 and get free delivery");
  const { toast } = useToast();
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const additionalImagesInputRef = useRef<HTMLInputElement>(null);
  const [editingPositionId, setEditingPositionId] = useState<number | null>(null);
  const [editingPositionValue, setEditingPositionValue] = useState("");
  const [editingPriceId, setEditingPriceId] = useState<number | null>(null);
  const [editingPriceValue, setEditingPriceValue] = useState("");
  const [flashSlots, setFlashSlots] = useState("5");
  const [flashDuration, setFlashDuration] = useState("30");
  const [flashBannerText, setFlashBannerText] = useState("First 5 orders are FREE!");
  const [newAddressName, setNewAddressName] = useState("");
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [editingAddressName, setEditingAddressName] = useState("");
  const [challengeName, setChallengeName] = useState("");
  const [challengeDuration, setChallengeDuration] = useState("120");
  const [challengeDiscount, setChallengeDiscount] = useState("20");
  const [discountPercent, setDiscountPercent] = useState("");
  const [offerTitle, setOfferTitle] = useState("");
  const [offerDescription, setOfferDescription] = useState("");
  const [offerImage1, setOfferImage1] = useState("");
  const [offerImage2, setOfferImage2] = useState("");
  const [offerImage3, setOfferImage3] = useState("");
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [isOfferDialogOpen, setIsOfferDialogOpen] = useState(false);
  const [editingOfferPositionId, setEditingOfferPositionId] = useState<number | null>(null);
  const [editingOfferPositionValue, setEditingOfferPositionValue] = useState("");
  const offerImage1Ref = useRef<HTMLInputElement>(null);
  const offerImage2Ref = useRef<HTMLInputElement>(null);
  const offerImage3Ref = useRef<HTMLInputElement>(null);

  const { data: offers = [], isLoading: isLoadingOffers } = useQuery<Offer[]>({
    queryKey: ["/api/offers"],
  });

  const createOfferMutation = useMutation({
    mutationFn: async (offer: { title: string; description: string; images: string[] }) => {
      return apiRequest("POST", "/api/offers", offer);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/offers"] });
    },
  });

  const updateOfferMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: { title?: string; description?: string; images?: string[] } }) => {
      return apiRequest("PATCH", `/api/offers/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/offers"] });
    },
  });

  const deleteOfferMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/offers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/offers"] });
    },
  });

  const setOfferPositionMutation = useMutation({
    mutationFn: async ({ offerId, newPosition }: { offerId: number; newPosition: number }) => {
      return apiRequest("PATCH", `/api/offers/${offerId}`, { displayOrder: newPosition });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/offers"] });
    },
  });

  const openOfferCreateDialog = () => {
    setEditingOffer(null);
    setOfferTitle("");
    setOfferDescription("");
    setOfferImage1("");
    setOfferImage2("");
    setOfferImage3("");
    setIsOfferDialogOpen(true);
  };

  const openOfferEditDialog = (offer: Offer) => {
    setEditingOffer(offer);
    setOfferTitle(offer.title);
    setOfferDescription(offer.description);
    setOfferImage1(offer.images[0] || "");
    setOfferImage2(offer.images[1] || "");
    setOfferImage3(offer.images[2] || "");
    setIsOfferDialogOpen(true);
  };

  const handleOfferImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, setImage: (value: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await convertFileToBase64(file);
        setImage(base64);
        toast({
          title: "Image uploaded",
          description: "Image has been uploaded successfully.",
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

  const handleOfferSubmit = async () => {
    if (!offerTitle.trim() || !offerDescription.trim()) {
      toast({
        title: "Missing fields",
        description: "Please enter title and description",
        variant: "destructive",
      });
      return;
    }
    const images = [offerImage1, offerImage2, offerImage3].filter(Boolean);
    if (images.length === 0) {
      toast({
        title: "Missing images",
        description: "Please add at least one image URL",
        variant: "destructive",
      });
      return;
    }
    try {
      if (editingOffer) {
        await updateOfferMutation.mutateAsync({
          id: editingOffer.id,
          updates: {
            title: offerTitle,
            description: offerDescription,
            images,
          },
        });
        toast({
          title: "Offer updated",
          description: "Offer banner has been updated successfully",
        });
      } else {
        await createOfferMutation.mutateAsync({
          title: offerTitle,
          description: offerDescription,
          images,
        });
        toast({
          title: "Offer created",
          description: "Offer banner has been created successfully",
        });
      }
      setIsOfferDialogOpen(false);
      setOfferTitle("");
      setOfferDescription("");
      setOfferImage1("");
      setOfferImage2("");
      setOfferImage3("");
      setEditingOffer(null);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save offer",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (promotionalSettings) {
      setBannerText(promotionalSettings.bannerText);
      const totalSeconds = promotionalSettings.timerSeconds || 0;
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      setTimerHours(hours.toString());
      setTimerMinutes(minutes.toString());
      setTimerSeconds(seconds.toString());
      setDeliveryText(promotionalSettings.deliveryText);
    }
  }, [promotionalSettings]);

  useEffect(() => {
    if (timeChallenge) {
      setChallengeName(timeChallenge.name);
      setChallengeDuration(timeChallenge.durationSeconds.toString());
      setChallengeDiscount(timeChallenge.discountPercent.toString());
    }
  }, [timeChallenge]);

  useEffect(() => {
    if (checkoutDiscount) {
      setDiscountPercent(checkoutDiscount.discountPercent.toString());
    }
  }, [checkoutDiscount]);

  const [formData, setFormData] = useState({
    productCode: "",
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
      productCode: "",
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
      productCode: product.productCode ?? "",
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
        productCode: formData.productCode,
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
            <TabsList className="grid w-full grid-cols-9 mb-3">
              <TabsTrigger value="stock" data-testid="tab-stock">1</TabsTrigger>
              <TabsTrigger value="products" data-testid="tab-products">2</TabsTrigger>
              <TabsTrigger value="filters" data-testid="tab-filters">3</TabsTrigger>
              <TabsTrigger value="banner" data-testid="tab-banner">4</TabsTrigger>
              <TabsTrigger value="flash" data-testid="tab-flash">5</TabsTrigger>
              <TabsTrigger value="address" data-testid="tab-address">6</TabsTrigger>
              <TabsTrigger value="timer" data-testid="tab-timer">7</TabsTrigger>
              <TabsTrigger value="discount" data-testid="tab-discount">8</TabsTrigger>
              <TabsTrigger value="nine" data-testid="tab-nine">9</TabsTrigger>
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
                            className="w-16 h-8 text-xs bg-[#000000]"
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
                      ) : editingPriceId === product.id ? (
                        <>
                          <div 
                            className="w-8 h-8 flex items-center justify-center bg-gray-700 dark:bg-gray-300 rounded text-xs font-bold"
                            data-testid={`position-indicator-${product.id}`}
                          >
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{product.title}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <div className="relative flex-1">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
                                <Input
                                  type="number"
                                  value={editingPriceValue}
                                  onChange={(e) => setEditingPriceValue(e.target.value)}
                                  className="h-7 pl-5 text-xs w-20"
                                  data-testid={`input-price-${product.id}`}
                                />
                              </div>
                              <Button
                                size="sm"
                                onClick={async () => {
                                  if (!editingPriceValue || parseInt(editingPriceValue) <= 0) {
                                    toast({
                                      title: "Invalid price",
                                      description: "Please enter a valid price",
                                      variant: "destructive",
                                    });
                                    return;
                                  }
                                  try {
                                    await updateProduct(product.id, { price: `₹${editingPriceValue}` });
                                    setEditingPriceId(null);
                                    setEditingPriceValue("");
                                    toast({
                                      title: "Price updated",
                                      description: "Product price updated successfully",
                                    });
                                  } catch (error) {
                                    toast({
                                      title: "Error",
                                      description: "Failed to update price",
                                      variant: "destructive",
                                    });
                                  }
                                }}
                                disabled={isUpdatingProduct}
                                className="h-7 px-2 text-xs bg-green-600 hover:bg-green-700 text-white"
                                data-testid={`button-save-price-${product.id}`}
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => {
                                  setEditingPriceId(null);
                                  setEditingPriceValue("");
                                }}
                                className="h-7 px-2 text-xs"
                                data-testid={`button-cancel-price-${product.id}`}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
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
                            <p 
                              className="text-xs opacity-70 cursor-pointer hover:opacity-100 hover:text-green-400 transition-colors"
                              onClick={() => {
                                setEditingPriceId(product.id);
                                setEditingPriceValue(product.price.replace(/[₹,]/g, ''));
                              }}
                              data-testid={`price-indicator-${product.id}`}
                            >
                              {product.price} <span className="text-[10px] opacity-50">(click to edit)</span>
                            </p>
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
                    className="flex-1 bg-[#000000]"
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
                  <Label>Timer Duration</Label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        id="timer-hours"
                        type="number"
                        min="0"
                        max="8760"
                        value={timerHours}
                        onChange={(e) => setTimerHours(e.target.value)}
                        placeholder="0"
                        className="bg-black text-white focus-visible:ring-0 focus-visible:border-gray-600"
                        data-testid="input-timer-hours"
                      />
                      <p className="text-xs text-gray-400 mt-1 text-center">Hours</p>
                    </div>
                    <div className="flex-1">
                      <Input
                        id="timer-minutes"
                        type="number"
                        min="0"
                        max="59"
                        value={timerMinutes}
                        onChange={(e) => setTimerMinutes(e.target.value)}
                        placeholder="0"
                        className="bg-black text-white focus-visible:ring-0 focus-visible:border-gray-600"
                        data-testid="input-timer-minutes"
                      />
                      <p className="text-xs text-gray-400 mt-1 text-center">Minutes</p>
                    </div>
                    <div className="flex-1">
                      <Input
                        id="timer-seconds"
                        type="number"
                        min="0"
                        max="59"
                        value={timerSeconds}
                        onChange={(e) => setTimerSeconds(e.target.value)}
                        placeholder="0"
                        className="bg-black text-white focus-visible:ring-0 focus-visible:border-gray-600"
                        data-testid="input-timer-seconds"
                      />
                      <p className="text-xs text-gray-400 mt-1 text-center">Seconds</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">Set custom countdown duration</p>
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
                    const hours = parseInt(timerHours) || 0;
                    const minutes = parseInt(timerMinutes) || 0;
                    const seconds = parseInt(timerSeconds) || 0;
                    const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
                    
                    if (!bannerText || !deliveryText) {
                      toast({
                        title: "Invalid values",
                        description: "Please enter valid banner text and delivery text",
                        variant: "destructive",
                      });
                      return;
                    }
                    
                    if (totalSeconds < 1) {
                      toast({
                        title: "Invalid duration",
                        description: "Timer duration must be at least 1 second",
                        variant: "destructive",
                      });
                      return;
                    }
                    
                    try {
                      await updateOfferBanner(bannerText, totalSeconds, deliveryText);
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
                  <p className="text-sm">{formatBoldText(bannerText || "Enter banner text")}</p>
                  <p className="text-xs opacity-70 mt-1">Timer: {timerHours || "0"}h {timerMinutes || "0"}m {timerSeconds || "0"}s</p>
                  <p className="text-xs opacity-50 mt-2">Tip: Use *text* to make text bold</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="flash">
              <p className="text-xs mb-3 opacity-80">Start a flash sale with custom slots and duration</p>
              <div className="space-y-3">
                <div className="p-3 rounded bg-gray-800 dark:bg-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-semibold">Flash Offer Status</span>
                  </div>
                  <div className="text-sm">
                    {flashOffer?.isActive ? (
                      <div className="space-y-1">
                        <p className="text-green-400">Active</p>
                        <p className="text-xs opacity-70">
                          Spots claimed: {flashOffer.claimedCount} / {flashOffer.maxClaims}
                        </p>
                        <p className="text-xs opacity-70">
                          Remaining: {Math.max(0, flashOffer.maxClaims - flashOffer.claimedCount)} spots
                        </p>
                        {flashOffer.endsAt && (
                          <p className="text-xs opacity-70">
                            Ends: {new Date(flashOffer.endsAt).toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-400">Not active</p>
                    )}
                  </div>
                </div>

                {!flashOffer?.isActive && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="flash-banner-text">Banner Text</Label>
                      <Input
                        id="flash-banner-text"
                        type="text"
                        value={flashBannerText}
                        onChange={(e) => setFlashBannerText(e.target.value)}
                        placeholder="First 5 orders are FREE!"
                        className="bg-gray-900 text-white focus-visible:ring-0 focus-visible:border-gray-600"
                        data-testid="input-flash-banner-text"
                      />
                      <p className="text-xs text-gray-400">Text shown on the flash offer banner</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="flash-slots">Free Slots</Label>
                      <Input
                        id="flash-slots"
                        type="number"
                        min="1"
                        max="10000"
                        value={flashSlots}
                        onChange={(e) => setFlashSlots(e.target.value)}
                        placeholder="5"
                        className="bg-gray-900 text-white focus-visible:ring-0 focus-visible:border-gray-600"
                        data-testid="input-flash-slots"
                      />
                      <p className="text-xs text-gray-400">Number of free orders available (1-10,000)</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="flash-duration">Duration (Seconds)</Label>
                      <Input
                        id="flash-duration"
                        type="number"
                        min="5"
                        max="86400"
                        value={flashDuration}
                        onChange={(e) => setFlashDuration(e.target.value)}
                        placeholder="30"
                        className="bg-gray-900 text-white focus-visible:ring-0 focus-visible:border-gray-600"
                        data-testid="input-flash-duration"
                      />
                      <p className="text-xs text-gray-400">How long the flash offer runs (5 sec - 24 hours)</p>
                    </div>
                  </div>
                )}

                {flashOffer?.isActive ? (
                  <Button
                    onClick={async () => {
                      try {
                        await stopFlashOffer();
                        toast({
                          title: "Flash offer stopped",
                          description: "The flash offer has been deactivated",
                        });
                      } catch (error) {
                        toast({
                          title: "Error",
                          description: "Failed to stop flash offer",
                          variant: "destructive",
                        });
                      }
                    }}
                    disabled={isTogglingFlashOffer}
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                    data-testid="button-stop-flash"
                  >
                    {isTogglingFlashOffer ? "Stopping..." : "Stop Flash Offer"}
                  </Button>
                ) : (
                  <Button
                    onClick={async () => {
                      const slots = parseInt(flashSlots);
                      const duration = parseInt(flashDuration);
                      
                      if (!flashBannerText.trim()) {
                        toast({
                          title: "Invalid banner text",
                          description: "Please enter a banner text",
                          variant: "destructive",
                        });
                        return;
                      }
                      
                      if (isNaN(slots) || slots < 1 || slots > 10000) {
                        toast({
                          title: "Invalid slots",
                          description: "Please enter a number between 1 and 10,000",
                          variant: "destructive",
                        });
                        return;
                      }
                      
                      if (isNaN(duration) || duration < 5 || duration > 86400) {
                        toast({
                          title: "Invalid duration",
                          description: "Please enter a duration between 5 seconds and 24 hours",
                          variant: "destructive",
                        });
                        return;
                      }
                      
                      try {
                        await startFlashOffer(slots, duration, flashBannerText.trim());
                        toast({
                          title: "Flash offer started!",
                          description: `First ${slots} orders will be FREE for ${duration} seconds`,
                        });
                      } catch (error) {
                        toast({
                          title: "Error",
                          description: "Failed to start flash offer",
                          variant: "destructive",
                        });
                      }
                    }}
                    disabled={isTogglingFlashOffer}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                    data-testid="button-start-flash"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    {isTogglingFlashOffer ? "Starting..." : `Start Flash Offer (${flashSlots} slots, ${flashDuration}s)`}
                  </Button>
                )}

                <div className="text-xs opacity-60 space-y-1">
                  <p>When active, customers will see a banner with countdown timer.</p>
                  <p>Orders placed during the flash offer will be FREE (₹0).</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="address">
              <p className="text-xs mb-3 opacity-80">Manage delivery addresses available at checkout</p>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={newAddressName}
                    onChange={(e) => setNewAddressName(e.target.value)}
                    placeholder="Enter new address name"
                    className="flex-1 bg-[#000000] bg-gray-900 dark:bg-gray-100 text-white dark:text-black"
                    data-testid="input-new-address"
                  />
                  <Button
                    onClick={async () => {
                      if (!newAddressName.trim()) {
                        toast({
                          title: "Invalid address",
                          description: "Please enter an address name",
                          variant: "destructive",
                        });
                        return;
                      }
                      try {
                        await createDeliveryAddress(newAddressName.trim());
                        setNewAddressName("");
                        toast({
                          title: "Address added",
                          description: "New delivery address has been added",
                        });
                      } catch (error) {
                        toast({
                          title: "Error",
                          description: "Failed to add address",
                          variant: "destructive",
                        });
                      }
                    }}
                    disabled={isManagingAddresses}
                    className="bg-green-600 hover:bg-green-700 text-white"
                    data-testid="button-add-address"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {isLoadingAddresses ? (
                  <p className="text-sm opacity-70">Loading addresses...</p>
                ) : deliveryAddresses.length === 0 ? (
                  <p className="text-sm opacity-70">No delivery addresses yet. Add one above.</p>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {deliveryAddresses.map((address) => (
                      <div
                        key={address.id}
                        className="flex items-center gap-2 p-2 rounded bg-gray-800 dark:bg-gray-200"
                      >
                        {editingAddressId === address.id ? (
                          <>
                            <Input
                              value={editingAddressName}
                              onChange={(e) => setEditingAddressName(e.target.value)}
                              className="flex-1 h-8 text-sm bg-gray-900 dark:bg-gray-100"
                              data-testid={`input-edit-address-${address.id}`}
                            />
                            <Button
                              size="sm"
                              onClick={async () => {
                                if (!editingAddressName.trim()) {
                                  toast({
                                    title: "Invalid address",
                                    description: "Address name cannot be empty",
                                    variant: "destructive",
                                  });
                                  return;
                                }
                                try {
                                  await updateDeliveryAddress(address.id, editingAddressName.trim());
                                  setEditingAddressId(null);
                                  setEditingAddressName("");
                                  toast({
                                    title: "Address updated",
                                    description: "Delivery address has been updated",
                                  });
                                } catch (error) {
                                  toast({
                                    title: "Error",
                                    description: "Failed to update address",
                                    variant: "destructive",
                                  });
                                }
                              }}
                              disabled={isManagingAddresses}
                              className="h-8 px-2 text-xs bg-green-600 hover:bg-green-700 text-white"
                              data-testid={`button-save-address-${address.id}`}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => {
                                setEditingAddressId(null);
                                setEditingAddressName("");
                              }}
                              className="h-8 px-2 text-xs"
                              data-testid={`button-cancel-address-${address.id}`}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <MapPin className="w-4 h-4 flex-shrink-0 opacity-70" />
                            <span className="flex-1 text-sm truncate">{address.name}</span>
                            <Button
                              size="sm"
                              onClick={() => {
                                setEditingAddressId(address.id);
                                setEditingAddressName(address.name);
                              }}
                              className="h-8 px-2 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                              data-testid={`button-edit-address-${address.id}`}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={async () => {
                                try {
                                  await deleteDeliveryAddress(address.id);
                                  toast({
                                    title: "Address deleted",
                                    description: "Delivery address has been removed",
                                  });
                                } catch (error) {
                                  toast({
                                    title: "Error",
                                    description: "Failed to delete address",
                                    variant: "destructive",
                                  });
                                }
                              }}
                              disabled={isManagingAddresses}
                              className="h-8 px-2 text-xs bg-red-600 hover:bg-red-700 text-white"
                              data-testid={`button-delete-address-${address.id}`}
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

            <TabsContent value="timer">
              <p className="text-xs mb-3 opacity-80">Configure time-limited discount challenge</p>
              <div className="space-y-3">
                <div className="p-3 rounded bg-gray-800 dark:bg-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-semibold">Challenge Status</span>
                  </div>
                  <div className="text-sm">
                    {timeChallenge?.isActive ? (
                      <p className="text-green-400">Active - Button visible to customers</p>
                    ) : (
                      <p className="text-gray-400">Inactive - Challenge is hidden</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="challenge-name">Challenge Name</Label>
                  <Input
                    id="challenge-name"
                    type="text"
                    value={challengeName}
                    onChange={(e) => setChallengeName(e.target.value)}
                    placeholder="Beat the Clock!"
                    className="bg-gray-900 text-white focus-visible:ring-0 focus-visible:border-gray-600"
                    data-testid="input-challenge-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="challenge-duration">Duration (seconds)</Label>
                  <Input
                    id="challenge-duration"
                    type="number"
                    min="5"
                    max="86400"
                    value={challengeDuration}
                    onChange={(e) => setChallengeDuration(e.target.value)}
                    placeholder="120"
                    className="bg-gray-900 text-white focus-visible:ring-0 focus-visible:border-gray-600"
                    data-testid="input-challenge-duration"
                  />
                  <p className="text-xs text-gray-400">Time users have to complete checkout (5 sec - 24 hours)</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="challenge-discount">Discount (%)</Label>
                  <Input
                    id="challenge-discount"
                    type="number"
                    min="1"
                    max="100"
                    value={challengeDiscount}
                    onChange={(e) => setChallengeDiscount(e.target.value)}
                    placeholder="20"
                    className="bg-gray-900 text-white focus-visible:ring-0 focus-visible:border-gray-600"
                    data-testid="input-challenge-discount"
                  />
                  <p className="text-xs text-gray-400">Discount applied if checkout completed in time</p>
                </div>

                <Button
                  onClick={async () => {
                    const duration = parseInt(challengeDuration);
                    const discount = parseInt(challengeDiscount);
                    
                    if (!challengeName.trim()) {
                      toast({
                        title: "Invalid name",
                        description: "Please enter a challenge name",
                        variant: "destructive",
                      });
                      return;
                    }
                    if (isNaN(duration) || duration < 5 || duration > 86400) {
                      toast({
                        title: "Invalid duration",
                        description: "Duration must be between 5 seconds and 24 hours",
                        variant: "destructive",
                      });
                      return;
                    }
                    if (isNaN(discount) || discount < 1 || discount > 100) {
                      toast({
                        title: "Invalid discount",
                        description: "Discount must be between 1 and 100%",
                        variant: "destructive",
                      });
                      return;
                    }
                    try {
                      await updateTimeChallenge({
                        name: challengeName.trim(),
                        durationSeconds: duration,
                        discountPercent: discount,
                      });
                      toast({
                        title: "Settings saved",
                        description: "Time challenge settings have been updated",
                      });
                    } catch (error) {
                      toast({
                        title: "Error",
                        description: "Failed to update time challenge settings",
                        variant: "destructive",
                      });
                    }
                  }}
                  disabled={isUpdatingTimeChallenge}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  data-testid="button-save-challenge"
                >
                  {isUpdatingTimeChallenge ? "Saving..." : "Save Challenge Settings"}
                </Button>

                <Button
                  onClick={async () => {
                    try {
                      await updateTimeChallenge({ isActive: !timeChallenge?.isActive });
                      toast({
                        title: timeChallenge?.isActive ? "Challenge deactivated" : "Challenge activated",
                        description: timeChallenge?.isActive 
                          ? "The time challenge is now hidden from customers"
                          : "Customers can now see the challenge button",
                      });
                    } catch (error) {
                      toast({
                        title: "Error",
                        description: "Failed to toggle time challenge",
                        variant: "destructive",
                      });
                    }
                  }}
                  disabled={isUpdatingTimeChallenge}
                  className={`w-full ${timeChallenge?.isActive ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"} text-white`}
                  data-testid="button-toggle-challenge"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  {isUpdatingTimeChallenge ? "Updating..." : (timeChallenge?.isActive ? "Deactivate Challenge" : "Activate Challenge")}
                </Button>

                <div className="text-xs opacity-60 space-y-1">
                  <p>When active, a floating button appears for customers to start the timer.</p>
                  <p>If they complete checkout within the time, they get the discount.</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="discount">
              <p className="text-xs mb-3 opacity-80">Set a global discount percentage applied to all orders</p>
              <div className="space-y-3">
                <div className="p-3 rounded bg-gray-800 dark:bg-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Percent className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-semibold">Current Discount</span>
                  </div>
                  <div className="text-sm">
                    {checkoutDiscount && checkoutDiscount.discountPercent > 0 ? (
                      <p className="text-green-400">{checkoutDiscount.discountPercent}% off all orders</p>
                    ) : (
                      <p className="text-gray-400">No discount active</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discount-percent">Discount Percentage</Label>
                  <Input
                    id="discount-percent"
                    type="number"
                    min="0"
                    max="100"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    placeholder="0"
                    className="bg-gray-900 text-white focus-visible:ring-0 focus-visible:border-gray-600"
                    data-testid="input-checkout-discount"
                  />
                  <p className="text-xs text-gray-400">Enter 0 to disable discount, or 1-100 for percentage off</p>
                </div>

                <Button
                  onClick={async () => {
                    const percent = parseInt(discountPercent);
                    if (isNaN(percent) || percent < 0 || percent > 100) {
                      toast({
                        title: "Invalid discount",
                        description: "Discount must be between 0 and 100%",
                        variant: "destructive",
                      });
                      return;
                    }
                    try {
                      await updateCheckoutDiscount(percent);
                      toast({
                        title: percent > 0 ? "Discount applied" : "Discount removed",
                        description: percent > 0 
                          ? `${percent}% discount will be applied to all orders`
                          : "No discount will be applied to orders",
                      });
                    } catch (error) {
                      toast({
                        title: "Error",
                        description: "Failed to update discount",
                        variant: "destructive",
                      });
                    }
                  }}
                  disabled={isUpdatingCheckoutDiscount}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  data-testid="button-save-discount"
                >
                  <Percent className="w-4 h-4 mr-2" />
                  {isUpdatingCheckoutDiscount ? "Saving..." : "Save Discount"}
                </Button>

                <div className="text-xs opacity-60 space-y-1">
                  <p>This discount is applied automatically to all orders at checkout.</p>
                  <p>Customers will not see this discount on the frontend.</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="nine">
              <div className="space-y-3">
                <Button
                  onClick={openOfferCreateDialog}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  data-testid="button-create-offer"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Offer
                </Button>

                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {isLoadingOffers ? (
                    <p className="text-sm text-gray-400 text-center py-4">Loading offers...</p>
                  ) : offers.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">No offers created yet</p>
                  ) : (
                    offers.map((offer, index) => (
                      <div
                        key={offer.id}
                        className="flex items-center gap-2 p-2 rounded bg-gray-800 dark:bg-gray-200"
                        data-testid={`offer-item-${offer.id}`}
                      >
                        {editingOfferPositionId === offer.id ? (
                          <>
                            <Input
                              type="number"
                              min="1"
                              max={offers.length}
                              value={editingOfferPositionValue}
                              onChange={(e) => setEditingOfferPositionValue(e.target.value)}
                              className="w-16 h-8 text-xs bg-[#000000]"
                              data-testid={`input-offer-position-${offer.id}`}
                            />
                            <Button
                              size="sm"
                              onClick={async () => {
                                const newPos = parseInt(editingOfferPositionValue);
                                if (!editingOfferPositionValue || newPos < 1 || newPos > offers.length) {
                                  toast({
                                    title: "Invalid position",
                                    description: `Please enter a number between 1 and ${offers.length}`,
                                    variant: "destructive",
                                  });
                                  return;
                                }
                                try {
                                  await setOfferPositionMutation.mutateAsync({ offerId: offer.id, newPosition: newPos });
                                  setEditingOfferPositionId(null);
                                  setEditingOfferPositionValue("");
                                  toast({
                                    title: "Position updated",
                                    description: "Offer position updated successfully",
                                  });
                                } catch (error) {
                                  toast({
                                    title: "Error",
                                    description: "Failed to update position",
                                    variant: "destructive",
                                  });
                                }
                              }}
                              disabled={setOfferPositionMutation.isPending}
                              className="h-8 px-2 text-xs bg-green-600 hover:bg-green-700 text-white"
                              data-testid={`button-save-offer-position-${offer.id}`}
                            >
                              Set
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => {
                                setEditingOfferPositionId(null);
                                setEditingOfferPositionValue("");
                              }}
                              className="h-8 px-2 text-xs"
                              data-testid={`button-cancel-offer-position-${offer.id}`}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <div 
                              className="w-8 h-8 flex items-center justify-center bg-gray-700 dark:bg-gray-300 rounded text-xs font-bold cursor-pointer hover-elevate active-elevate-2"
                              onClick={() => {
                                setEditingOfferPositionId(offer.id);
                                setEditingOfferPositionValue((index + 1).toString());
                              }}
                              data-testid={`offer-position-indicator-${offer.id}`}
                            >
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{offer.title}</p>
                              <p className="text-xs opacity-70 truncate">{offer.description}</p>
                              <p className="text-xs opacity-50">{offer.images.length} image(s)</p>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => openOfferEditDialog(offer)}
                              className="h-8 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                              data-testid={`button-edit-offer-${offer.id}`}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={async () => {
                                try {
                                  await deleteOfferMutation.mutateAsync(offer.id);
                                  toast({
                                    title: "Offer deleted",
                                    description: "Offer banner has been deleted successfully",
                                  });
                                } catch (error) {
                                  toast({
                                    title: "Error",
                                    description: "Failed to delete offer",
                                    variant: "destructive",
                                  });
                                }
                              }}
                              disabled={deleteOfferMutation.isPending}
                              className="h-8 px-3 text-xs bg-red-600 hover:bg-red-700 text-white"
                              data-testid={`button-delete-offer-${offer.id}`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    ))
                  )}
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="productCode">Product Code *</Label>
                <Input
                  id="productCode"
                  value={formData.productCode}
                  onChange={(e) => setFormData({ ...formData, productCode: e.target.value })}
                  placeholder="e.g., #07"
                  required
                  className="focus-visible:ring-0 focus-visible:border-gray-300 dark:focus-visible:border-gray-600"
                  data-testid="input-product-code"
                />
              </div>
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price.replace(/[₹,]/g, '')}
                    onChange={(e) => setFormData({ ...formData, price: `₹${e.target.value}` })}
                    placeholder="49"
                    required
                    className="pl-7 focus-visible:ring-0 focus-visible:border-gray-300 dark:focus-visible:border-gray-600"
                    data-testid="input-product-price"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="originalPrice">Original Price</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                  <Input
                    id="originalPrice"
                    type="number"
                    value={formData.originalPrice.replace(/[₹,]/g, '')}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value ? `₹${e.target.value}` : '' })}
                    placeholder="79"
                    className="pl-7 focus-visible:ring-0 focus-visible:border-gray-300 dark:focus-visible:border-gray-600"
                    data-testid="input-product-original-price"
                  />
                </div>
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

      <Dialog open={isOfferDialogOpen} onOpenChange={setIsOfferDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle data-testid="dialog-title-offer">
              {editingOffer ? "Edit Offer" : "Create New Offer"}
            </DialogTitle>
            <DialogDescription>
              {editingOffer 
                ? "Update the offer details below." 
                : "Fill in the offer details below."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="offer-title">Offer Title *</Label>
              <Input
                id="offer-title"
                value={offerTitle}
                onChange={(e) => setOfferTitle(e.target.value)}
                placeholder="e.g., Special Discount"
                data-testid="input-offer-title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="offer-description">Description *</Label>
              <Textarea
                id="offer-description"
                value={offerDescription}
                onChange={(e) => setOfferDescription(e.target.value)}
                placeholder="Describe the offer..."
                rows={3}
                data-testid="input-offer-description"
              />
            </div>

            <div className="space-y-2">
              <Label>Image URLs (at least 1 required)</Label>
              <div className="space-y-2">
                <div className="space-y-1">
                  <Label className="text-xs opacity-70">Image 1 *</Label>
                  <div className="flex gap-2">
                    <Input
                      value={offerImage1}
                      onChange={(e) => setOfferImage1(e.target.value)}
                      placeholder="https://example.com/image1.jpg"
                      data-testid="input-offer-image-1"
                    />
                    <input
                      ref={offerImage1Ref}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleOfferImageUpload(e, setOfferImage1)}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => offerImage1Ref.current?.click()}
                      data-testid="button-upload-offer-image-1"
                    >
                      <Upload className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs opacity-70">Image 2 (optional)</Label>
                  <div className="flex gap-2">
                    <Input
                      value={offerImage2}
                      onChange={(e) => setOfferImage2(e.target.value)}
                      placeholder="https://example.com/image2.jpg"
                      data-testid="input-offer-image-2"
                    />
                    <input
                      ref={offerImage2Ref}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleOfferImageUpload(e, setOfferImage2)}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => offerImage2Ref.current?.click()}
                      data-testid="button-upload-offer-image-2"
                    >
                      <Upload className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs opacity-70">Image 3 (optional)</Label>
                  <div className="flex gap-2">
                    <Input
                      value={offerImage3}
                      onChange={(e) => setOfferImage3(e.target.value)}
                      placeholder="https://example.com/image3.jpg"
                      data-testid="input-offer-image-3"
                    />
                    <input
                      ref={offerImage3Ref}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleOfferImageUpload(e, setOfferImage3)}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => offerImage3Ref.current?.click()}
                      data-testid="button-upload-offer-image-3"
                    >
                      <Upload className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleOfferSubmit}
                disabled={createOfferMutation.isPending || updateOfferMutation.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                data-testid="button-save-offer"
              >
                <Gift className="w-4 h-4 mr-2" />
                {createOfferMutation.isPending || updateOfferMutation.isPending
                  ? "Saving..."
                  : editingOffer
                  ? "Update Offer"
                  : "Create Offer"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOfferDialogOpen(false)}
                data-testid="button-cancel-offer"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
