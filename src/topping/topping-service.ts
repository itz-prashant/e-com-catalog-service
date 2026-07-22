import { Topping } from "./topping-types";
import toppingModel from "./topping.model";

export class ToppingService {
    async create(topping: Topping) {
        await toppingModel.create(topping);
    }

    async getAll(tenantId: number) {
        return await toppingModel.find({ tenantId });
    }

    async getToppingById(toppingId: string) {
        return await toppingModel.findById({ _id: toppingId });
    }

    async updateTopping(toppingId: string, topping: Topping) {
        return await toppingModel.findByIdAndUpdate(
            { _id: toppingId },
            { $set: topping },
            { new: true },
        );
    }
}
