const express = require('express')
const path = require('path')
const app = new express()
const ejs = require('ejs')
const mongoose = require('mongoose')
const BlogPost = require('./models/BlogPost.js')
const fileUpload = require('express-fileupload') //Page 80

mongoose.connect('mongodb://localhost:27017/my_database')

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded())
app.use(fileUpload()) //Page 80

//TRY OUT PAGE 71
app.get('/', async (req, res) => {
    let query = {}
    if (req.query.search) {
        query.title = new RegExp(req.query.search, 'i')
    }
    const blogposts = await BlogPost.find(query)
    res.render('index', {
        blogposts
    })
})

app.get('/about', (req, res) => {
    // res.sendFile(path.resolve(__dirname, 'pages/about.html'))
    res.render('about')
})

app.get('/contact', (req, res) => {
    // res.sendFile(path.resolve(__dirname, 'pages/contact.html'))
    res.render('contact')
})

app.get('/post', (req, res) => {
    // res.sendFile(path.resolve(__dirname, 'pages/post.html'))
    res.render('post')
})

app.get('/posts/new', (req, res) => {
    res.render('create')
})

app.post('/posts/store', (req, res) => {
    let image = req.files.image
    image.mv(path.resolve(__dirname, 'public/img', image.name), async (error) => {
        await BlogPost.create({
            ...req.body,
            image: '/img/' + image.name
        })
        res.redirect('/')
    })
})

//Page 72
app.get('/post/:id', async (req, res) => {
    const blogpost = await BlogPost.findById(req.params.id)
    res.render('post', {
        blogpost
    })
})

app.listen(4000, () => {
    console.log('App listening on port 4000')
})