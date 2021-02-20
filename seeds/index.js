// RUNNING SEEDS SEPARATELY FROM THE APP.JS  -> seeds data into the database
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
        const price = Math.floor(Math.random() * 20) + 10
        //new campground creation
        const camp = new Campground({
            author: '602e43c946015c3ed2d83b90',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            images: { url:'https://source.unsplash.com/collection/483251'},
            description: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Tempora quae nemo harum optio voluptas dolor incidunt ex quis, saepe excepturi.',
            price: price, 
        })
        await camp.save()
    }
}


//closing connection
seedDB().then(() => {
    db.close()
})