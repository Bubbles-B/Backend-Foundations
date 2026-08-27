const express = require('express')
const app = new express()
const mongoose = require('mongoose')
const fileUpload = require('express-fileupload') //Page 80

const newPostController = require('./controllers/newPost') // Page 90
const homeController = require('./controllers/home')          //Page 92
const storePostController = require('./controllers/storePost') //Page 92
const getPostController = require('./controllers/getPost')     //Page 92
const validateMiddleware = require('./middleware/validateMiddleware') //Page 93
const newUserController = require('./controllers/newUser')     //page 96
const storeUserController = require('./controllers/storeUser') //Page 97
const loginController = require('./controllers/login') //Page 103
const loginUserController = require('./controllers/loginUser') //page 106

mongoose.connect('mongodb://localhost:27017/my_database')

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded())
app.use(fileUpload()) //Page 80

//Page 85
const customMiddleWare = (req, res, next) => {
    console.log('Custom middle ware called')
    next()
}
app.use(customMiddleWare)
app.use('/posts/store', validateMiddleware) //Page 93

// --- Auth routes (Chapter 10) ---
app.get('/auth/register', newUserController) //Page 96
app.post('/users/register', storeUserController) //Page 97
app.get('/auth/login', loginController) //Page 103
app.post('/users/login', loginUserController) //page 106

// --- Post routes (Chapter 9) ---
app.get('/', homeController)
app.get('/posts/new', newPostController) //Page 90
app.post('/posts/store', storePostController)
app.get('/post/:id', getPostController)

app.listen(4000, () => {
    console.log('App listening on port 4000')
})