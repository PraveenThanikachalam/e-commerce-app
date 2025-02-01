import { uuid } from "drizzle-orm/pg-core";
import z from "zod";

// Validation for Credentials
const CredValidation = z.object({
  email: z.string(),
  userName: z.string(),
});

// Validation for Create User
const CreateUserValidation = z.object({
  name: z.string(),
  email: z.string().email(),
  avatarUrl: z.string(),
  userId: z.string().uuid(),
  role: z.string(),
  provider: z.string(),
  mobileNumber: z.number(),
});

const DescriptionObject = z.object({
  desp1: z.string(),
  desp2: z.string(),
  desp3: z.string(),
});

const ImageObject = z.object({
  image_url: z.string().url(),
  image_alt: z.string(),
});

// Validation for Homepage Contents
const HomepageContentValidation = z.object({
  popular_categories: z.array(ImageObject),
  recent_deals: ImageObject,
  popular_products: z.array(ImageObject),
  slides: z.array(ImageObject),
  popular_with_men: z.array(ImageObject),
  popular_with_women: z.array(ImageObject),
});

// Validation for Update User
const UpdateUserVlidation = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  avatarUrl: z.string().optional(),
  mobileNumber: z.number(),
});

// Validation for Add Product
const AddProductValidation = z.object({
  title: z.string(),
  brand: z.string(),
  price: z.string(),
  description: z.array(DescriptionObject),
  imageUrls: z.array(ImageObject),
});

export {
  CredValidation,
  HomepageContentValidation,
  UpdateUserVlidation,
  CreateUserValidation,
  AddProductValidation,
};
