const mongoose = require('mongoose')
const Review = require('./review')
const Schema = mongoose.Schema //to shorten up the code


const ImageSchema = new Schema({
        url: String,
        filename:String,
})

ImageSchema.virtual('thumbnail').get(function () { //virtual property, img.thumbnail after that available in edit.ejs
  return this.url.replace('/upload', '/upload/w_200')  //add w_200 so they imgs appear as thumbnails, url specified by Cloudinary
})

//to JSON 
const options = {toJSON: {virtuals: true}} //need this to have virtual property appear in the object in the console!!! when stringified

const CampgroundSchema = new Schema ({
    title: String,
    images: [ImageSchema], //moved to separate Schema
    geometry: {  //https://mongoosejs.com/docs/geojson.html
          type: {
            type: String, 
            enum: ['Point'], //only point
            required: true
          },
          coordinates: {
            type: [Number],
            required: true
          }
      },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review',  //object id from review model
        }
    ]
}, options) //pass the options

CampgroundSchema.virtual('properties.popUpMarkup').get(function () { //virtual property, its not stored in the DB, its just virtual
    return `
    <strong><a href='/campgrounds/${this._id}'>${this.title}</a></strong>
    ${/* truncates to 20 chars */ ""}
    <p>${this.description.substring(0,20)}...</p> 
    
    ` //properties.x as per clusterMap format
  })

//mongoose middleware to delete associated reviews afterwards we delete a campground
//follows findOneAndDelete in delete route for campgrounds, if I change this method, I need to change here too
//this is a query middleware 
CampgroundSchema.post('findOneAndDelete', async function (doc) {  // pre or post middleware mongoose methods!, if I delete campsite I want to delete all comments too
    if(doc) { //document, basically campground
        await Review.deleteMany({
            _id: {
                $in: doc.reviews //in reviews[]
            }
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema)


