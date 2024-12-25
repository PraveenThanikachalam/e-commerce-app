import { Hono } from "hono";
import HomepageRouter from "./_routes/homepage";
import notFound from "./pages/404";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Praveen!");
});

app.route("/homepage", HomepageRouter);

app.notFound((c) => {
  return c.html(notFound);
});

export default {
  port: 8080,
  fetch: app.fetch,
};
