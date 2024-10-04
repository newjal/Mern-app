import pkg from "jsonwebtoken";
const { sign, verify } = pkg;

const createTokens = (user) => {
  const accessToken = sign(
    { username: user.username, id: user.id },
    "jwtsecretpls"
  );
  return accessToken;
};

const validateToken = (req, res, next) => {
  const accessToken = req.cookies["access-Token"]; 

  if (!accessToken) {
    return res.status(400).json({ error: "User not Authenticated!" });
  }

  try {
    const validToken = verify(accessToken, "jwtsecretpls");
    if (validToken) {
      req.authenticated = true;
      return next();
    }
  } catch (error) {
    return res.status(400).json({ error: error });
  }
};

// Exporting both functions
export { createTokens, validateToken };
