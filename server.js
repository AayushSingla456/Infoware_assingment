const express = require("express");
const bodyParser = require("body-parser");
const { Contact, Employee } = require("./models");
const mongoose = require("mongoose");

mongoose
  .connect(
    "mongodb+srv://Infoware:kq5Ra7jgIN78a9ZK@cluster0.jdhjp02.mongodb.net/Infoware?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("Connected to MongoDB Atlas");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB Atlas:", err.message);
  });

const app = express();
app.use(bodyParser.json());

// Create an employee with contacts
app.post("/employees", async (req, res) => {
  try {
    const employee = new Employee(req.body.employee);
    const contacts = req.body.contacts.map((contact) => new Contact(contact));
    employee.contacts = await Promise.all(
      contacts.map((contact) => contact.save())
    );
    await employee.save();
    res.status(201).json(employee);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// List employees with pagination
app.get("/employees", async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const employees = await Employee.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("contacts");
    res.json(employees);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// Update an employee
app.put("/employees/:id", async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body.employee,
      { new: true }
    );
    const contacts = req.body.contacts.map((contact) => new Contact(contact));
    employee.contacts = await Promise.all(
      contacts.map((contact) => contact.save())
    );
    await employee.save();
    res.json(employee);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// Delete an employee
app.delete("/employees/:id", async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    await Contact.deleteMany({ _id: { $in: employee.contacts } });
    await Employee.deleteOne({ _id: req.params.id });
    res.json({ message: "Employee deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// Get an employee
app.get("/employees/:id", async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).populate(
      "contacts"
    );
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.json(employee);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// Start the server
app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
