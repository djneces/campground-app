const Campground = require('../models/campground')

const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
const mapBoxToken = process.env.MAPBOX_TOKEN
const geoCoder = mbxGeocoding({accessToken: mapBoxToken})

const { cloudinary } = require('../cloudinary')

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', {campgrounds})
 }

 module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new')
}

module.exports.createCampground = async (req, res, next) => { 
    //geocoding Mapbox API, here could be error handling if we dont get any data(mistyped city e.g.)
    const geoData = await geoCoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1 //1 result
    }).send()
 
    //if I dont send the data I'm supposed to = e.g. via Postman
    // if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400) -basic
    const campground = new Campground(req.body.campground)
    campground.geometry = geoData.body.features[0].geometry
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename})) //req.files is an array from multer
    campground.author = req.user._id
    await campground.save()
 
    req.flash('success', 'Successfully made a new campground.')//flash message
    res.redirect(`/campgrounds/${campground._id}`) 
}

module.exports.showCampground = async (req, res) => {
    const {id} = req.params
    //check if mongoose id is valid - if I add extra symbols into URL
   if (!id.match(/^[0-9a-fA-F]{24}$/)) {
       req.flash('error', 'Cannot find that campground.')
       return res.redirect('/campgrounds')
     }

    const campground = await Campground.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
       })
        .populate('author') //populate shows reviews what are stored as Id in campground
     
    //if campground not found under given id
    if(!campground) {
        req.flash('error', 'Cannot find that campground.')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', {campground})
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params
     const campground = await Campground.findById(id)
     if(!campground) {
        req.flash('error', 'Cannot find that campground.')
        return res.redirect('/campgrounds')
    }
     res.render('campgrounds/edit', {campground})
 }

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params 
    console.log(req.body)
    const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground}) // {title:'sss', location:'ddd'}, 2nd param is new values
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename}))//creates an array
    campground.images.push(...imgs) //push
    await campground.save()

    
    if(req.body.deleteImages) {
        //deletes img from cloudinary
        for(let filename of req.body.deleteImages) {
           await cloudinary.uploader.destroy(filename)
        }
        //deletes img from mongodb
      await campground.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}})//deletes from [images] only images from [delete images]
      console.log(campground)
    }

    req.flash('success', 'Successfully updated campground.')
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id)
    req.flash('success', 'Successfully deleted campground.')
    res.redirect('/campgrounds')
}