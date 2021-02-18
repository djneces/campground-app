const isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) { //method from Passport
        //store the url they are requesting
        req.session.returnTo = req.originalUrl //save into session [returnTo] = I name it
        req.flash('error', 'You must be signed in first!')
        return res.redirect('/login')//return
    } 
    next()
}

module.exports.isLoggedIn = isLoggedIn