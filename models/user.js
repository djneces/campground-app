const mongoose = require('mongoose')
const Schema = mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose')

//without password and username
const UserSchema = new Schema ({
    email: {
        type: String,
        required: true,
        unique: true,
    }
})

//passport, adds password and username
UserSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model('User', UserSchema)