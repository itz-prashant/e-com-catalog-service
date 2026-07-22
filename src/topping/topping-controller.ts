import { NextFunction, Request, Response } from "express";
import { UploadedFile } from "express-fileupload";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import {v4 as uuidv4} from "uuid"
import { FileStorage } from "../common/types/storage";
import { ToppingService } from "./topping-service";
import { ToppingRequestBody } from "./topping-types";

export class ToppingController {

    constructor(
        private storage: FileStorage,
        private toppingService: ToppingService
    ){}
    create = async(req:Request, res:Response, next:NextFunction)=>{
        
        const result = validationResult(req)

        if(!result.isEmpty()){
            return next(createHttpError(400, result.array()[0].msg as string))
        }

        const {name, price, tenantId} = req.body as ToppingRequestBody

        const image = req.files!.image as UploadedFile
        const fileUuid = uuidv4()

        await this.storage.upload({
            filename: fileUuid,
            fileData: image.data
        })

        const savedTopping = await this.toppingService.create({
            name, price,tenantId, image
        })

        res.json(savedTopping)
    }

    index = async (req:Request, res:Response)=>{

        const {tenantId} = req.query

        const toppings = await this.toppingService.getAll(Number(tenantId))

        const readyTopping = toppings.map((topping)=>{
            return {
                id: topping._id,
                name: topping.name,
                price: topping.price,
                tenantId: topping.tenantId,
                image: this.storage.getObjectUri(topping.image as string)
            }
        })

        res.json(readyTopping)
    }
}