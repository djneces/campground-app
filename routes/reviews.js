const express = require('express')
const router = express.Router({mergeParams: true}) //so I can read req.params using Router!, /campgrounds/:id/reviews ->id is defined in App.js
const {validateReview, isLoggedIn, isReviewAuthor } = require('../middleware')
const Campground = require('../models/campground')
const Review = require('../models/review')
const reviews = require('../controllers/reviews')
const ExpressError = require('../utils/ExpressError')
const catchAsync = require('../utils/catchAsync')



router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))
 
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router