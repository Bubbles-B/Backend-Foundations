<p align="center">
  <strong><span style="color:#58A6FF;">Chapter 6: Applying MongoDB to Our Project</span></strong><br>
  <strong><em><span style="color:#8B949E;">Beginning Node.js, Express & MongoDB Development</span></em></strong>
</p>

## Chapter Summary
In this chapter, we use **MongoDB** to build our blog application.

We implement a form to create a blog post and use the `express.json()` and `express.urlencoded()` middleware to retrieve form field data. The `BlogPost` model is used to store the data in the database. We then display the list of blog posts on the home page using the **EJS templating engine**. Each individual blog post can also be viewed on its own detail page.

### What We Build

- **Create** a new blog post
- **Store** blog posts in MongoDB
- **Retrieve** blog posts from MongoDB
- **Display** all posts on the home page
- **Display** an individual post on its own page
- **Display** the username and date posted
- **Search** blog posts by title
##
## 🟨 1. Code From Previous Chapters

We use the code from the previous chapters before updating it.

- **Chapter 4:** `public`, `views`, `index.js`
- **Chapter 5:** `package.json`, `models`

> **Important:** This chapter builds on the existing project, so make sure the previous chapters are completed before continuing.


## 🟨 2. Prerequisites / Install

This chapter assumes that **Express**, **EJS views**, and **MongoDB with Mongoose** are already set up from the previous chapters.

There are no new packages to install if you are continuing from the previous chapters.

If you are starting from scratch, install:
```
npm install express ejs mongoose

```

## 🟨 3. File Structure
The relevant files touched or added in this chapter are:

```text
chapter6/
├── models/
│   └── BlogPost.js        (schema updated: +username, +datePosted)
├── views/
│   ├── layouts/
│   │   ├── header.ejs     (hrefs made absolute)
│   │   ├── navbar.ejs     (added 'New Post' link)
│   │   ├── footer.ejs
│   │   └── scripts.ejs    (hrefs made absolute)
│   ├── create.ejs         (new post form)
│   ├── index.ejs          (loops through blogposts)
│   ├── contact.ejs        (new contact)
│   ├── about.ejs          (about blog)
│   └── post.ejs           (single post detail)
└── index.js               (routes for list/create/store/show)
```
**Important Changes**
- BlogPost.js is updated with username and datePosted.
- create.ejs contains the **new blog post form.**
- index.ejs displays **all blog posts.**
- post.ejs displays **a single blog post.**
- index.js contains the routes for **listing, creating, storing, and displaying posts.**

## 🟨4. Final Code
**models/BlogPost.js**
This is how your file should look: **Page 75**
```js
const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const BlogPostSchema = new Schema({
    title: String,
    body: String,
    username: String,
    datePosted: {
        type: Date,
        default: Date.now
    }
});

const BlogPost = mongoose.model('BlogPost', BlogPostSchema);
module.exports = BlogPost

```
**Key Points:**
- title stores the **blog post title.**
- body stores the **content of the blog post.**
- username stores the **author's username.**
- datePosted stores the **date the post was created.**
- default: Date.now automatically sets the date.
##
**index.js**
This is how your file should look:
```javascript
const express = require('express')
const path = require('path')
const app = new express()
const ejs = require('ejs')
const mongoose = require('mongoose')
const BlogPost = require('./models/BlogPost.js')

mongoose.connect('mongodb://localhost:27017/my_database')

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded())

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

app.post('/posts/store', async (req, res) => {
    await BlogPost.create(req.body)
    res.redirect('/')
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
```

**Important Middleware**
The following middleware is important for receiving data from forms:
- app.use(express.json())app.use(express.urlencoded())
- express.urlencoded() allows Express to read data submitted through an HTML form.

**Creating a Blog Post**

The following route displays the create post form:
- app.get('/posts/new', (req, res) => {    res.render('create')})

The following route receives the submitted form data and stores it in MongoDB:
- app.post('/posts/store', async (req, res) => {    await BlogPost.create(req.body)    res.redirect('/')})

**Important: req.body contains the form data submitted by the user.**


**Finding a Blog Post by ID**

This route retrieves an individual blog post from MongoDB:

app.get('/post/:id', async (req, res) => {    const blogpost = await BlogPost.findById(req.params.id)    res.render('post', {        blogpost    })})

**The :id represents the MongoDB document ID**
##
**views/create.ejs**
Inside your file, find the form and replace it with: **Page 64**

```html
<form action="/posts/store" method="POST">
    <div class="form-floating">
        <input type="text" class="form-control" placeholder="Title" id="title" name="title">
        <label for="title">Title</label>
    </div>

    <div class="form-floating">
        <textarea rows="5" class="form-control" id="body" name="body" placeholder="Description"></textarea>
        <label for="body">Description</label>
    </div>
    <br />

    <!-- Submit Button-->
    <button class="btn btn-primary text-uppercase" id="submitButton" type="submit">Send</button>
</form>
```

**How the Form Works**
- The form sends data to:
  /posts/store
- using the **POST method.**
The important field names are:
- title → blog post title
- body → blog post content
**These names correspond to the fields in the BlogPost schema.**
##
**views/index.ejs**
Loop through the blog posts **Page 69**

```html
<% for (var i = 0; i < blogposts.length; i++) { %>  
  <div class="post-preview">    
    <a href="/post/<%= blogposts[i]._id %>">      
      <h2 class="post-title"><%= blogposts[i].title %></h2>      
      <h3 class="post-subtitle"><%= blogposts[i].body %></h3>    
    </a>    
    <p class="post-meta">Posted by      
      <a href="#"><%= blogposts[i].username %></a>      
      on <%= blogposts[i].datePosted.toDateString() %>
    </p>  
  </div>  
  <hr>
<% } %>
```

**What This Does**

The EJS loop goes through the blogposts array and displays each post.

It displays:
- Post title
- Post body
- Username
- Date posted
- A link to the individual post page

**The link uses the MongoDB document's _id** 
##
  
**views/post.ejs**
To dynamically display each post’s unique data in post.ejs **Page 73 - 74**

```html
<h1><%= blogpost.title %></h1>
<h2 class="subheading"><%= blogpost.body %></h2>
<span class="meta">  
  Posted by  
  <a href="#"><%= blogpost.username %></a>  
  on <%= blogpost.datePosted.toDateString() %>
</span>
```
##
## 🟨5. How to Run
**Start the application with:**
```
npm start
```
**Important: Make sure your MongoDB server is running before starting the application.**

Then open your browser and visit the appropriate URL.

**Application Routes**

<table>
  <thead>
    <tr>
      <th align="left">URL</th>
      <th align="left">Purpose</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>http://localhost:4000/</td>
      <td>Home page – lists all blog posts</td>
    </tr>
    <tr>
      <td>http://localhost:4000/posts/new</td>
      <td>Create post – form to create a new post</td>
    </tr>
    <tr>
      <td>http://localhost:4000/post/&lt;id&gt;</td>
      <td>Post detail – displays a single blog post</td>
    </tr>
  </tbody>
</table>




