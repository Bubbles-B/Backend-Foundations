<p align="center">
  <strong><span style="color:#58A6FF;">Chapter 8: INTRODUCTION TO EXPRESS MIDDLEWARE</span></strong><br>
  <strong><em><span style="color:#8B949E;">Beginning Node.js, Express & MongoDB Development</span></em></strong>
</p>

## Chapter Summary
This chapter explains `Express middleware functions` that run between an incoming request and the final response, 
executed in the order they're declared via **app.use()**. It shows how to write a custom middleware, and builds a validation middleware 
that checks for missing form fields (**like a missing image or title**) and redirects the user back to the **create-post form** instead of 
letting the app crash.

##
## 🟨 1. Code From Previous Chapter

We use the code from the previous chapter before updating it.

- **Chapter 7:** `public`, `views`, `index.js`, `package.json`, `models`

> **Important:** This chapter builds on the existing project, so make sure the previous chapter is completed before continuing.


## 🟨 2. Prerequisites / Install
- No new packages needed, this chapter only adds custom middleware functions on top of Express, which is already installed.

## 🟨 3. File Structure
Only index.js is modified in this chapter:

```text
chapter8/
└── index.js   (custom middleware + validation middleware added)
```

**Important Changes**

- **customMiddleWare** added a `logging middleware` that runs on every request, printing `'Custom middle ware called'` to the console. **Registered with app.use(customMiddleWare)** right after fileUpload() and before all routes.
- **validateMiddleWare** added a `validation middleware` that checks if `req.files` or `req.body.title` is **missing**, and `redirects back to /posts/new` if so, instead of letting the app crash.
- **Scoped middleware registration** unlike customMiddleWare (which runs for every request), `validateMiddleWare is registered only for /posts/store` using **app.use('/posts/store', validateMiddleWare)**, so it doesn't affect any other routes.
- **Middleware order matters**  validateMiddleWare must be declared and registered after fileUpload() (since it reads req.files) and before the app.post('/posts/store', ...) route it's meant to protect.
- **Dead route removed** the old static app.get('/post', ...) handler was **deleted** since /post/:id now fully replaces it for viewing individual posts.


## 🟨4. Final Code
**index.js** (custom logging middleware + validation middleware)

- Define customMiddleWare and validateMiddleWare before registering them
- After app.use(fileUpload()), **register app.use(customMiddleWare)** `on page 85` and **app.use('/posts/store', validateMiddleWare)** `on page 86`
- **NB:** validateMiddleWare checks req.files to see if an image was uploaded. But req.files only exists on the request after fileUpload() has run and attached it. If validateMiddleWare were registered before fileUpload(), req.files would always be empty not because the user forgot to upload an image, but because the middleware that reads uploaded files simply hasn't run yet.

```javascript
...
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

//Page 86
const validateMiddleWare = (req, res, next) => {
    if (req.files == null || req.body.title == null) {
        return res.redirect('/posts/new')
    }
    next()
}
app.use('/posts/store', validateMiddleWare)
...
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
      <td>Submit the form without choosing an image ( it will redirect you back to the form)</td>
    </tr>
    <tr>
      <td>http://localhost:4000/post/new</td>
      <td>Resubmit with a picture included (post is created successfully)</td>
    </tr>
  </tbody>
</table>






