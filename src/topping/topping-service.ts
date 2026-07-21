import { Topping } from "./topping-types";
import toppingModel from "./topping.model";

export class ToppingService {
    async create(topping:Topping){
        await toppingModel.create(topping)
    }
}