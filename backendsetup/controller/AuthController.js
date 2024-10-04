import UserModel from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";



export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
   
    const user = await UserModel.findOne({ email });
    if (user) {
      return res
        .status(409)
        .json({ message: "User already exits", success: false });
    }
    const newUser = new UserModel({ name, email, password });
    newUser.password = await bcrypt.hash(password, 10);
    await newUser.save();
    res.status(201).json({
      message: "SignUp successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res
        .status(409)
        .json({
          message: "Auth failed, email or password is wrong",
          success: false,
        });
    }

    const dbPassword = user.password;
    bcrypt.compare(password, dbPassword).then((match) => {
      if (!match) {
        return res
          .status(400)
          .json({ message: "Wrong email and password combination" });
      }

      // Generate JWT token
      const jwtToken = jwt.sign(
        { email: user.email, _id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      // Return response with JWT token
      res.status(200).json({
        message: "Login successfully",
        success: true,
        jwtToken, // Return token here
        email,
        name: user.name,
      });
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// export const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await UserModel.findOne({ email });
//     const errorMsg = "Auth failed email or password is wrong";
//     if (!user) {
//       return res.status(409).json({ message: errorMsg, success: false });
//     }
//     const dbPassword = user.password;
//     bcrypt.compare(password, dbPassword).then((match) => {
//       if (!match) {
//         return res.status(400).json({
//           message: "wrong email and password combination",
//         });
//       }

//       const jwtToken = jwt.sign(
//         { email: user.email, _id: user._id },
//         process.env.JWT_SECRET,
//         { expiresIn: "24h" }
//       );

//       res.status(200).json({
//         message: "login successfully",
//         success: true,
//         jwtToken,
//         email,
//         name: user.name,
//       });
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Internal server error",
//       success: false,
//     });
//   }
// };
