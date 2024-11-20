const express = require('express');
const router = express.Router();
const GuestController = require('../controllers/guestController');

// 游客可访问的路由
router.get('/papers', GuestController.browsePapers);
router.get('/books', GuestController.browseBooks);

module.exports = router; 