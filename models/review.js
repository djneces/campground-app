const mongoose = require ('mongoose')
const Schema = mongoose.Schema

const reviewSchema = new Schema ({
    body: String, //content - message
    rating: Number,
})

module.exports = mongoose.model('Review', reviewSchema)