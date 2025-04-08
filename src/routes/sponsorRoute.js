const express = require('express');
const upload = require('../middleware/upload');
const {
  createSponsor,
  getSponsors,
  getSponsorById,
  updateSponsor,
  deleteSponsor,
} = require('../controllers/sponsorController');

const router = express.Router();
router.post('/', upload.array('logos', 2), createSponsor);
router.get('/', getSponsors);
router.get('/:id', getSponsorById);
router.put('/:id', upload.array('logos', 2), updateSponsor);
router.delete('/:id', deleteSponsor);

module.exports = router;
