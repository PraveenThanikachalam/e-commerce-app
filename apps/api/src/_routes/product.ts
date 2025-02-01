import { Hono } from "hono";
import GetProducts from "../_controllers/Products/getProducts";
import CheckAdmin from "../_middlewares/checkAdmin";
import { verifyAuth } from "@hono/auth-js";
import AddProduct from "../_controllers/Products/addProducts";

const ProductRouter = new Hono();

// Get Products
ProductRouter.get("get-products", GetProducts);

// Add Product
ProductRouter.post("add-products", verifyAuth(), CheckAdmin, AddProduct);

export default ProductRouter;
