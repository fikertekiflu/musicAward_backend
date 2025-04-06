
const express = require("express");
const upload = require("../middleware/upload");

const {
  createPreviousWonArtist,
  getAllPreviousWonArtists,
  getPreviousWonArtistById,
  updatePreviousWonArtist,
  deletePreviousWonArtist,
} = require("../controllers/previousWonArtistController");

const router = express.Router();

// Corrected Middleware
const handleMultipleFiles = (req, res, next) => {
  console.log("handleMultipleFiles - Initial Request Headers:", req.headers);

  // Step 1: Use a temporary memory storage to extract fields without using multer yet
  const tempStorage = multer().none();
  tempStorage(req, res, (err) => {
    if (err) return next(err);

    // Step 2: Parse artists field
    try {
      if (typeof req.body.artists === "string") {
        req.body.artists = JSON.parse(req.body.artists);
        console.log("✅ Parsed artists:", req.body.artists);
      } else {
        console.warn("⚠️ req.body.artists was not a string.");
      }
    } catch (parseError) {
      console.error("❌ Failed to parse artists:", parseError);
      return res.status(400).json({ message: "Invalid artists format" });
    }

    // Step 3: Dynamically define multer fields
    const uploadFields = [];
    if (Array.isArray(req.body.artists)) {
      req.body.artists.forEach((artist) => {
        if (artist.tempId) {
          uploadFields.push({ name: `file-${artist.tempId}`, maxCount: 1 });
        }
      });
    }

    console.log("🗂️ Multer upload fields:", uploadFields);

    // Step 4: Call multer.fields with correct config now
    return multer({
      storage: multer.memoryStorage(),
      fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (![".jpg", ".jpeg", ".png"].includes(ext)) {
          cb(new Error("Only .jpg, .jpeg, .png files are allowed"), false);
        } else {
          cb(null, true);
        }
      },
    }).fields(uploadFields)(req, res, next);
  });
};

router.post("/", handleMultipleFiles, createPreviousWonArtist);

// Get all rounds with artists
router.get("/", getAllPreviousWonArtists);

// Get a specific round by ID
router.get("/:id", getPreviousWonArtistById);

router.patch("/:id", handleMultipleFiles, updatePreviousWonArtist);

router.delete("/:id", deletePreviousWonArtist);

module.exports = router;