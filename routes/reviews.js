const express = require('express')
const router = express.Router({mergeParams: true}) //so I can read req.params using Router!, /campgrounds/:id/reviews ->id is defined in App.js

const Campground = require('../models/campground')
const Review = require('../models/review')
const { reviewSchema } = require('../schemas')
const ExpressError = require('../utils/ExpressError')
const catchAsync = require('../utils/catchAsync')

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body)
    if(error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next() //IMPORTANT SO IT CONTINUES
    }
}

router.post('/', validateReview, catchAsync(async(req, res) => {
    const campground = await Campground.findById(req.params.id)
    const review = new Review(req.body.review)// create new review
    campground.reviews.push(review) // add id of the review into campground
    await review.save() 
    await campground.save()
    req.flash('success', 'Created a new review.')
    res.redirect(`/campgrounds/${campground._id}`)
 }))
 
 router.delete('/:reviewId', catchAsync(async(req, res) => {
     const {id, reviewId} = req.params
     await Campground.findByIdAndUpdate(id, {$pull : {reviews: reviewId}}) //The $pull operator removes from an existing array all instances of a value or values that match a specified condition.
     await Review.findByIdAndDelete(reviewId)
     req.flash('success', 'Successfully deleted review.')
     res.redirect(`/campgrounds/${id}`)
 }))

 module.exports = router