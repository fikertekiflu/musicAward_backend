const express = require("express");
const upload = require("../middleware/upload");
const { createAboutUs, getAboutUs, updateAboutUs, deleteAboutUs } = require("../controllers/aboutUsController");

const router = express.Router();

router.post("/", upload.single("image"), createAboutUs); 
router.get("/", getAboutUs); 
router.put("/:id", upload.single("image"), updateAboutUs);
router.delete("/:id", deleteAboutUs); 

module.exports = router;
