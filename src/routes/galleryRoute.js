const express = require("express");
const upload = require("../middleware/upload"); // Assuming your upload middleware is in ../middleware/upload.js
const { 
  createGallery, 
  getGallery, 
  updateGallery, 
  deleteGallery 
} = require("../controllers/galleryController");

const router = express.Router();

// Route for creating a gallery (multiple images)
router.post("/", upload.array("images", 10), createGallery);

// Route for getting all gallery items
router.get("/", getGallery);

// Route for updating a gallery item (multiple images)
router.put("/:id", upload.array("images", 10), updateGallery);

// Route for deleting a gallery item
router.delete("/:id", deleteGallery);

module.exports = router;