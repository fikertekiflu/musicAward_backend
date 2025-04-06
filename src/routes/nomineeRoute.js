const express = require('express');
const router = express.Router();
const nomineeController = require("../controllers/nomineeController");;

// Create a new nominee
router.post('/', nomineeController.createNominee);

// Get all nominees
router.get('/', nomineeController.getAllNominees);

// Get a single nominee by ID
router.get('/:id', nomineeController.getNomineeById);

// Update a nominee by ID
router.put('/:id', nomineeController.updateNominee);

// Delete a nominee by ID
router.delete('/:id', nomineeController.deleteNominee);

module.exports = router;