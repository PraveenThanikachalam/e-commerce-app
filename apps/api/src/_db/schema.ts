import { relations } from "drizzle-orm";
import {
  integer,
  pgTable,
  serial,
  text,
  jsonb,
  bigint,
  primaryKey,
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

// WishLists Table
export const wishlists = pgTable("wishlists", {
  wishlistId: serial("wishlistId").primaryKey().unique().notNull(),
  wishlistName: text("wishlistName").default("Your wishlist"),
  userId: integer("userId")
    .notNull()
    .references(() => users.userId, { onDelete: "cascade" })
    .unique(),
});

// User relations
export const userRelations = relations(users, ({ one }) => ({
  wishList: one(wishlists),
}));

// Wishlists relations
export const wishlistRelations = relations(wishlists, ({ one }) => ({
  user: one(users, {
    fields: [wishlists.userId],
    references: [users.userId],
  }),
}));

// Wishlist items
export const wishlistItems = pgTable(
  "wishlistItems",
  {
    wishlistId: integer("wishlistId")
      .notNull()
      .references(() => wishlists.wishlistId, { onDelete: "cascade" }),
    productId: integer("productId")
      .notNull()
      .references(() => products.productId, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.productId, t.wishlistId] }),
  })
);

// Wishlist items relations
export const wishlistItemRelations = relations(wishlistItems, ({ one }) => ({
  wishlist: one(wishlists, {
    fields: [wishlistItems.wishlistId],
    references: [wishlists.wishlistId],
  }),
  product: one(products, {
    fields: [wishlistItems.productId],
    references: [products.productId],
  }),
}));

// Products Table
export const products = pgTable("products", {
  productId: serial("productId").primaryKey(),
  productName: text("productName").notNull(),
  brand: text("brand").notNull(),
  price: text("price").notNull(),
  productDescription: jsonb("productDescription").notNull(),
  image_urls: jsonb("image_urls").notNull(),
});

// Homepage contents table
export const homepage_contents = pgTable("homepage_contents", {
  id: serial("homepage_contents_id").primaryKey(),
  popular_categories: jsonb("popular_categories").notNull(),
  recent_deals: jsonb("recent_deals").notNull(),
  popular_products: jsonb("popular_products").notNull(),
  slides: jsonb("slides").notNull(),
  popular_with_men: jsonb("popular_with_men").notNull(),
  popular_with_women: jsonb("popular_with_women").notNull(),
});
