const express = require("express");
const router = express.Router();
const Vehicle = require("../models/vehicleModal");
const upload = require("../middlewares/upload");

// Get all vehicles (public view)
router.get("/vehicles/", async (req, res) => {
  const vehicles = await Vehicle.find();
  res.render("vehicles/index", { vehicles });
});

// New vehicle form
router.get("/new", (req, res) => {
  res.render("vehicles/new");
});

// Create vehicle
router.post("/", upload.single("image"), async (req, res) => {
  const { name, brand, price, type } = req.body;
  const image = req.file ? req.file.filename : null;

  if (!name || !brand || !price || !type || !image) {
    return res.send("All fields are required");
  }

  await Vehicle.create({ name, brand, price, type, image });
  res.redirect("/vehicles");
});

// Edit vehicle form
router.get("/:id/edit", async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);
  res.render("vehicles/edit", { vehicle });
});

// Update vehicle
router.post("/:id", upload.single("image"), async (req, res) => {
  const { name, brand, price, type } = req.body;
  const image = req.file ? req.file.filename : null;

  let updateData = { name, brand, price, type };
  if (image) updateData.image = image;

  await Vehicle.findByIdAndUpdate(req.params.id, updateData);
  res.redirect("/vehicles");
});

// Delete vehicle
router.post("/:id/delete", async (req, res) => {
  await Vehicle.findByIdAndDelete(req.params.id);
  res.redirect("/vehicles");
});

module.exports = router;
