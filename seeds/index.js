// RUNNING SEEDS SEPARATELY FROM THE APP.JS 
const mongoose = require('mongoose')
const cities = require('./cities')
const { places, descriptors } = require('./seedHelpers')
const Campground = require('../models/campground')


//DB connection via Mongoose
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
}) 

const db = mongoose.connection
db.on('error', console.error.bind(console, "connection error"))
db.once("open", () => {
    console.log("database connected");
})

const sample = (array) => array[Math.floor(Math.random() * array.length)]


//generating fake seed names 
const seedDB = async () => {
    await Campground.deleteMany({}) //removes all first 
    for(let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000)
        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`
        })
        await camp.save()
    }
}


//closing connection
seedDB().then(() => {
    db.close()
})