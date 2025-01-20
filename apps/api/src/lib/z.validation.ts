import { z } from "Zod";

const CredValidation = z.object({
  email: z.string(),
});

const AllObject = z.object({
  image_url: z.string().url(),
  image_alt: z.string(),
});

const HomepageContentValidation = z.object({
  popular_categories: z.array(AllObject),
  recent_deals: AllObject,
  popular_products: z.array(AllObject),
  slides: z.array(AllObject),
  popular_with_men: z.array(AllObject),
  popular_with_women: z.array(AllObject),
});

const UpdateUserVlidation = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  avatar: z.string().optional(),
  mobileNumber: z.number().optional(),
});

export { CredValidation, HomepageContentValidation, UpdateUserVlidation };
