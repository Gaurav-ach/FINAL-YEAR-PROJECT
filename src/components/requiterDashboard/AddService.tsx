import { FormInput } from "../Form-Input";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { addBusinessFormData, addBusinessSchema } from "../../lib/validator";
import { Form } from "../ui/form";
import image from "../../assets/add-image.png";
import { useContext, useState } from "react";
import { Button } from "../ui/button";
import axios, { AxiosError } from "axios";
import { AppContext } from "../../context/AppContext";
import { toast } from "sonner";
import { Textarea } from "../ui/textarea";
import { businessDataResponse } from "../../lib/type";

const categories = [
  "Cleaning",
  "Repair",
  "Shifting",
  "Plumbing",
  "Painting",
  "Electric",
];

const AddRequiterService = () => {
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { backendUrl, requiterToken, setIsLoading } = useContext(AppContext);
  const form = useForm<addBusinessFormData>({
    resolver: zodResolver(addBusinessSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      category: "",
      address: "",
      about: "",
      images: [],
    },
  });

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    form.setValue("category", category, { shouldValidate: true });
  };

  const handleImageChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];

      // Generate previewImage
      const previewUrl = URL.createObjectURL(file);

      // Update the specific image preview based on the index
      setPreviewImages((prev) => {
        const newImages = [...prev];
        newImages[index] = previewUrl;
        return newImages;
      });

      // Set file for form validation (imageUrl expects an array of strings
      const currentFiles = form.getValues("images");
      currentFiles[index] = file;
      form.setValue("images", currentFiles, { shouldValidate: true });
    }
  };

  // Submit Handler
  const handleSubmit: SubmitHandler<addBusinessFormData> = async (
    businessData
  ) => {
    console.log("Form Submitted: ", businessData);
    try {
      setIsLoading(true);
      //creating new formdata
      const formData = new FormData();

      //append each formData
      formData.append("name", businessData.name);
      formData.append("category", businessData.category);
      formData.append("about", businessData.about);
      formData.append("address", businessData.address);

      if (Array.isArray(businessData.images)) {
        businessData.images.forEach((image) => {
          if (image instanceof File) {
            formData.append("images", image);
          }
        });
      }

      const { data } = await axios.post<businessDataResponse>(
        backendUrl + "/api/requiter/addBusiness",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: requiterToken,
          },
        }
      );

      if (data.success) {
        console.log(data);
        toast.success(data.message);
        form.reset({
          name: "",
          category: "",
          address: "",
          about: "",
          images: [],
        });
        setPreviewImages([]);
      } else toast.error(data.message);
    } catch (error) {
      //Error handling
      if (error instanceof AxiosError && error.response) {
        //400, 401 or 500 error
        toast.error(error.response.data.message);
      } else if (error instanceof Error) {
        //unexpected error
        toast.error(error.message || "An error occured while registering");
      } else {
        toast.error("Internal Server Error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="flex flex-col max-w-3xl gap-4 text-gray-700">
            <FormInput
              control={form.control}
              name="name"
              label="Business Title"
              placeholder="Add Business Title"
              type="text"
              required
            />
            <div>
              <label className="text-sm font-medium">
                Business Description
              </label>
              <Textarea
                {...form.register("about")}
                placeholder="Describe your business..."
                className="mt-2"
              />
            </div>

            <FormInput
              control={form.control}
              name="address"
              label="Address"
              placeholder="Enter Your address"
              type="text"
              required
            />

            <div className="flex w-full gap-5">
              <div className="flex-1">
                <div>
                  <label className="text-sm font-medium">
                    Business Category
                  </label>
                  <div className="flex flex-wrap gap-3 mt-2">
                    {categories.map((cat) => (
                      <Button
                        key={cat}
                        type="button"
                        onClick={() => handleCategorySelect(cat)}
                        className={`px-4 py-2 text-sm rounded-full transition-all ${
                          selectedCategory === cat
                            ? "bg-primary text-white"
                            : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                        }`}
                      >
                        {cat}
                      </Button>
                    ))}
                  </div>
                  {form.formState.errors.category?.message && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.category.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <label className="text-sm font-medium">Business Images</label>
            <div className="flex items-center gap-4">
              {[...Array(4)].map((_, index) => (
                <label key={index} htmlFor={`Image-${index}`}>
                  <img
                    src={previewImages[index] || image}
                    alt="image"
                    className="object-cover w-32 h-32 rounded-sm cursor-pointer"
                  />
                  <input
                    {...form.register(`images.${index}`)}
                    type="file"
                    id={`Image-${index}`}
                    hidden={true}
                    onChange={(e) => handleImageChange(index, e)}
                  />
                </label>
              ))}
            </div>
          </div>

          <Button type="submit" className="mt-5">
            Add Product
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default AddRequiterService;
