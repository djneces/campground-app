const Campground = require('../models/campground')
const Review = require('../models/review')


module.exports.createReview = async(req, res) => {
    const campground = await Campground.findById(req.params.id)
    const review = new Review(req.body.review)// create new review
    review.author = req.user._id //req.user from Passport
    campground.reviews.push(review) // add id of the review into campground
    await review.save() 
    await campground.save()
    req.flash('success', 'Created a new review.')
    res.redirect(`/campgrounds/${campground._id}`)
 }

 module.exports.deleteReview = async(req, res) => {
    const {id, reviewId} = req.params
    await Campground.findByIdAndUpdate(id, {$pull : {reviews: reviewId}}) //The $pull operator removes from an existing array all instances of a value or values that match a specified condition.
    await Review.findByIdAndDelete(reviewId)
    req.flash('success', 'Successfully deleted review.')
    res.redirect(`/campgrounds/${id}`)
}