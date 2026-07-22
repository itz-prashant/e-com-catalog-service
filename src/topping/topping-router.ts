import express from "express"
import authenticate from "../common/middlewares/authenticate"
import { canAccess } from "../common/middlewares/canAccess"
import { Roles } from "../common/constants"
import { asyncWrapper } from "../common/utils/async-wrapper"
import { ToppingController } from "./topping-controller"
import createToppingValidator from "./create-topping-validator"
import { S3Storage } from "../common/services/S3Storage"
import { ToppingService } from "./topping-service"
import updateProductValidator from "../product/update-product-validator"

const router = express.Router()

const toppingService = new ToppingService()
const s3Storage = new S3Storage()
const toppingController = new ToppingController(s3Storage, toppingService)

router.post("/", authenticate, createToppingValidator ,canAccess([Roles.ADMIN, Roles.MANAGER]), asyncWrapper(toppingController.create))

router.get("/", asyncWrapper(toppingController.index))

router.put("/:toppingId", authenticate, canAccess([Roles.ADMIN, Roles.MANAGER]),updateProductValidator ,asyncWrapper(toppingController.update))

router.get("/:toppingId", asyncWrapper(toppingController.getOne))

export default router