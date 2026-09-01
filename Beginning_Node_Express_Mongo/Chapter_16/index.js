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
const expressSession = require('express-session'); //page 107
const authMiddleware = require('./middleware/authMiddleware'); //page 110
const redirectIfAuthenticatedMiddleware = require('./middleware/redirectIfAuthenticatedMiddleware') //page 111
const logoutController = require('./controllers/logout') //page 114
const flash = require('connect-flash'); //Page 122


// --- Updated to Cloud Database ---
mongoose.connect('mongodb+srv://Lee:Lee123@cluster0.bofbx.mongodb.net/my_database')

//page 107
app.use(expressSession({ secret: 'keyboard cat', resave: false, saveUninitialized: false }))

//page 112
global.loggedIn = null
app.use('/*splat', (req, res, next) => {
  loggedIn = req.session.userId
  next()
})


app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded())
app.use(fileUpload()) //Page 80

app.use('/posts/store', validateMiddleware) //Page 93
app.use(flash()); //page 122

// --- Auth routes (Chapter 10) Update on page 111---
app.get('/auth/register', redirectIfAuthenticatedMiddleware, newUserController) //Page 96
app.post('/users/register', redirectIfAuthenticatedMiddleware, storeUserController) //Page 97
app.get('/auth/login', redirectIfAuthenticatedMiddleware, loginController) //Page 103
app.post('/users/login', redirectIfAuthenticatedMiddleware, loginUserController) //page 106
app.get('/auth/logout', logoutController) //page 114


// --- Post routes (Chapter 9) ---
app.get('/', homeController)
app.get('/posts/new', authMiddleware, newPostController) //update on page 110
app.post('/posts/store', authMiddleware, storePostController) //update on page 111
app.get('/post/:id', getPostController)

// --- 404 catch-all — must be LAST (page 115)---
app.use((req, res) => res.render('notfound'))

// Change your old app.listen(4000) to this:
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
});