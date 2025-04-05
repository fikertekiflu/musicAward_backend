const express = require("express");
const upload = require("../middleware/upload");
const { createLocation, getAllLocations, getLocationById, updateLocation, deleteLocation } = require("../controllers/locationController");

const router = express.Router();

router.post("/", upload.single("image"), createLocation); 
router.get("/", getAllLocations); 
router.put("/:id", upload.single("image"), updateLocation);
router.delete("/:id", deleteLocation); 

module.exports = router;