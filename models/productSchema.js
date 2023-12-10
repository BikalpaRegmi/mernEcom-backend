const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  image: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
    required: false,
  },
  Description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    default: 'Electronics', 
  }
}, { timestamps: true, versionKey: false });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
