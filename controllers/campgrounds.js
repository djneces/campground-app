const Campground = require('../models/campground')

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', {campgrounds})
 }

 module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new')
}

module.exports.createCampground = async (req, res, next) => { 
    //if I dont send the data I'm supposed to = e.g. via Postman
    // if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400) -basic
    const campground = new Campground(req.body.campground)
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
        console.log(campground);
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
    const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground}) // {title:'sss', location:'ddd'}, 2nd param is new values
    req.flash('success', 'Successfully updated campground.')
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id)
    req.flash('success', 'Successfully deleted campground.')
    res.redirect('/campgrounds')
}