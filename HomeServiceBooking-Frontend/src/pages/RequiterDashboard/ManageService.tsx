import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { Trash2, Edit, Eye, Loader2, Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardFooter } from "../../components/ui/card";
import { Skeleton } from "../../components/ui/skeleton";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import image from "../../assets/add-image.png";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addBusinessSchema } from "../../lib/validator";
import type { addBusinessFormData } from "../../lib/validator";

interface Business {
  id: string;
  name: string;
  about: string;
  address: string;
  category: string;
  amount: number;
  images: { url: string }[];
  requiterId: string;
}

const categories = [
  "Cleaning",
  "Repair",
  "Shifting",
  "Plumbing",
  "Painting",
  "Electric",
];

const ManageService = () => {
  const { backendUrl, requiterToken } = useContext(AppContext);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(
    null
  );
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(
    null
  );
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<addBusinessFormData>({
    resolver: zodResolver(addBusinessSchema),
    defaultValues: {
      name: "",
      about: "",
      address: "",
      category: "",
      amount: 0,
      images: [],
    },
  });

  const handleCategorySelect = (category: string) => {
    {
      categories.map((cat) => {
        if (selectedBusiness?.category === cat) {
          return setSelectedCategory(category);
        }
      });

      setValue("category", category, { shouldValidate: true });
    }
  };

  // Fetch business data
  const fetchBusinessData = async () => {
    if (!requiterToken) return;

    try {
      setLoading(true);
      const { data } = await axios.get(
        `${backendUrl}/api/requiter/getBusinessDataForRequiter`,
        {
          headers: { Authorization: requiterToken },
        }
      );

      if (data.success) {
        setBusinesses(data.businessData || []);
      } else {
        toast.error("Failed to fetch business data");
      }
    } catch (error: any) {
      console.error("Error fetching business data:", error);
      toast.error(
        error.response?.data?.message || "Failed to fetch business data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinessData();
  }, [backendUrl, requiterToken]);

  // Handle delete business
  const handleDeleteBusiness = async (businessId: string) => {
    if (!requiterToken) return;

    try {
      setDeleteLoading(businessId);
      const { data } = await axios.delete(
        `${backendUrl}/api/requiter/deleteBusiness/${businessId}`,
        {
          headers: { Authorization: requiterToken },
        }
      );

      if (data.success) {
        toast.success("Business deleted successfully");
        setBusinesses((prev) =>
          prev.filter((business) => business.id !== businessId)
        );
      } else {
        toast.error(data.message || "Failed to delete business");
      }
    } catch (error: any) {
      console.error("Error deleting business:", error);
      toast.error(error.response?.data?.message || "Failed to delete business");
    } finally {
      setDeleteLoading(null);
      setDeleteDialogOpen(false);
    }
  };

  // Open edit dialog
  const openEditDialog = (business: Business) => {
    setSelectedBusiness(business);
    reset({
      name: business.name,
      about: business.about,
      address: business.address,
      category: business.category,
      amount: business.amount,
      images: [],
    });
    setPreviewImages(business.images.map((img) => img.url));
    setEditDialogOpen(true);
  };

  // Handle image change
  const handleImageChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const newPreviewUrl = URL.createObjectURL(file);

      setPreviewImages((prev) => {
        const updated = [...prev];
        updated[index] = newPreviewUrl;
        return updated;
      });

      setNewImages((prev) => {
        const updated = [...prev];
        updated[index] = file;
        return updated;
      });

      // Update form images
      const currentImages = [...newImages];
      currentImages[index] = file;
      setValue("images", currentImages);
    }
  };

  // Handle form submit
  const onSubmit = async (formData: addBusinessFormData) => {
    if (!selectedBusiness || !requiterToken) return;

    try {
      setUpdating(true);
      const submitFormData = new FormData();
      submitFormData.append("name", formData.name);
      submitFormData.append("about", formData.about);
      submitFormData.append("address", formData.address);
      submitFormData.append("category", formData.category);
      submitFormData.append("amount", formData.amount.toString());

      newImages.forEach((image) => {
        if (image) {
          submitFormData.append("images", image);
        }
      });

      const { data } = await axios.put(
        `${backendUrl}/api/requiter/updateBusiness/${selectedBusiness.id}`,
        submitFormData,
        {
          headers: {
            Authorization: requiterToken,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (data.success) {
        toast.success("Business updated successfully");
        await fetchBusinessData();
        setEditDialogOpen(false);
      } else {
        toast.error(data.message || "Failed to update business");
      }
    } catch (error: any) {
      console.error("Error updating business:", error);
      toast.error(error.response?.data?.message || "Failed to update business");
    } finally {
      setUpdating(false);
    }
  };

  // Handle view business
  const handleViewBusiness = (businessId: string) => {
    navigate(`/businessDetails/${businessId}`);
  };

  // Open delete dialog
  const openDeleteDialog = (businessId: string) => {
    setSelectedBusinessId(businessId);
    setDeleteDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="container p-4 mx-auto">
        <h1 className="mb-6 text-2xl font-bold">Manage Services</h1>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="w-full h-48" />
              <CardContent className="p-4">
                <Skeleton className="w-3/4 h-6 mb-2" />
                <Skeleton className="w-1/2 h-4 mb-2" />
                <Skeleton className="w-full h-4 mb-2" />
                <Skeleton className="w-2/3 h-4" />
              </CardContent>
              <CardFooter className="flex justify-between p-4 pt-0">
                <Skeleton className="w-24 h-10" />
                <Skeleton className="w-24 h-10" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container p-4 mx-auto">
      <h1 className="mb-6 text-2xl font-bold">Manage Services</h1>

      {businesses.length === 0 ? (
        <div className="p-8 text-center border border-gray-200 rounded-lg bg-gray-50">
          <h2 className="mb-2 text-xl font-semibold">No services found</h2>
          <p className="mb-4 text-gray-600">
            You haven't added any services yet.
          </p>
          <Button onClick={() => navigate("/requiterDashboard/add-service")}>
            Add Your First Service
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {businesses.map((business) => (
            <Card key={business.id} className="overflow-hidden">
              <div className="h-48 overflow-hidden">
                {business.images && business.images.length > 0 ? (
                  <img
                    src={business.images[0].url || "/placeholder.svg"}
                    alt={business.name}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-gray-200">
                    <span className="text-gray-400">No Image</span>
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-bold">{business.name}</h3>
                  <Badge
                    variant="outline"
                    className="text-green-800 bg-green-100 border-green-200"
                  >
                    ${business.amount.toFixed(2)}/hr
                  </Badge>
                </div>
                <Badge className="mb-2">{business.category}</Badge>
                <p className="mb-2 text-sm text-gray-600 line-clamp-2">
                  {business.address}
                </p>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {business.about}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between p-4 pt-0">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewBusiness(business.id)}
                  >
                    <Eye className="w-4 h-4 mr-1" /> View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditDialog(business)}
                  >
                    <Edit className="w-4 h-4 mr-1" /> Edit
                  </Button>
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => openDeleteDialog(business.id)}
                  disabled={deleteLoading === business.id}
                >
                  {deleteLoading === business.id ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-1" />
                  )}
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Are you sure you want to delete this service?
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the
              service and all associated data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                selectedBusinessId && handleDeleteBusiness(selectedBusinessId)
              }
              disabled={deleteLoading !== null}
            >
              {deleteLoading !== null ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Business Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
            <DialogDescription>
              Update your service information
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Service Name</Label>
                <Input
                  id="name"
                  {...register("name")}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount per hour ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  {...register("amount", { valueAsNumber: true })}
                  className={errors.amount ? "border-red-500" : ""}
                />
                {errors.amount && (
                  <p className="text-sm text-red-500">
                    {errors.amount.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    type="button"
                    onClick={() => handleCategorySelect(cat)}
                    variant={selectedCategory === cat ? "default" : "outline"}
                    size="sm"
                  >
                    {cat}
                  </Button>
                ))}
              </div>
              {errors.category && (
                <p className="text-sm text-red-500">
                  {errors.category.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                {...register("address")}
                className={errors.address ? "border-red-500" : ""}
              />
              {errors.address && (
                <p className="text-sm text-red-500">{errors.address.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="about">Description</Label>
              <Textarea
                id="about"
                {...register("about")}
                className={errors.about ? "border-red-500" : ""}
              />
              {errors.about && (
                <p className="text-sm text-red-500">{errors.about.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Images</Label>
              <div className="flex gap-4">
                {[...Array(4)].map((_, index) => (
                  <label
                    key={index}
                    htmlFor={`image-${index}`}
                    className="cursor-pointer"
                  >
                    <img
                      src={previewImages[index] || image}
                      alt={`Preview ${index + 1}`}
                      className="object-cover w-24 h-24 rounded-lg"
                    />
                    <input
                      type="file"
                      id={`image-${index}`}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageChange(index, e)}
                    />
                  </label>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updating}>
                {updating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" /> Save Changes
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageService;
