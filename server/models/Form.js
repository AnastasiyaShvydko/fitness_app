// server/models/Form.js
const mongoose = require('mongoose');

const FormSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Form', FormSchema);
