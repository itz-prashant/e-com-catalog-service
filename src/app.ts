import express, { Request, Response } from "express";
import { globalErrorHandler } from "./common/middlewares/globalErrorHandler";
import categoryRouter from "./category/category-router";
import productRouter from "./product/product-router";
import toppingRouter from "./topping/topping-router";
import cookieParser from "cookie-parser"
import cors from "cors"
import config from "config"

const app = express();

app.use(
    cors({
        origin: config.get("frontend.ADMIN_DASHBOARD_BASE_URL"),
        credentials: true,
    }),
);

app.use(express.json())
app.use(cookieParser())

app.get("/", (req: Request, res: Response) => {
    res.json({message: "Hello from catalog service"});
});

app.use("/categories", categoryRouter)

app.use("/products", productRouter)

app.use("toppings", toppingRouter)

app.use(globalErrorHandler);

export default app;
