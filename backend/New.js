const crypto = require("crypto");
const sendMail = require("../utils/SendEmail");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("../model/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/AppError");
const token = require("../model/token");
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const CookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    // sameSite: 'None', // Use 'None' for cross-site cookies
  };
  console.log("createsend token", user);
  if (process.env.NODE_ENV === "production") CookieOptions.secure = true;
  res.cookie("jwt", token, CookieOptions);
  user.password = undefined;
  res.status(statusCode).json({
    status: "succes",
    token,
    data: { user },
  });
};
exports.singup = catchAsync(async (req, res, next) => {
  const verificationToken = crypto.randomBytes(20).toString("hex");
  const newUser = await User.create({
    username: req.body.username,
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    token: verificationToken,
  });
  console.log("this is the new user", newUser);
  const newToken = await token.create({
    user: newUser._id,
  });
  const url = `http://localhost:4000/api/v1/users/verifyEmail/${verificationToken}`;
  // await new Email(newUser,url).sendWelcome();
  const msg = await sendMail({ email: req.body.email, url });
  // createSendToken(newUser,msg,201,res);
  res.status(201).json({
    status: "success",
    message: "User Registered",
  });
});
exports.verifyEmail = catchAsync(async (req, res, next) => {
  const { verificationToken } = req.params;
  const updatedUser = await User.findOneAndUpdate(
    { token: verificationToken },
    { verified: true }
  );
  console.log("Console updated user::>", updatedUser);
  if (!updatedUser) {
    return res.status(404).json({
      status: "fail",
      message: "User Not found..",
    });
  }
  createSendToken(updatedUser, 200, res);
});
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // check if password and email exists
  if (!email || !password) {
    return next(new AppError("please enter the email and password"));
  }
  //2) check if user exists && password is correct
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }
  if (user.verified === false) {
    const url = `http://localhost:4000/api/v1/users/verifyEmail/${user.token}`;
    await sendMail({ email: user.email, url });
    return res.status(401).json({
      status: "fail",
      message: "User Email Not verified.",
    });
  }
  createSendToken(user, 200, res);
});
exports.logout = (req, res, next) => {
  res.cookie("jwt", "logged out", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: "sucess" });
};
exports.protect = catchAsync(async (req, res, next) => {
  //1) getting token and check if it's there\
  let token;
  console.log("req.cookeis", req.cookies);
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  console.log("token", token);
  if (!token) {
    return next(
      new AppError("you are not logged in! please log in to get acess", 401)
    );
  }
  //2) verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // console.log("decoded::>>",decoded)
  //3) check if user still exists
  const freshUser = await User.findById(decoded.id);
  // console.log("decoded",decoded)
  // console.log("decoded",freshUser)
  if (!freshUser) {
    return next(
      new AppError("the user belonging to this token does no longer exist", 401)
    );
  }
  //4)check if user cahnged passwordd after the jwt was issued
  // iat = issued at
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("user recently changed password please log in again", 401)
    );
  }
  // grant acess to protected route
  req.user = freshUser;
  res.locals.user = freshUser;
  next();
});
// only for rendered pages, no errors!!
exports.isLoggedIn = async (req, res, next) => {
  try {
    if (req.cookies.jwt) {
      // 1) verify the token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
      // console.log(decoded)
      //2) check if user still exists
      const freshUser = await User.findById(decoded.id);
      if (!freshUser) {
        return next();
      }
      //3)check if user cahnged passwordd after the jwt was issued
      // iat = issued at
      if (freshUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }
      // THERE IS A LOGGED IN USER
      res.locals.user = freshUser;
      return next();
    }
  } catch (err) {
    return next();
  }
  next();
};
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin','lead-guide']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("you do not have permission to perform this action", 403)
      );
    }
    next();
  };
};
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("There is no user with email address.", 404));
  }
  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  try {
    // 3) Send it to user's email
    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/users/resetPassword/${resetToken}`;
    console.log(
      req.protocol,
      "<<>>",
      req.get("host"),
      "this is the req.protocol"
    );
    // const url = `http://localhost:4000/api/v1/users/verifyEmail/${verificationToken}`
    const msg = await sendMail({ email: req.body.email, url: resetURL });
    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    //  console.log('err:',err);
    return next(
      new AppError("There was an error sending the email. Try again later!"),
      500
    );
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  // we have deifned pre function in usermodel to set passwordChangedAt property in database(check it out)
  // 3) Update changedPasswordAt property for the user
  // 4) Log the user in, send JWT
  // createSendToken(user, 200, res);
  createSendToken(user, 200, res);
});
exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) get user from collection
  // we are storing our id in protect function in this same application as req.body = freshUser(try console.log(decoded) in there if you dont understand in future)
  const user = await User.findById(req.user.id).select("+password");
  // console.log("the id is how",user)
  //2) check if POSted current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError("your current password is wrong", 401));
  }
  //3) if so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  //user.findByIDAndUpdate wont work here
  //4)log user in, send JWT
  createSendToken(user, 200, res);
});
