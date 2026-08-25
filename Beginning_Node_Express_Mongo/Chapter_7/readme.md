<p align="center">
  <strong><span style="color:#58A6FF;">Chapter 7: Uploading an Image with Express</span></strong><br>
  <strong><em><span style="color:#8B949E;">Beginning Node.js, Express & MongoDB Development</span></em></strong>
</p>

## Chapter Summary
This chapter adds image upload support to the blog post form using the `express-fileupload package`. It covers setting the form's `enctype to multipart/form-data`, accessing the uploaded file via `req.files.image`, moving it into the `public/img` folder with `image.mv()`, saving the resulting file path to the `BlogPost schema`, and rendering the image as the post's background in `post.ejs`.
##
## Understanding enctype
enctype is a **built-in HTML form attribute**, it's not something Express or Node.js provides, it's part of how browsers handle forms natively. It tells the browser how to package the form's data before sending it to the server. By default, forms use enctype="application/x-www-form-urlencoded", which works fine for plain text fields but can't handle files. Setting enctype="multipart/form-data" tells the browser to split the form into multiple parts, one for each field, including binary file data like images, so the server can correctly receive and process the uploaded file.
##
## Understanding mv()
mv() is not a Node.js or Express built-in, it's a method provided by the express-fileupload package on each uploaded file object. When a file is uploaded, express-fileupload temporarily holds it in memory (or a temp location) and attaches it to req.files. Calling image.mv(destinationPath, callback) moves that file from its temporary location to a permanent path on your server, in this case, public/img. The callback runs once the move is complete (or if it fails), which is why the rest of the logic (saving the post to the database) happens inside it.
##
## 🟨 1. Code From Previous Chapter

We use the code from the previous chapter before updating it.

- **Chapter 6:** `public`, `views`, `index.js`, `package.json`, `models/BlogPost.js`
> **Important:** This chapter builds on the existing project, so make sure the previous chapter is completed before continuing.


## 🟨 2. Prerequisites / Install
**Install the express-fileupload package:** `standard Express applications cannot handle file uploads natively without an external middleware library`

```
npm install --save express-fileupload
```

## 🟨 3. File Structure
The relevant files touched or added in this chapter are:

```text
chapter7/
├── models/
│   └── BlogPost.js       (schema updated: +image)
├── public/
│   └── img/              (uploaded images saved here)
├── views/
│   ├── create.ejs        (added file input + enctype)
│   └── post.ejs          (renders blogpost.image as background)
└── index.js              (fileUpload middleware + /posts/store update)
```

> 💡 **Note:** Make sure to manually create the `img` folder inside your `public` directory. This folder is required to store the images that you upload for your blog posts. If this folder is missing, your server will throw an error when trying to save uploaded files.


**Important Changes**
- **models/BlogPost.js** added an **image field (String)** to store the uploaded image's file path
- **views/create.ejs**  added a **file input field** (<input type="file" name="image">) and set the form's **enctype to multipart/form-data**
- **views/post.ejs** updated the header's background image to use **blogpost.image** dynamically instead of a hardcoded path
- **index.js**  registered the **express-fileupload middleware** and updated the /posts/store route to move the uploaded file into **public/img** and save its path to the database

## 🟨4. Final Code
**views/create.ejs** (This how your file should look like after updating it with the file input )
```html
<form action="/posts/store" method="POST" enctype="multipart/form-data">
    <div class="form-floating">
        <input type="text" class="form-control" placeholder="Title" id="title" name="title">
        <label for="title">Title</label>
    </div>

    <div class="form-floating">
        <textarea rows="5" class="form-control" id="body" name="body" placeholder="Description"></textarea>
        <label for="body">Description</label>
    </div>

    <div class="form-floating">
        <input type="file" class="form-control" id="image" name="image">
        <label for="image">Image</label>
    </div>
    <br />

    <!-- Submit Button-->
    <button class="btn btn-primary text-uppercase" id="submitButton" type="submit">Send</button>
</form>
```
**models/BlogPost.js** (add image field)
```javascript
const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const BlogPostSchema = new Schema({
    title: String,
    body: String,
    username: String,
    datePosted: {
        type: Date,
        default: Date.now
    },
    image: String
});

const BlogPost = mongoose.model('BlogPost', BlogPostSchema);
module.exports = BlogPost
```

**index.js** (register fileUpload + handle upload)

- After your require for the Blogpost **const BlogPost = require('./models/BlogPost.js')** add the require for express-fileupload **const fileUpload = require('express-fileupload')**
- After your express.urlencoded **app.use(express.urlencoded())** add the fileUpload **app.use(fileUpload())**
```javascript
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
```

- After updating the code above, update your **app.post('/posts/store', (req, res) => {** with the image 
```javascript
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
```
**views/post.ejs** (render uploaded image as background)
- To find the header, simply locate the opening <header class="masthead"> tag at the top of your file.
```html
<header class="masthead" style="background-image: url('<%= blogpost.image %>')">
  ...
</header>
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
      <td>create a post and attach an image</td>
    </tr>
    <tr>
      <td>http://localhost:4000/post/&lt;id&gt;</td>
      <td>view that post with the uploaded image as background</td>
    </tr>
  </tbody>
</table>

