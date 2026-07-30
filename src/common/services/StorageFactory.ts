import config from "config";
import { FileStorage } from "../types/storage";
import { S3Storage } from "./S3Storage";
import { LocalStorage } from "./LocalStorage";

export class StorageFactory {
    static create(): FileStorage {
        const driver = config.get<string>("storage.driver");

        switch (driver) {
            case "local":
                return new LocalStorage();
                throw new Error("LocalStorage not implemented");

            case "s3":
            default:
                return new S3Storage();
        }
    }
}