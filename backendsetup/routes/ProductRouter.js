import express from "express";
import { ensureAuthenticated } from "../middleware/Auth.js";

const productRouter = express.Router();

productRouter.get("/", ensureAuthenticated, (req, res) => {
  res.status(200).json([
    {
      name: "abcd",
      price: 101,
    },
    {
      name: "asus",
      price: 205,
    },
    {
      name: "helloworld",
      price: 420,
    },
  ]);
}); 

export default productRouter;