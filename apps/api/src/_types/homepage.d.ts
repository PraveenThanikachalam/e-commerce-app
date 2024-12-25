interface HomepageImages {
  image_url: string;
  image_alt: string;
}

interface HomepageContents {
  popular_categories: Array<{ name: string; url: string }>;
  recent_deals: HomepageImages;
  popular_products: Array<{ name: string; url: string }>;
  slides: Array<{ name: string; url: string }>;
  popular_with_men: Array<{ name: string; url: string }>;
  popular_with_women: Array<{ name: string; url: string }>;
}
