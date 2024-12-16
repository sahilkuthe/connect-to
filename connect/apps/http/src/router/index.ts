import { Router } from "express";
import { userRouter } from "./user";
import { spaceRouter } from "./space";
import { adminRouter } from "./admin";

export const router = Router();

router.use("/user", userRouter);
router.use("/space", spaceRouter);
router.use("/admin", adminRouter);