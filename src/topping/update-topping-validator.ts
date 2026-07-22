import { body } from "express-validator";

export default [
    body("name")
        .exists()
        .withMessage("Topping name is required")
        .isString()
        .withMessage("Topping name should be string"),
    body("price")
        .exists()
        .withMessage("Price is required")
        .isLuhnNumber()
        .withMessage("Price should be number"),
    body("tenantId")
        .exists()
        .withMessage("Tenant id is required")       
]