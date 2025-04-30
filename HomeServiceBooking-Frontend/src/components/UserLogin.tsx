import { EyeIcon, EyeOff, LockIcon, MailIcon, UserPen, X } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import image from "../assets/upload.png";
import { userFormData, userFormSchema } from "../lib/validator";
import { AppContext } from "../context/AppContext";
import axios, { AxiosError } from "axios";
import { loginForm, userLoginResponse } from "../lib/type";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const UserLogin = () => {
  const [state, setState] = useState<string>("Login");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [formValues, setFormValues] = useState<userFormData | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isTextDataSubmitted, setIsTextDataSubmitted] =
    useState<boolean>(false);
  const navigate = useNavigate();

  const {
    setShowUserLogin,
    backendUrl,
    setUserData,
    setUserToken,
    isLoading,
    setIsLoading,
  } = useContext(AppContext);

  const {
    register,
    formState: { errors },
    handleSubmit,
    setValue,
    setError,
  } = useForm<userFormData>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      profile: "",
    },
    resolver: zodResolver(userFormSchema),
    shouldUnregister: true,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];

      //set file for form validation
      setValue("profile", file, { shouldValidate: true });

      //Generate previewUrl
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);
    }
  };

  const onSubmit: SubmitHandler<userFormData> = async (formData) => {
    console.log("Form Data Before Processing:", { state, formData });
    if (state === "Sign up" && !isTextDataSubmitted) {
      setIsTextDataSubmitted(true);
      setFormValues(formData);
      return;
    }

    if (state === "Sign up" && isTextDataSubmitted) {
      if (!formData.profile || formData.profile.length === 0) {
        setError("profile", { message: "Profile is required" });
        return;
      }

      if (formData.profile.size > 5000000) {
        setError("profile", { message: "File size must be less than 5MB" });
        return;
      }

      console.log("Uploaded File:", formData.profile);

      //creating new formdata
      const forms = new FormData();
      forms.append("firstName", formData.firstName || "");
      forms.append("lastName", formData.lastName || "");
      forms.append("email", formData.email || "");
      forms.append("password", formData.password || "");
      forms.append("profile", formData.profile);

      try {
        setIsLoading(true);
        const { data } = await axios.post<userLoginResponse>(
          backendUrl + "/api/user/register-user",
          forms,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (data.success) {
          console.log(data);
          setUserData(data.user);
          setUserToken(data.token);
          localStorage.setItem("userToken", data.token);
          setShowUserLogin(false);
          navigate("/");
          toast.success(data.message);
          setIsLoading(false);
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        // error handling
        if (error instanceof AxiosError && error.response) {
          //400, 401 and 500 error
          toast.error(error.response.data.message);
        } else if (error instanceof Error) {
          //unexpected errors
          toast.error(error.message || "An error occured while registering");
        } else {
          toast.error("Something went wrong");
        }
      }
    } else if (state === "Login") {
      try {
        const loginPayload: loginForm = {
          email: formData.email,
          password: formData.password,
        };

        const { data } = await axios.post<userLoginResponse>(
          backendUrl + "/api/user/login-user",
          loginPayload
        );

        if (data.success) {
          console.log(data);
          setUserData(data.user);
          setUserToken(data.token);
          localStorage.setItem("userToken", data.token);
          setShowUserLogin(false);
          navigate("/");
          toast.success(data.message);
          setIsLoading(false);
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        // error handling
        if (error instanceof AxiosError && error.response) {
          //400, 401 and 500 error
          toast.error(error.response.data.message);
        } else if (error instanceof Error) {
          //unexpected errors
          toast.error(error.message || "An error occured while loging in");
        } else {
          toast.error("Something went wrong");
        }
      }
    }
  };

  //store the data after going nextpage for logo upload
  useEffect(() => {
    if (isTextDataSubmitted && formValues) {
      setValue("firstName", formValues.firstName);
      setValue("lastName", formValues.lastName);
      setValue("profile", formValues.profile);
      setValue("email", formValues.email);
      setValue("password", formValues.password);
    }
  }, [isTextDataSubmitted, formValues, setValue]);

  //prevent scrolling when popup model is open
  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div className="absolute top-0 bottom-0 left-0 right-0 z-10 flex items-center justify-center backdrop-blur-sm bg-black/30">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="relative p-10 bg-white rounded-xl text-slate-500"
      >
        <h1 className="text-2xl font-medium text-center text-neutral-700">
          User {state}
        </h1>
        {state === "Sign up" ? (
          <p className="text-sm text-center">
            Welcome! Please sign up to create your account.
          </p>
        ) : (
          <p className="text-sm text-center">
            Welcome back! Please sign in to continue.
          </p>
        )}

        {state === "Sign up" && isTextDataSubmitted ? (
          <>
            {/* extra form to uploading company icon while creating account */}
            <div className="flex flex-col my-10">
              <div className="flex items-center gap-4">
                <label htmlFor="image">
                  <img
                    src={previewImage || image}
                    alt="image"
                    className="w-16 h-16 rounded-full"
                  />
                  <input
                    type="file"
                    id="image"
                    hidden={true}
                    onChange={handleFileChange}
                  />
                </label>
                <p>
                  Upload Profile <br /> Picture
                </p>
              </div>

              {errors.profile && typeof errors.profile.message === "string" && (
                <p className="text-xs text-red-500">{errors.profile.message}</p>
              )}
            </div>
          </>
        ) : (
          <>
            {/* normal form for both  */}
            {state !== "Login" && (
              <div>
                <div className="flex gap-2">
                  <div>
                    <div className="relative mt-5">
                      <UserPen className="absolute w-5 h-5 top-1/4 left-3" />
                      <Input
                        {...(state === "Sign up" ? register("firstName") : {})}
                        placeholder="first name"
                        type="text"
                        required
                        className={`pl-10 rounded-full ${
                          errors.firstName &&
                          "border-red-500 focus-visible:ring-red-500"
                        }`}
                      />
                    </div>
                    {errors.firstName && (
                      <p className="text-xs text-red-500">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <div className="relative mt-5">
                      <UserPen className="absolute w-5 h-5 top-1/4 left-3" />
                      <Input
                        {...(state === "Sign up" ? register("lastName") : {})}
                        placeholder="last name"
                        required
                        type="text"
                        className={`pl-10 rounded-full ${
                          errors.lastName &&
                          "border-red-500 focus-visible:ring-red-500"
                        }`}
                      />
                    </div>
                    {errors.lastName && (
                      <p className="text-xs text-red-500">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
            <div>
              <div className="relative mt-5">
                <MailIcon className="absolute w-5 h-5 top-1/4 left-3" />
                <Input
                  {...register("email")}
                  placeholder="Email"
                  type="text"
                  className={`pl-10 rounded-full ${
                    errors.email && "border-red-500 focus-visible:ring-red-500"
                  }`}
                  required
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>
            <div>
              <div className="relative mt-5">
                <LockIcon className="absolute w-5 h-5 top-1/4 left-3" />
                <Input
                  {...register("password")}
                  placeholder="Password"
                  type={showPassword ? "text" : "password"}
                  className={`pl-10 rounded-full ${
                    errors.password &&
                    "border-red-500 focus-visible:ring-red-500"
                  }`}
                  required
                />
                {/* state to show and hide password */}
                {showPassword ? (
                  <EyeIcon
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute w-5 h-5 cursor-pointer top-1/4 right-3"
                  />
                ) : (
                  <EyeOff
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute w-5 h-5 cursor-pointer top-1/4 right-3"
                  />
                )}
              </div>
              {errors.password && (
                <p className="text-xs text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>
          </>
        )}
        {state === "Login" && (
          <p className="mt-4 text-sm text-blue-600 cursor-pointer">
            Forgot Password?
          </p>
        )}
        {/* button state ternery operator */}
        <Button
          type="submit"
          className="w-full mt-4 rounded-full"
          onClick={() => console.log("button clicked state: ", state)}
          disabled={isLoading}
        >
          {state === "Login"
            ? "Login"
            : isTextDataSubmitted
            ? isLoading
              ? "Loading..."
              : "Create Account"
            : "Next"}
        </Button>
        {/* changing state by login or sign up  */}
        {state === "Login" ? (
          <p className="mt-5 text-center">
            Don't have an account?{" "}
            <span
              onClick={() => setState("Sign up")}
              className="text-blue-600 cursor-pointer"
            >
              Signup
            </span>
          </p>
        ) : (
          <p className="mt-5 text-center">
            Already have an account?{" "}
            <span
              onClick={() => setState("Login")}
              className="text-blue-600 cursor-pointer"
            >
              Login
            </span>
          </p>
        )}
        <X
          onClick={() => setShowUserLogin(false)}
          size={25}
          className="absolute cursor-pointer top-5 right-5"
        />
      </form>
    </div>
  );
};

export default UserLogin;
