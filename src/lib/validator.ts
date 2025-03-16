import { z } from "zod";

export type requiterFormData = z.infer<typeof requiterFormSchema>;
export type userFormData = z.infer<typeof userFormSchema>;
export type addBusinessFormData = z.infer<typeof addBusinessSchema>;
export type profileSchemaData = z.infer<typeof profileSchema>;

export const requiterFormSchema = z.object({
  firstName: z
    .string({ required_error: "first name is required" })
    .min(3, "Must be 3 or more characters long")
    .max(20, "Must be less than 20 characters")
    .optional(),
  lastName: z
    .string({ required_error: "first name is required" })
    .min(3, "Must be 3 or more characters long")
    .max(20, "Must be less than 20 characters")
    .optional(),
  email: z.string({ required_error: "Email is required" }),
  password: z
    .string({ required_error: "Password is required" })
    .min(3, "Must be 3 or more characters long")
    .max(20, "Must be less than 20 characters")
    .refine(
      (password) => /[A-Z]/.test(password),
      "Must contain one capital letter"
    )
    .refine(
      (password) => /[a-z]/.test(password),
      "Must contain one small letter"
    )
    .refine((password) => /[0-9]/.test(password), "Must contain one number")
    .refine(
      (password) => /[!@#$%^&*]/.test(password),
      "Must contain one special character"
    ),
  profile: z.any().optional(),
  contactNumber: z.string().optional(),
  role: z.enum(["REQUITER", "ADMIN"]).default("REQUITER"),
});

export const userFormSchema = z.object({
  firstName: z
    .string({ required_error: "first name is required" })
    .min(3, "Must be 3 or more characters long")
    .max(20, "Must be less than 20 characters")
    .optional(),
  lastName: z
    .string({ required_error: "first name is required" })
    .min(3, "Must be 3 or more characters long")
    .max(20, "Must be less than 20 characters")
    .optional(),
  email: z.string({ required_error: "Email is required" }),
  password: z
    .string({ required_error: "Password is required" })
    .min(3, "Must be 3 or more characters long")
    .max(20, "Must be less than 20 characters")
    .refine(
      (password) => /[A-Z]/.test(password),
      "Must contain one capital letter"
    )
    .refine(
      (password) => /[a-z]/.test(password),
      "Must contain one small letter"
    )
    .refine((password) => /[0-9]/.test(password), "Must contain one number")
    .refine(
      (password) => /[!@#$%^&*]/.test(password),
      "Must contain one special character"
    ),
  profile: z.any().optional(),
});

export const addBusinessSchema = z.object({
  name: z.string().min(1, "Product Name is required"),
  category: z.string().min(1, "Please select a category"),
  about: z.string().min(1, "Description is required"),
  address: z.string().min(1, "address is required"),
  images: z.any(),
});

// Define validation schema using Zod
export const profileSchema = z
  .object({
    firstName: z
      .string({ required_error: "first name is required" })
      .min(3, "Must be 3 or more characters long")
      .max(20, "Must be less than 20 characters")
      .optional()
      .or(z.literal("")),

    lastName: z
      .string({ required_error: "first name is required" })
      .min(3, "Must be 3 or more characters long")
      .max(20, "Must be less than 20 characters")
      .optional()
      .or(z.literal("")),

    oldPassword: z.string().optional(),
    newPassword: z.string().optional(),
    profileImage: z.any().optional().nullable(),
  })
  .refine(
    (data) => {
      // Require both passwords if either is provided
      if (data.oldPassword || data.newPassword) {
        return !!data.oldPassword && !!data.newPassword;
      }
      return true;
    },
    {
      message:
        "Both old and new passwords are required to change your password",
      path: ["newPassword"],
    }
  )
  .refine(
    (data) => {
      if (data.newPassword) {
        return /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*]).{3,20}$/.test(
          data.newPassword
        );
      }
      return true;
    },
    {
      message:
        "Password must include uppercase, lowercase, number, and special character",
      path: ["newPassword"],
    }
  )
  .refine(
    (data) => {
      if (data.newPassword === data.oldPassword) {
        return false;
      }
      return true;
    },
    {
      message: "New Password and old password cannot be same",
      path: ["newPassword"],
    }
  )
  .refine(
    (data) => {
      if (data.firstName === "" && data.lastName === "") {
        return false;
      }
      return true;
    },
    {
      message: "At least one name field must be provided",
      path: ["firstName"],
    }
  );
