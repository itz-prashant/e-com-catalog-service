import { NextFunction, Response, Request } from "express";;
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { ProductService } from "./product-service";

export class ProductController {
    constructor(private productService: ProductService) {}

    create = async (req: Request, res: Response, next: NextFunction) => {
        const result = validationResult(req);

        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }

        const {
            name,
            attributes,
            description,
            categoryId,
            priceConfiguration,
            tenantId,
            image,
            isPublished
        } = req.body;

        const product = {
            name,
            attributes: JSON.parse(attributes),
            description,
            categoryId,
            priceConfiguration: JSON.parse(priceConfiguration),
            tenantId,
            image,
            isPublished
        };

        const newProduct = await this.productService.createProduct(product);

        res.json({ id: newProduct._id });
    };
}
