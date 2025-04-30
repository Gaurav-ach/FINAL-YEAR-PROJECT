import React from "react";

import { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { Edit, Save, Settings } from "lucide-react";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { useForm } from "react-hook-form";
import {
  userProfileSchema,
  type userProfileSchemaData,
} from "../lib/validator";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";

const UserProfile = () => {
  const { userData, isLoading, backendUrl, userToken, setUserData } =
    useContext(AppContext);

  // State variables to manage input and editing mode
  const [isEditing, setIsEditing] = useState({
    name: false,
    password: false,
  });

  const {
    register,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<userProfileSchemaData>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      firstName: userData?.firstName || "",
      lastName: userData?.lastName || "",
      oldPassword: "",
      newPassword: "",
      userProfileImage: "",
    },
    mode: "onChange",
  });

  // Update form values when userData changes
  useEffect(() => {
    if (userData) {
      setValue("firstName", userData.firstName || "");
      setValue("lastName", userData.lastName || "");
    }
  }, [userData, setValue]);

  // Handle name update
  const updateName = async () => {
    try {
      const values = getValues();
      const formData = new FormData();

      formData.append("firstName", values.firstName || "");
      formData.append("lastName", values.lastName || "");

      console.log("Name update data:");
      for (const pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }

      const { data } = await axios.put(
        `${backendUrl}/api/user/updateUserProfile`,
        formData,
        {
          headers: {
            Authorization: userToken,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (data.success) {
        toast.success(data.message);
        setUserData(data.user);
        setIsEditing((prev) => ({ ...prev, name: false }));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      handleError(error);
    }
  };

  // Handle password update
  const updatePassword = async () => {
    try {
      const values = getValues();
      const formData = new FormData();

      formData.append("oldPassword", values.oldPassword || "");
      formData.append("newPassword", values.newPassword || "");

      console.log("Password update data:");
      for (const pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }

      const { data } = await axios.put(
        `${backendUrl}/api/user/updateUserProfile`,
        formData,
        {
          headers: {
            Authorization: userToken,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (data.success) {
        toast.success(data.message);
        setUserData(data.user);
        setIsEditing((prev) => ({ ...prev, password: false }));
        reset({ oldPassword: "", newPassword: "" });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      handleError(error);
    }
  };

  // Handle profile image update
  const updateProfileImage = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("userProfileImage", file);

      const { data } = await axios.put(
        `${backendUrl}/api/user/updateUserProfile`,
        formData,
        {
          headers: {
            Authorization: userToken,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (data.success) {
        toast.success(data.message);
        setUserData(data.user);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      handleError(error);
    }
  };

  // Handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      updateProfileImage(e.target.files[0]);
    }
  };

  // Error handler
  const handleError = (error: unknown) => {
    if (error instanceof AxiosError && error.response?.data) {
      toast.error(error.response.data.message);
    } else if (error instanceof Error) {
      toast.error(error.message || "Error while updating data");
    } else {
      toast.error("Something went wrong");
    }
  };

  const handleDelete = async () => {
    try {
      if (window.confirm("Are you sure you want to delete this Account?")) {
        const { data } = await axios.delete(
          `${backendUrl}/api/user/deleteUserData`,
          {
            headers: {
              Authorization: userToken,
            },
          }
        );

        if (data.success) {
          toast.success(data.message);
          window.location.reload();
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      handleError(error);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="w-full min-h-screen">
      <div className="flex flex-col justify-center px-6 py-16 space-y-6 md:mx-16">
        <div className="relative w-32 h-32">
          <label htmlFor="image">
            <img
              src={
                userData?.userProfileImage ||
                "/placeholder.svg?height=128&width=128"
              }
              alt="profile"
              className="object-cover w-full h-full border rounded-full cursor-pointer"
            />
            <Input
              id="image"
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0"
              onChange={handleFileChange}
            />
          </label>
        </div>

        <div className="max-w-screen-lg space-y-8">
          <h2 className="flex items-center gap-2 text-xl font-semibold md:text-3xl">
            <Settings className="w-6 h-6 md:w-10 md:h-10" />
            Account Settings
          </h2>

          <div className="items-center justify-between w-full pb-6 border-b md:flex">
            <Label className="text-lg min-w-max">Email</Label>
            <div className="flex items-center w-full max-w-md gap-6 mt-2">
              <Input
                className="w-full"
                placeholder={userData?.email}
                disabled
              />
              <div className="w-[110px]"></div>
            </div>
          </div>

          {/* full name Section */}
          <div className="items-center justify-between w-full pb-6 border-b md:flex">
            <Label className="text-lg min-w-max">Full Name</Label>
            <div className="flex items-center w-full max-w-md gap-6 mt-2">
              {isEditing.name ? (
                <>
                  <div className="flex gap-2">
                    <div className="w-full">
                      <Input
                        type="text"
                        className="w-full"
                        {...register("firstName")}
                      />
                      {errors.firstName && (
                        <p className="text-red-500">
                          {errors.firstName.message}
                        </p>
                      )}
                    </div>
                    <div className="w-full">
                      <Input
                        type="text"
                        className="w-full"
                        {...register("lastName")}
                      />
                      {errors.lastName && (
                        <p className="text-red-500">
                          {errors.lastName.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button type="button" onClick={updateName}>
                    <Save /> Save
                  </Button>
                </>
              ) : (
                <>
                  <Input
                    className="w-full"
                    placeholder={`${userData?.firstName || ""} ${
                      userData?.lastName || ""
                    }`}
                    disabled
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing((prev) => ({ ...prev, name: true }));
                    }}
                  >
                    <Edit /> Edit
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Password Section */}
          <div className="items-center justify-between w-full pb-6 border-b md:flex">
            <Label className="text-lg min-w-max">Password</Label>
            <div className="flex items-center w-full max-w-md gap-6 mt-2">
              {isEditing.password ? (
                <>
                  <div className="flex flex-col w-full">
                    <div className="w-full">
                      <Input
                        type="password"
                        className="w-full"
                        placeholder="Current password"
                        {...register("oldPassword")}
                      />
                      {errors.oldPassword && (
                        <p className="text-red-500">
                          {errors.oldPassword.message}
                        </p>
                      )}
                    </div>
                    <div className="w-full mt-2">
                      <Input
                        type="password"
                        className="w-full"
                        placeholder="New password"
                        {...register("newPassword")}
                      />
                      {errors.newPassword && (
                        <p className="text-red-500">
                          {errors.newPassword.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button type="button" onClick={updatePassword}>
                    <Save /> Save
                  </Button>
                </>
              ) : (
                <>
                  <Input
                    className="w-full"
                    placeholder="***********"
                    disabled
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing((prev) => ({ ...prev, password: true }));
                      reset({ oldPassword: "", newPassword: "" });
                    }}
                  >
                    <Edit /> Edit
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="items-center justify-between w-full py-6 border-b md:flex">
            <div className="flex flex-col ">
              <h2 className="text-lg min-w-max">Delete Account</h2>
              <p className="max-w-xs text-xs">
                Please note: This action cannot be undone and will permanently
                delete your account.
              </p>
            </div>
            <div className="flex items-center w-full max-w-md gap-6">
              <Button
                onClick={handleDelete}
                className="mt-2"
                variant={"destructive"}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
