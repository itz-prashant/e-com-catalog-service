import { NextFunction, Response, Request } from "express";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { v4 as uuidv4 } from "uuid";
import { ProductService } from "./product-service";
import { FileStorage } from "../common/types/storage";
import { UploadedFile } from "express-fileupload";
import { AuthRequest } from "../category/category-types";
import { Roles } from "../common/constants";

export class ProductController {
    constructor(
        private productService: ProductService,
        private storage: FileStorage,
    ) {}

    create = async (req: Request, res: Response, next: NextFunction) => {
        const result = validationResult(req);

        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }

        const image = req.files!.image as UploadedFile;
        const imageName = uuidv4();

        await this.storage.upload({
            filename: imageName,
            fileData: image.data,
        });

        const {
            name,
            attributes,
            description,
            categoryId,
            priceConfiguration,
            tenantId,
            isPublished,
        } = req.body;

        const product = {
            name,
            attributes: JSON.parse(attributes),
            description,
            categoryId,
            priceConfiguration: JSON.parse(priceConfiguration),
            tenantId,
            isPublished,
            image: imageName,
        };

        const newProduct = await this.productService.createProduct(product);

        res.json({ id: newProduct._id });
    };

    update = async (req: Request, res: Response, next: NextFunction) => {
        const result = validationResult(req);

        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }

        const { productId } = req.params;

        const existProduct = await this.productService.getProductById(productId)

        if(!existProduct){
            return next(createHttpError(404, "Product not found"))
        }

     if((req as AuthRequest).auth.role !== Roles.ADMIN){
           const tenant = (req as AuthRequest).auth.tenant

        if(existProduct.tenantId !== tenant){
            return next(createHttpError(403, "You are not allowed to access this product"))
        }
     }

        let imageName: string | undefined
        let oldImage: string | undefined

        if (req.files?.image) {
            oldImage = existProduct.image

            const image = req.files.image as UploadedFile;
            imageName = uuidv4();

            await this.storage.upload({
                filename: imageName,
                fileData: image.data,
            });

            await this.storage.delete(oldImage)
        }

        const {
            name,
            attributes,
            description,
            categoryId,
            priceConfiguration,
            tenantId,
            isPublished,
        } = req.body;

        const product = {
            name,
            attributes: JSON.parse(attributes),
            description,
            categoryId,
            priceConfiguration: JSON.parse(priceConfiguration),
            tenantId,
            isPublished,
            image: imageName ? imageName : (oldImage as string),
        };

        await this.productService.updateProduct(productId, product)

        res.json({id: productId})
    };
}
