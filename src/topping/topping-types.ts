import { UploadedFile } from "express-fileupload";
import mongoose from "mongoose";


export interface Topping {
    _id?: mongoose.Types.ObjectId,
    name: string,
    price: number,
    tenantId: number,
    image: UploadedFile | string
}

export interface ToppingRequestBody {
    name: string,
    price: number,
    tenantId: number
}


export enum ToppingEvents {
    TOPPING_CREATE = "TOPPING_CREATE",
    TOPPING_UPDATE = "TOPPING_UPDATE",
    TOPPING_DELETE = "TOPPING_DELETE",
}