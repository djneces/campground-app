const { campgroundSchema, reviewSchema } = require('./schemas')
const ExpressError = require('./utils/ExpressError')
const Campground = require('./models/campground')
const Review = require('./models/review')

module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) { //method from Passport
        //store the url they are requesting
        req.session.returnTo = req.originalUrl //save into session [returnTo] = I name it
        req.flash('error', 'You must be signed in first!')
        return res.redirect('/login')//return
    } 
    next()
}

// ***** MIDDLEWARE ****
module.exports.validateCampground = (req, res, next) => {
    //not mongoose schema! = joi, this campgroundSchema is from ./schemas.js
   //SERVER SIDE VALIDATION, client side is in bootstrap templates e.g. new.ejs
  
   const { error } = campgroundSchema.validate(req.body)
   if(error) {
       const msg = error.details.map(el => el.message).join(',') //details is array of objects => change to string message
       throw new ExpressError(msg, 400)
   } else {
       next() //IMPORTANT SO IT CONTINUES
   }
}

module.exports.isAuthor = async(req, res, next) => {
    const {id} = req.params
    const campground = await Campground.findById(id)
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!')
        return res.redirect(`/campgrounds/${id}`)//return
    }
    next()
}

module.exports.isReviewAuthor = async(req, res, next) => {
    const {id, reviewId} = req.params
    const review = await Review.findById(reviewId)
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!')
        return res.redirect(`/campgrounds/${id}`)//return
    }
    next()
}

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body)
    if(error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next() //IMPORTANT SO IT CONTINUES
    }
}
