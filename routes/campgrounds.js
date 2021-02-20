const express = require('express')
const router = express.Router()
const campgrounds = require('../controllers/campgrounds')
const catchAsync = require('../utils/catchAsync')
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware')
const multer  = require('multer')
const {storage} = require ('../cloudinary')
const upload = multer({ storage })  //use storage from /cloudinary


// ***** ROUTES ****
 router.route('/')
        .get(catchAsync(campgrounds.index)) //controllers/campgrounds
        //wrapping func with catchAsync from utils - catches errors
        .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground)) //in production we should first validate prior uploading imgs
     
        
 router.get('/new', isLoggedIn, campgrounds.renderNewForm)
 
 router.route('/:id')
        .get(isLoggedIn, catchAsync(campgrounds.showCampground))
        .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
        .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

 
 router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))
 
 module.exports = router  //    EXPORT

 /*
// ***** ROUTES ****
 router.get('/', catchAsync(campgrounds.index)) //controllers/campgrounds
 
 router.get('/new', isLoggedIn, campgrounds.renderNewForm)
 
 //wrapping func with catchAsync from utils - catches errors
 router.post('/', isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground))
 
 router.get('/:id', isLoggedIn, catchAsync(campgrounds.showCampground))
 
 router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))
 
 router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground))
 
 router.delete('/:id', isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

 module.exports = router  //    EXPORT

 */