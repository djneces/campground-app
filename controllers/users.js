const User = require('../models/user')

module.exports.renderRegister = (req, res) => {
    res.render('users/register')
}

module.exports.register = async(req, res) => {
    try { //catchAsync showed mongoose errors as per error.ejs, add another try to custom handle flash errors in catch
        const { email, username, password } = req.body
        const user = new User({email, username})
        const registeredUser = await User.register(user, password)
        req.login(registeredUser, err => { //req.login from passport, logs automatically in after registration
            if(err) return next(err)
            req.flash('success', 'Welcome to Yelp Camp!')
            res.redirect('/campgrounds')
        })
        
    } catch (e) {  //custom flash error message
        req.flash('error', e.message)
        res.redirect('register')
    }
}

module.exports.renderLogin = (req, res) => {
    res.render('users/login')
}

module.exports.login = (req, res) => {
    req.flash('success', 'Welcome back!')  
    const redirectUrl = req.session.returnTo || '/campgrounds' //take the previous url from session 
    delete req.session.returnTo // deleting url from session after use
    res.redirect(redirectUrl)
}

module.exports.logout = (req, res) => {
    req.logout() //passport method on req object
    req.flash('success', 'Goodbye!')
    res.redirect('/campgrounds') 
}