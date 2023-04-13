const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  type: String,
  value: String,
});

const employeeSchema = new mongoose.Schema({
  name: String,
  email: String,
  contacts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Contact" }],
});

const Contact = mongoose.model("Contact", contactSchema);
const Employee = mongoose.model("Employee", employeeSchema);

module.exports = { Contact, Employee };
