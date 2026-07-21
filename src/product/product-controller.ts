import { NextFunction, Response, Request } from "express";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { v4 as uuidv4 } from "uuid";
import { ProductService } from "./product-service";
import { FileStorage } from "../common/types/storage";
import { UploadedFile } from "express-fileupload";
import { AuthRequest } from "../category/category-types";
import { Roles } from "../common/constants";
import { Filter, Product } from "./product-types";
import mongoose from "mongoose";

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

        const existProduct =
            await this.productService.getProductById(productId);

        if (!existProduct) {
            return next(createHttpError(404, "Product not found"));
        }

        if ((req as AuthRequest).auth.role !== Roles.ADMIN) {
            const tenant = (req as AuthRequest).auth.tenant;

            if (existProduct.tenantId !== tenant) {
                return next(
                    createHttpError(
                        403,
                        "You are not allowed to access this product",
                    ),
                );
            }
        }

        let imageName: string | undefined;
        let oldImage: string | undefined;

        if (req.files?.image) {
            oldImage = existProduct.image;

            const image = req.files.image as UploadedFile;
            imageName = uuidv4();

            await this.storage.upload({
                filename: imageName,
                fileData: image.data,
            });

            await this.storage.delete(oldImage);
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

        await this.productService.updateProduct(productId, product);

        res.json({ id: productId });
    };

    index = async (req: Request, res: Response) => {
        const { q, tenantId, categoryId, isPublished } = req.query;

        const filters: Filter = {};

        if (isPublished === "true") {
            filters.isPublished = true;
        }

        if (tenantId) filters.tenantId = Number(tenantId);

        if (
            categoryId &&
            mongoose.Types.ObjectId.isValid(categoryId as string)
        ) {
            filters.categoryId = new mongoose.Types.ObjectId(
                categoryId as string,
            );
        }

        const products = await this.productService.getProducts(
            q as string,
            filters,
            {
                page: req.query.page ? Number(req.query.page) : 1,
                limit: req.query.limit ? Number(req.query.limit) : 10,
            },
        );

        const finalProduct = (products.data as Product[]).map((product: Product) => {
            return {
                ...product,
                // TODO : uncomment when s3 bucket setup
                // image: this.storage.getObjectUri(product.image),
            };
        });

        res.json({
            data: finalProduct,
            total: products.total,
            pageSize: products.pageSize,
            currentPage: products.currentPage,
        });
    };

    getone = async (req:Request, res:Response, next:NextFunction)=>{
        const {productId} = req.params

        const product = await this.productService.getProductById(productId)

        if(!product){
            return next(createHttpError(404, "Product not found"));
        }

        res.json(product)
    }

    delete = async(req:Request, res:Response)=>{
        const {productId} = req.params

        await this.productService.delete(productId)

        res.json({_id: productId})
    }
}
