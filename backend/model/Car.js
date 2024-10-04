import mongoose from "mongoose";

const carSchema = mongoose.Schema({
  make: {
    type: String,
    required: true, // Manufacturer of the car (e.g., Toyota, Ford)
  },
  model: {
    type: String,
    required: true, // Model name of the car (e.g., Corolla, Mustang)
  },
  year: {
    type: Number,
    required: true, // Year the car was manufactured
  },

});

const carModel = mongoose.model.Car || mongoose.model('car',carSchema)

export default carModel;