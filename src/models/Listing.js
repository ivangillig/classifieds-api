// models/Listing.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const ListingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  location: {
    type: Schema.Types.ObjectId,
    ref: "Location",
    required: true,
  },
  photos: [
    {
      type: String,
    },
  ],
  price: {
    type: Number,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Listing = mongoose.model("Listing", ListingSchema);

export default Listing;
