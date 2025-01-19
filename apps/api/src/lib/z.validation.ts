import { z } from "Zod";

const CredValidation = z.object({
  email: z.string().email(),
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

export { CredValidation, HomepageContentValidation };
