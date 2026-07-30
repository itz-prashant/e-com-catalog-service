import * as fs from "node:fs/promises";
import path from "node:path";
import config from "config";
import { FileData, FileStorage } from "../types/storage";
import logger from "../../config/logger";

export class LocalStorage implements FileStorage {
    private uploadDir: string;

    constructor() {
        this.uploadDir = path.join(process.cwd(), "uploads");
    }

    async upload(data: FileData): Promise<void> {
        await fs.mkdir(this.uploadDir, { recursive: true });

        const filePath = path.join(this.uploadDir, data.filename);

        await fs.writeFile(filePath, data.fileData as Uint8Array);
    }

    async delete(filename: string): Promise<void> {
        const filePath = path.join(this.uploadDir, filename);

        try {
            await fs.unlink(filePath);
        } catch (error) {
            logger.error("File already deleted or not found", error);
        }
    }

    getObjectUri(filename: string): string {
        const host = config.get<string>("server.host");
        const port = config.get<number>("server.port");

        return `http://${host}:${port}/uploads/${filename}`;
    }
}
