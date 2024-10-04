import mongoose from "mongoose";

const userSchema = mongoose.Schema({

  name: {
    type: String,
    required: true, // Name is required
  },
  username: {
    type: String,
    required: true, // Username is required
    unique: true, // Username must be unique
  },
  password: {
    type: String,
    required: true, // Password is required
  },
});


const UserModel = mongoose.models.User || mongoose.model("User", userSchema);

export default UserModel;
