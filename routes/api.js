var express = require('express');
var router = express.Router();


// GET
router.use('/get/breeds', require('./api/get_breeds.js'));
router.use('/get/inoculations', require('./api/get_inoculations.js'));
router.use('/get/feeds', require('./api/get_feeds.js'));
router.use('/get/products', require('./api/get_products.js'));
router.use('/get/diseases', require('./api/get_diseases.js'));
router.use('/get/food/categories', require('./api/get_food_categories.js'));

// POST
router.use('/join', require('./api/join.js'));
router.use('/login', require('./api/login.js'));
router.use('/logout', require('./api/logout.js'));
router.use('/save/pet', require('./api/save_pet.js'));

// POST - FILE
router.use('/upload/image', require('./api/upload_image.js'));


module.exports = router;