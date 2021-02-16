const express = require('express')
const router = express.Router()
const catchAsync = require('../utils/catchAsync')
const { campgroundSchema } = require('../schemas')
const ExpressError = require('../utils/ExpressError')
const Campground = require('../models/campground')

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

// ***** ROUTES ****
router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', {campgrounds})
 }))
 
 router.get('/new', (req, res) => {
     res.render('campgrounds/new')
 })
 
 //wrapping func with catchAsync from utils - catches errors
 router.post('/', validateCampground, catchAsync(async (req, res, next) => { 
     //if I dont send the data I'm supposed to = e.g. via Postman
     // if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400) -basic
     const campground = new Campground(req.body.campground)
     await campground.save()

     req.flash('success', 'Successfully made a new campground.')//flash message
     res.redirect(`/campgrounds/${campground._id}`)
   
 }))
 
 router.get('/:id', catchAsync(async (req, res) => {
     const {id} = req.params
     //check if mongoose id is valid - if I add extra symbols into URL
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        req.flash('error', 'Cannot find that campground.')
        return res.redirect('/campgrounds')
      }

     const campground = await Campground.findById(id).populate('reviews') //populate shows reviews what are stored as Id in campground
     //if campground not found under given id
     if(!campground) {
         req.flash('error', 'Cannot find that campground.')
         return res.redirect('/campgrounds')
     }
     res.render('campgrounds/show', {campground})
 }))
 
 router.get('/:id/edit', catchAsync(async (req, res) => {
     const campground = await Campground.findById(req.params.id)
     if(!campground) {
        req.flash('error', 'Cannot find that campground.')
        return res.redirect('/campgrounds')
    }
     res.render('campgrounds/edit', {campground})
 }))
 
 router.put('/:id', validateCampground, catchAsync(async (req, res) => {
     const { id } = req.params
     const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground}) // {title:'sss', location:'ddd'}, 2nd param is new values
     req.flash('success', 'Successfully updated campground.')
     res.redirect(`/campgrounds/${campground._id}`)
 }))
 
 router.delete('/:id', catchAsync(async (req, res) => {
     const { id } = req.params
     await Campground.findByIdAndDelete(id)
     req.flash('success', 'Successfully deleted campground.')
     res.redirect('/campgrounds')
 }))

 module.exports = router  //    EXPORT