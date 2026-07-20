import mongoose from "mongoose";

export interface AttributeValue {
  name: string;
  value: any;
}

export interface ProductPriceConfiguration {
  [key: string]: {
    priceType: "base" | "additional";
    availableOptions: {
      [option: string]: number;
    };
  };
}

export interface Product {
    name: string;
    description: string;
    priceConfiguration: ProductPriceConfiguration;
    attributes: AttributeValue[];
    tenantId: number;
    categoryId: string;
    image: string;
}

export interface Filter {
  tenantId?: number
  categoryId?: mongoose.Types.ObjectId
  isPublished?: boolean
}