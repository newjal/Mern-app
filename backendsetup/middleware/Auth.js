import jwt from "jsonwebtoken";

export const ensureAuthenticated = (req, res, next) => {
  const token = req.headers["authorization"]; // Directly take the token without Bearer prefix

  if (!token) {
    return res
      .status(403)
      .json({ message: "Unauthorized, JWT token is required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token directly
    req.user = decoded;
    next();
  } catch (error) {
    return res
      .status(430)
      
      .json({ message: "Unauthorized, JWT token wrong or expired" });
  }
};
