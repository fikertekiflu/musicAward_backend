const express = require('express');
const router = express.Router();
const previousWonArtistController = require('../controllers/previousWonArtistController');

router.post('/', previousWonArtistController.createPreviousWonArtist);
router.get('/', previousWonArtistController.getPreviousWonArtists);
router.get('/:id', previousWonArtistController.getPreviousWonArtistById);
router.put('/:id', previousWonArtistController.updatePreviousWonArtist);
router.delete('/:id', previousWonArtistController.deletePreviousWonArtist);

module.exports = router;