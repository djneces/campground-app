const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const ejsMate = require('ejs-mate') //ejs-mate
const session = require('express-session')
const flash = require('connect-flash')
const ExpressError = require('./utils/ExpressError')
const methodOverride = require('method-override')
const campgrounds = require('./routes/campgrounds')
const reviews = require('./routes/reviews')



// ***** DB CONNECTION VIA MONGOOSE ****
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
app.use(express.static(path.join(__dirname, 'public'))) //serving static files

// ***** SESSIONS ****
const sessionConfig = {
    secret: 'thisshouldbeasecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //plus 1 week
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
}
app.use(session(sessionConfig))

// ***** FLASH ****
app.use(flash())

//middleware
app.use((req, res, next) => {
    res.locals.success = req.flash('success') //on every single request we have access to local variable (under the key success)
    res.locals.error = req.flash('error') 
    next()
})


// ***** ROUTES Campground ****

app.use('/campgrounds', campgrounds) //campgrounds in routes //ROUTER

// ***** ROUTES Review ****

app.use('/campgrounds/:id/reviews', reviews) //reviews in routes //ROUTER

app.get('/', (req, res) => {
    res.render('home')
})

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