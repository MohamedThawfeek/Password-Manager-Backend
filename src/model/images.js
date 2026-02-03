const mongoose = require("mongoose");

const images = new mongoose.Schema(
  {
    image_url: {
      type: Buffer,
      required: true,
    },
    image_type: {
      type: String,
      required: true,
    },
    image_name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Images = mongoose.model("Images", images);

module.exports = Images;
