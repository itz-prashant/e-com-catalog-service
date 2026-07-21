import { paginationLabels } from "../config/pagination";
import productModel from "./product-model";
import { Filter, PaginateQuery, Product } from "./product-types";

export class ProductService {

    async createProduct(product:Product){
        return await productModel.create(product) as Product
    }

    async updateProduct(productId:string,product:Product ){
        return await productModel.findOneAndUpdate(
            {_id: productId},
            {$set: product},
            {new: true}
        ) as Product
    }

    async getProductById(productId:string){
        return await productModel.findOne({_id: productId}) as Product
    }

    async getProducts(q:string, filters:Filter, paginateQuery:PaginateQuery){
        const searchQueryRegexp = new RegExp(q, "i")

        const matchQuery = {
            ...filters,
            name: searchQueryRegexp
        }

        const aggregate = productModel.aggregate([
            {
                $match: matchQuery
            },
            {
                $lookup:{
                    from: "categories",
                    localField: "categoryId",
                    foreignField: "_id",
                    as: "category",
                    pipeline:[
                        {
                            $project:{
                                _id:1,
                                name: 1,
                                attributes:1,
                                priceConfiguration:1
                            }
                        }
                    ]
                }
            },
            {
                $unwind: "$category"
            }
        ])

        return productModel.aggregatePaginate(aggregate, {...paginateQuery, customLabels: paginationLabels})

        // const result = await aggregate.exec()
        // return result as Product[]
    }

    async delete(productId:string){
        return await productModel.findByIdAndDelete(productId)
    }
}