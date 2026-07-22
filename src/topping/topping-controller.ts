import { NextFunction, Request, Response } from "express";
import { UploadedFile } from "express-fileupload";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { v4 as uuidv4 } from "uuid";
import { FileStorage } from "../common/types/storage";
import { ToppingService } from "./topping-service";
import { ToppingRequestBody } from "./topping-types";
import { AuthRequest } from "../category/category-types";
import { Roles } from "../common/constants";

export class ToppingController {
    constructor(
        private storage: FileStorage,
        private toppingService: ToppingService,
    ) {}
    create = async (req: Request, res: Response, next: NextFunction) => {
        const result = validationResult(req);

        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }

        const { name, price, tenantId } = req.body as ToppingRequestBody;

        const image = req.files!.image as UploadedFile;
        const fileUuid = uuidv4();

        await this.storage.upload({
            filename: fileUuid,
            fileData: image.data,
        });

        const savedTopping = await this.toppingService.create({
            name,
            price,
            tenantId,
            image,
        });

        res.json(savedTopping);
    };

    index = async (req: Request, res: Response) => {
        const { tenantId } = req.query;

        const toppings = await this.toppingService.getAll(Number(tenantId));

        const readyTopping = toppings.map((topping) => {
            return {
                id: topping._id,
                name: topping.name,
                price: topping.price,
                tenantId: topping.tenantId,
                image: this.storage.getObjectUri(topping.image as string),
            };
        });

        res.json(readyTopping);
    };

    update = async (req: Request, res: Response, next: NextFunction) => {
        const result = validationResult(req);

        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }
        const { toppingId } = req.params;

        const existTopping =
            await this.toppingService.getToppingById(toppingId);

        if (!existTopping) {
            return next(createHttpError(404, "Topping not found"));
        }

        if ((req as AuthRequest).auth.role !== Roles.ADMIN) {
            const tenant = (req as AuthRequest).auth.tenant;

            if (existTopping.tenantId !== tenant) {
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
            oldImage = existTopping.image as string;

            const image = req.files.image as UploadedFile;
            imageName = uuidv4();

            await this.storage.upload({
                filename: imageName,
                fileData: image.data,
            });

            await this.storage.delete(oldImage);
        }

        const { name, price, tenantId } = req.body;

        await this.toppingService.updateTopping(toppingId, {
            name,
            price,
            tenantId,
            image: imageName ? imageName : (oldImage as string),
        });

        res.json({ id: toppingId });
    };

    getOne = async (req: Request, res: Response, next:NextFunction) => {
        const { toppingId } = req.params;

        const topping = await this.toppingService.getToppingById(toppingId);

        if (!topping) {
            return next(createHttpError(404, "Topping not found"));
        }
        res.json(topping);
    };
}
