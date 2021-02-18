const mongoose = require('mongoose')
const Review = require('./review')
const Schema = mongoose.Schema //to shorten up the code

const CampgroundSchema = new Schema ({
    title: String,
    image: String,
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


