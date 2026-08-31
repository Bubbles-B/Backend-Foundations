const mongoose = require('mongoose')
const Schema = mongoose.Schema
const uniqueValidator = require('mongoose-unique-validator').default || require('mongoose-unique-validator') //Page 121
const bcrypt = require('bcrypt')

const UserSchema = new Schema({
    username: {
        type: String,
        required: [true,'Please provide username'], //page 124
        unique: true
    },
    password: {
        type: String,
        required: [true,'Please provide password'] //Page 124
    }
})

UserSchema.plugin(uniqueValidator); //Page 121

UserSchema.pre('save', async function () {
    const user = this
    const hash = await bcrypt.hash(user.password, 10)
    user.password = hash
})

const User = mongoose.model('User', UserSchema)
module.exports = User