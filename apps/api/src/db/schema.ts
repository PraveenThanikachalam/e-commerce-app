import { integer, pgTable, serial, text, jsonb } from "drizzle-orm/pg-core";

export const Users = pgTable("user", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  avatar: text("avatarUrl"),
  email: text("email").notNull().unique(),
  mobileNumber: integer("mobileNumber"),
});

export const Products = pgTable("product", {
  id: serial("productId").primaryKey(),
  title: text("productName").notNull(),
  price: text("price").notNull(),
  description: jsonb("productDescription").notNull(),
  imageUrls: jsonb("image_urls").notNull(),
  wishList: integer("wishListId").references(() => Wishlists.id),
});

export const Wishlists = pgTable("wishlist", {
  id: serial("wishlistId").primaryKey(),
  userId: serial("userId").references(() => Users.id),
});
