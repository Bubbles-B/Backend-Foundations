const express = require('express')
const app = new express()
const mongoose = require('mongoose')
const fileUpload = require('express-fileupload') //Page 80

const newPostController = require('./controllers/newPost') // Page 90
const homeController = require('./controllers/home')          //Page 92
const storePostController = require('./controllers/storePost') //Page 92
const getPostController = require('./controllers/getPost')     //Page 92
const validateMiddleware = require('./middleware/validateMiddleware') //Page 93

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

//Page 93 
app.use('/posts/store', validateMiddleware)

//Page 90
app.get('/posts/new', newPostController)

//Page 93
app.get('/', homeController)
app.get('/post/:id', getPostController)
app.post('/posts/store', storePostController)

app.listen(4000, () => {
    console.log('App listening on port 4000')
})