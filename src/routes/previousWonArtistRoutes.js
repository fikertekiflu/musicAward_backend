const express = require('express');
const upload = require('../middleware/upload');
const {
  createWonArtistRound,
  getWonArtistRounds,
  updateWonArtistRound,
  deleteWonArtistRound
} = require('../controllers/previousWonArtistController');

const router = express.Router();

router.post('/', upload.any(), createWonArtistRound);
router.get('/', getWonArtistRounds);
router.put('/:id', upload.any(), updateWonArtistRound);
router.delete('/:id', deleteWonArtistRound);

module.exports = router;
