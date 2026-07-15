import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import { AuthRequest } from "../../category/category-types";

export const canAccess = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const _req = req as AuthRequest;

        const roleFromToken = _req.auth.role;

        if (!roles.includes(roleFromToken)) {
            const error = createHttpError(
                403,
                "You don't have enough permission",
            );
            next(error);
            return;
        }
        next();
    };
};
