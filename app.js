if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
} //environment variables in production (process.env.SECRET)
// test production mode : NODE_ENV=production node app.js 


const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const ejsMate = require('ejs-mate') //ejs-mate
const session = require('express-session')
const flash = require('connect-flash')
const ExpressError = require('./utils/ExpressError')
const methodOverride = require('method-override')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('./models/user')
const userRoutes = require('./routes/users')
const reviewRoutes = require('./routes/reviews')
const campgroundRoutes = require('./routes/campgrounds')

const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')

const MongoStore = require('connect-mongo').default;

// ***** DB CONNECTION VIA MONGOOSE ****
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp'
mongoose.connect(dbUrl, {
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
app.use(mongoSanitize())//mongo sanitizer

// ***** SESSIONS ****
const secret = process.env.SECRET || 'thisshouldbeasecret'

const store = MongoStore.create({
    mongoUrl: dbUrl,
    secret: secret,
    touchAfter: 24 * 60 * 60
})

store.on('error', function(e) {
    console.log('SESSION STORE ERROR', e);
})

const sessionConfig = {
    store,
    name: 'session', //I name it, prevents attacking standard nam connect.sid
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true, //only accessible over http, not JavaScript - protection
        // secure: true, //works ONLY on https
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //plus 1 week
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
}

// ***** SESSION ****
app.use(session(sessionConfig)) //before passport.session
// ***** FLASH ****
app.use(flash())
// ***** HELMET ****
app.use(helmet())

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://cdn.jsdelivr.net",
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dxmhn2we7/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
                "https://source.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

// ***** PASSPORT ****
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())//how we store the user in the session
passport.deserializeUser(User.deserializeUser())

// ***** MIDDLEWARE ****
app.use((req, res, next) => {

    //CURRENT USER
    res.locals.currentUser = req.user //req.user from passport, we use currentUser in navbar.ejs, res.local variable available in all templates
    res.locals.success = req.flash('success') //on every single request we have access to local variable (under the key success)
    res.locals.error = req.flash('error') 
    next()
})

app.get('/fakeUser', async(req,res) => {
    const user = new User({email: 'test@mail.com', username: 'testUser'})
    const newUser =  await User.register(user, 'password') //plus password, passport method
    res.send(newUser)
})


// ***** ROUTES ****
app.use('/', userRoutes)
app.use('/campgrounds', campgroundRoutes) //campgrounds in routes //ROUTER
app.use('/campgrounds/:id/reviews', reviewRoutes) //reviews in routes //ROUTER

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