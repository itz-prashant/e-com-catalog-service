import express, { NextFunction, Request, Response } from "express";
import { CategoryController } from "./category-controller";
import categoryValidator from "./category-validator";
import { CategoryService } from "./caregory-service";
import logger from "../config/logger";
import { asyncWrapper } from "../common/utils/async-wrapper";
import authenticate from "../common/middlewares/authenticate";
import { canAccess } from "../common/middlewares/canAccess";
import { Roles } from "../common/constants";

const router = express.Router();

const categoryService = new CategoryService();
const categoryController = new CategoryController(categoryService, logger);

router.post(
    "/",
    authenticate,
    canAccess([Roles.ADMIN]),
    categoryValidator,
    asyncWrapper(
        (req: Request, res: Response, next: NextFunction) =>
            void categoryController.create(req, res, next),
    ),
);

router.get(
    "/",
    asyncWrapper((req, res) => categoryController.getAll(req, res)),
);

router.get(
    "/:categoryId",
    authenticate,
    canAccess([Roles.ADMIN]),
    asyncWrapper(
        (req: Request, res: Response, next: NextFunction) =>
            void categoryController.getOne(req, res, next),
    ),
);

export default router;
