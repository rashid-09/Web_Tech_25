// models/product.model.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: String,
  price: String,
  image: String,
  description: String,
});


const Product = mongoose.model("Product", productSchema);
module.exports = Product;
