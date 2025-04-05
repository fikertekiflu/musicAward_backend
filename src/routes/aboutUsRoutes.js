const express = require("express");
const upload = require("../middleware/upload");
const { createAboutUs,getAllAboutUs , updateAboutUs, deleteAboutUs } = require("../controllers/aboutUsController");

const router = express.Router();

router.post("/", upload.single("image"), createAboutUs); 
router.get("/", getAllAboutUs); 

router.put("/:id", upload.single("image"), updateAboutUs); 
router.delete("/:id", deleteAboutUs); 

module.exports = router;
