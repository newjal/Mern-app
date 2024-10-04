import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true, // Name is required
  },
  email: {
    type: String,
    required: true, // Username is required
   
  },
  password: {
    type: String,
    required: true, // Password is required
  },
});

const UserModel = mongoose.models.User || mongoose.model("User", userSchema);

export default UserModel;
