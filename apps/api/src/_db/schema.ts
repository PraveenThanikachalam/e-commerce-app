import { relations } from "drizzle-orm";
import {
  integer,
  pgTable,
  serial,
  text,
  jsonb,
  bigint,
} from "drizzle-orm/pg-core";

// Users Table
export const users = pgTable("users", {
  userId: serial("userId").primaryKey().unique().notNull(),
  role: text("role").notNull(),
  name: text("name").notNull().unique(),
  avatarUrl: text("avatarUrl"),
  email: text("email").notNull().unique(),
  mobileNumber: bigint({ mode: "number" }),
  provider: text("provider").notNull(),
});

// Wishlists Table (One Wishlist Belongs to One User)
export const wishlists = pgTable("wishlists", {
  wishlistId: serial("wishlistId").primaryKey(),
  userId: integer("userId")
    .notNull()
    .references(() => users.userId), // Reference to Users
});

// Products Table
export const products = pgTable("products", {
  productId: serial("productId").primaryKey(),
  productName: text("productName").notNull(),
  brand: text("brand").notNull(),
  price: text("price").notNull(),
  productDescription: jsonb("productDescription").notNull(),
  image_urls: jsonb("image_urls").notNull(),
});

export const homepage_contents = pgTable("homepage_contents", {
  id: serial("homepage_contents_id").primaryKey(),
  popular_categories: jsonb("popular_categories").notNull(),
  recent_deals: jsonb("recent_deals").notNull(),
  popular_products: jsonb("popular_products").notNull(),
  slides: jsonb("slides").notNull(),
  popular_with_men: jsonb("popular_with_men").notNull(),
  popular_with_women: jsonb("popular_with_women").notNull(),
});

// Junction Table: WishlistItems (To store products in a wishlist)
export const wishlist_items = pgTable("wishlist_items", {
  id: serial("id").primaryKey(),
  wishlistId: integer("wishlistId")
    .notNull()
    .references(() => wishlists.wishlistId), // Reference to Wishlists
  productId: integer("productId")
    .notNull()
    .references(() => products.productId), // Reference to Products
});

// User relations
export const user_relations = relations(users, ({ many }) => ({
  WishlistItems: many(wishlist_items),
  // this creates a relationship between Users and WishlistItems
}));

//Wishlist relations
export const wishlist_relations = relations(wishlists, ({ many }) => ({
  WishlistItems: many(wishlist_items),
  // this creates a relationship between Wishlists and WishlistItems
}));

//WishlistItems relations
export const wishlist_items_relations = relations(
  wishlist_items,
  ({ one }) => ({
    Wishlist: one(wishlists, {
      fields: [wishlist_items.wishlistId],
      references: [wishlists.wishlistId],
    }),
    // this creates a relationship between WishlistItems and Wishlists
    Product: one(products, {
      fields: [wishlist_items.productId],
      references: [products.productId],
    }),
    // this creates a relationship between WishlistItems and Products
  })
);
