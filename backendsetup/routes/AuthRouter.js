import express from "express";
import {
  loginValidation,
  signupValidation,
} from "../middleware/AuthValidation.js";
import { login, signup } from "../controller/AuthController.js";

const router = express.Router();

router.post("/signup", signupValidation, signup);
router.post("/login", loginValidation, login);

export default router;
