const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  displayName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true, // No duplicate emails
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
       required: function () {
        return this.authProvider === "local";
      },
  },
  isAdmin: { 
    type: Boolean,
    default: false 
    },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("User", userSchema);
