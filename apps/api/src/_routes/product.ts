import { Context } from "hono";
import { Hono, Next } from "hono";
import GetProducts from "../_controllers/Products/getProducts";
import CheckAdmin from "../_middlewares/checkAdmin";
import { verifyAuth } from "@hono/auth-js";
import AddProduct from "../_controllers/Products/addProducts";

const ProductRouter = new Hono();

ProductRouter.get("get-products", GetProducts);

// Add Product
ProductRouter.post("add-products", AddProduct);

export default ProductRouter;
