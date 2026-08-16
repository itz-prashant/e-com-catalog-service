import express, { NextFunction, Request, Response } from "express";
import authenticate from "../common/middlewares/authenticate";
import { canAccess } from "../common/middlewares/canAccess";
import { Roles } from "../common/constants";
import { asyncWrapper } from "../common/utils/async-wrapper";
import { ToppingController } from "./topping-controller";
import createToppingValidator from "./create-topping-validator";
// import { S3Storage } from "../common/services/S3Storage"
import { ToppingService } from "./topping-service";
import updateProductValidator from "../product/update-product-validator";
import { StorageFactory } from "../common/services/StorageFactory";
import createHttpError from "http-errors";
import fileUpload from "express-fileupload";
import { createMessageProducerBroker } from "../common/services/brokerFactory";

const router = express.Router();

const toppingService = new ToppingService();
// const s3Storage = new S3Storage()
const storage = StorageFactory.create();
const broker = createMessageProducerBroker()
const toppingController = new ToppingController(storage, toppingService, broker);

router.post(
    "/",
    authenticate,
    canAccess([Roles.ADMIN, Roles.MANAGER]),
    fileUpload({
        limits: { fieldSize: 500 * 1024 },
        abortOnLimit: true,
        limitHandler: (req: Request, res: Response, next: NextFunction) => {
            const error = createHttpError(400, "File size exceeds the limit");
            next(error);
        },
    }),
    createToppingValidator ,
    asyncWrapper(toppingController.create),
);

router.get("/", asyncWrapper(toppingController.index));

router.put(
    "/:toppingId",
    authenticate,
    canAccess([Roles.ADMIN, Roles.MANAGER]),
    updateProductValidator,
    asyncWrapper(toppingController.update),
);

router.get("/:toppingId", asyncWrapper(toppingController.getOne));

router.delete(
    "/:toppingId",
    authenticate,
    canAccess([Roles.ADMIN, Roles.MANAGER]),
    asyncWrapper(toppingController.delete),
);

export default router;
