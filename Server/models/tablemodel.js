const mongoose = require("mongoose");

//schema

const tableSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
  },
  data: {
    type: String,
    required: true,
  },
});

const tableModel = mongoose.model("tablemanagedb", tableSchema);

module.exports = tableModel;
