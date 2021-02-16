const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const ejsMate = require('ejs-mate') //ejs-mate
const { campgroundSchema, reviewSchema } = require('./schemas')
const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/ExpressError')
const methodOverride = require('method-override')
const Campground = require('./models/campground')
const Review = require('./models/review')



//DB connection via Mongoose
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
})

const db = mongoose.connection
db.on('error', console.error.bind(console, "connection error"))
db.once("open", () => {
    console.log("database connected");
})

const app = express()

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')//ejs
app.set('views', path.join(__dirname, 'views'))// so I can start the app from any dir

app.use(express.urlencoded({extended: true})) // to parser req.body - get info from the form
app.use(methodOverride('_method')) // to use PUT in the form


// ***** MIDDLEWARE ****
const validateCampground = (req, res, next) => {
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

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body)
    if(error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next() //IMPORTANT SO IT CONTINUES
    }
}

// ***** ROUTES Campground ****
app.get('/', (req, res) => {
    res.render('home')
})

app.get('/campgrounds', catchAsync(async (req, res) => {
   const campgrounds = await Campground.find({})
   res.render('campgrounds/index', {campgrounds})
}))

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new')
})

//wrapping func with catchAsync from utils - catches errors
app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => {
    //if I dont send the data I'm supposed to = e.g. via Postman
    // if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400) -basic

   
    const campground = new Campground(req.body.campground)
    await campground.save()
    res.redirect(`/campgrounds/${campground._id}`)
  
}))

app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews') //populate shows reviews what are stored as Id in campground
    res.render('campgrounds/show', {campground})
}))

app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', {campground})
}))

app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground}) // {title:'sss', location:'ddd'}, 2nd param is new values
    res.redirect(`/campgrounds/${campground._id}`)
}))

app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id)
    res.redirect('/campgrounds')
}))

// ***** ROUTES Review ****
app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async(req, res) => {
   const campground = await Campground.findById(req.params.id)
   const review = new Review(req.body.review)// create new review
   campground.reviews.push(review) // add id of the review into campground
   await review.save() 
   await campground.save()
   res.redirect(`/campgrounds/${campground._id}`)
}))

app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async(req, res) => {
    const {id, reviewId} = req.params
    await Campground.findByIdAndUpdate(id, {$pull : {reviews: reviewId}}) //The $pull operator removes from an existing array all instances of a value or values that match a specified condition.
    await Review.findByIdAndDelete(reviewId)
    res.redirect(`/campgrounds/${id}`)
}))

// ***** ERROR HANDLING *****

//every request, every path  (if nothing above runs)
app.all('*', (req, res, next) => {
    //passing this error = next
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    //comes from ExpressError
    const {statusCode = 500} = err
    if(!err.message) err.message = 'Something went wrong!'
    res.status(statusCode).render('error', { err }) //views/error.ejs

})

// ***** LISTEN ****

app.listen(3000, () => {
    console.log('Serving at 3000');
})