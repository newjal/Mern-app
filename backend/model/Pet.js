import mongoose from "mongoose";

const petSchema = mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  type: {
    type: String,
    required: true, // Type of pet is required (e.g., dog, cat)
  },
  breed: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
});

const petModel = mongoose.model.Pet || mongoose.model("Pet", petSchema);

export default petModel;
