import { NextFunction, Response, Request } from "express";;
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import {v4 as uuidv4} from "uuid"
import { ProductService } from "./product-service";
import { FileStorage } from "../common/types/storage";
import { UploadedFile } from "express-fileupload";

export class ProductController {
    constructor(
        private productService: ProductService,
        private storage: FileStorage
    ) {}

    create = async (req: Request, res: Response, next: NextFunction) => {
        const result = validationResult(req);

        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }

        const image = req.files!.image as UploadedFile
        const imageName = uuidv4()

        await this.storage.upload({
            filename: imageName,
            fileData: image.data
        })

        const {
            name,
            attributes,
            description,
            categoryId,
            priceConfiguration,
            tenantId,
            isPublished
        } = req.body;

        const product = {
            name,
            attributes: JSON.parse(attributes),
            description,
            categoryId,
            priceConfiguration: JSON.parse(priceConfiguration),
            tenantId,
            isPublished,
            image: imageName
        };

        const newProduct = await this.productService.createProduct(product);

        res.json({ id: newProduct._id });
    };
}
