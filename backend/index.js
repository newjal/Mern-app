import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import UserModel from "./model/User.js";
import petModel from "./model/Pet.js";
import carModel from "./model/Car.js";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
import { createTokens, validateToken } from "./Jwt.js";


const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser())

dotenv.config();

const dbConnect = () => {
  mongoose
    .connect(process.env.MONGO_URL)
    .then(() => console.log("connected to db"))
    .catch((err) => console.log(err));
};

await dbConnect();

app.get("/", (req, res) => {
  res.send("hello and have a good day");
});

app.listen(6010, () => {
  console.log("listening to port 6010");
});

app.post("/register", async (req, res) => {
  try {
    const { name, username, password } = req.body;

    // Check if the user already exists before proceeding
    const userExists = await UserModel.findOne({ username });
    if (userExists) {
      return res.status(400).send("User already exists");
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save new user
    const newUser = new UserModel({
      name,
      username,
      password: hashedPassword, // Save hashed password
    });

    await newUser.save();

    // Send success response
    res.json({ message: "User registered successfully" });
  } catch (err) {
    // Handle errors properly
    res.status(400).json({ error: err.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await UserModel.findOne({ username });
    if (!user) {
      res.send({ message: "user does not exits" });
      return;
    }
    // if (password !== user.password) {
    //   return res.json({ message: "Invalid crendentials" });
    // }
    const dbPassword = user.password;
    bcrypt.compare(password, dbPassword).then((match) => {
      if (!match) {
        return res.status(400).json({
          message: "Wrong Username and Password Combination",
        });
      }

      const accessToken = createTokens(user)
      res.cookie("access-Token",accessToken, {
        maxAge: 60*60*24*30*1000,
        httpOnly: true
      }  )

      res.json({ msg: "login success" });
    });

    
  } catch (err) {
    res.json({ msg: "login failed" });
  }
});

app.get("/profile", validateToken, (req,res) => {
  res.json("Profile")
})

app.post("/register-pet", async (req, res) => {
  try {
    const { name, type, breed, age, gender } = req.body;

    const petExits = await petModel.findOne({ age });
    if (petExits) {
      res.send("pet already exists");
      return;
    }
    const newPet = await petModel.create({ name, type, breed, age, gender });
    await newPet.save();
    res.json({ message: "pet registered sucessfully" });
  } catch (err) {
    console.log(err);
  }
});

app.post("/register-car", async (req, res) => {
  try {
    const { make, model, year } = req.body;
    const carExits = await carModel.findOne({ model });
    if (carExits) {
      res.send("car already exists");
      return;
    }
    const newCar = await carModel.create({ make, model, year });
    res.json({ message: "car registered sucessfully" });
  } catch (err) {
    console.warn(err);
  }
});
