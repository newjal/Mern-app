import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import router from "./routes/AuthRouter.js";
import productRouter from "./routes/ProductRouter.js";

dotenv.config();

const dbConnect = async () => {
  mongoose
    .connect(process.env.AUTH_URL)
    .then(() => console.log("Connected to database"))
    .catch((err) => console.log(err));
};
await dbConnect();

const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(cors());
app.use("/auth", router);
app.use("/products", productRouter);

app.get("/", (req, res) => {
  res.send("helloo just ");
});

app.listen(9999, () => {
  console.log("listening to port 9999");
});
