<p align="center">
  <strong><span style="color:#58A6FF;">Chapter 11: User Authentication with Express Sessions</span></strong><br>
  <strong><em><span style="color:#8B949E;">Beginning Node.js, Express & MongoDB Development</span></em></strong>
</p>

## Chapter Summary
This chapter adds real login state using `express-session`. On successful login, the user's id is stored in `req.session.userId`, which persists across requests via a browser cookie. Authentication middleware protects the `new-post/store-post` routes from logged-out users, and a second middleware redirects logged-in users away from login/register. The navbar conditionally shows New Post/Log out vs Login/New User based on session state, a logout route destroys the session, and a catch-all route renders a 404 page for unmatched URLs.
##
**Understanding Sessions & Cookies**
- A cookie is a small piece of data the browser stores and automatically sends back to the server with every request to that site.
- express-session uses this to store a signed session ID cookie (connect.sid) in the browser.
- The actual session data (like userId) is kept server-side, associated with that session ID.
- So the server can look at an incoming request's cookie and know which user is making it, that's how 'staying logged in' works across page loads.
- The secret option passed to **expressSession({ secret: '...' })** is used to sign the session ID cookie so it can't be tampered with by the browser or a third party.

<img width="688" height="305" alt="image" src="https://github.com/user-attachments/assets/6dd240c2-acf7-4f9a-9731-ddad4482012c" />


**Note: "hashed" vs "signed"**
- The book calls the connect.sid value a 'hashed value', but more precisely it's a SIGNED cookie, not a hash.
- The s: prefix (shown URL-encoded as s%3A) marks it as signed. Express uses the secret from **expressSession({ secret: '...' })** to generate a signature appended to the session ID, so if someone edits the cookie in their browser, the signature no longer matches and Express rejects it.
- This protects against tampering, not against being read — the cookie is not encrypted.
- Is this secure? Reasonably so for its purpose: the actual session data (like userId) lives server-side, not inside the cookie itself, the cookie is only a reference used to look that data up.
- However, its strength depends entirely on the secret string used to sign it.
- 'keyboard cat' is a tutorial placeholder; a real app should use a long, random, unguessable secret stored in an environment variable, never committed to source control.
- It also doesn't protect against the cookie being stolen over an unencrypted connection — that's what HTTPS and cookie flags like secure and httpOnly are for
##


##
## 🟨 1. Code From Previous Chapter

We use the code from the previous chapter before updating it.

- **Chapter 10:** `public`, `models`, `views`, `controllers`, `middleware`, `index.js`, `package.json`

> **Important:** This chapter builds on the existing project, so make sure the previous chapter is completed before continuing.

## 🟨 2. Prerequisites / Install
```text
npm install --save express-session
```

## 🟨 3. File Structure
The relevant files touched or added in this chapter are:
```text
chapter11/
├── controllers/
│   └── logout.js                            (new: destroys the session)
├── middleware/
│   ├── authMiddleware.js                    (new: blocks logged-out users)
│   └── redirectIfAuthenticatedMiddleware.js (new: blocks logged-in users from login/register)
├── views/
│   ├── layouts/
│   │   └── navbar.ejs                        (conditional links based on loggedIn)
│   └── notfound.ejs                          (new: 404 page)
└── index.js                                  (session middleware + route protection + catch-all 404)
```
## 🟨4. Final Code
**controllers/loginUser.js** (This how your file should look like after updating it with the req.session.userId)

```javascript
const bcrypt = require('bcrypt')
const User = require('../models/User')

module.exports = async (req, res) => {
    const { username, password } = req.body

    const user = await User.findOne({ username: username })

    if (!user) {
        return res.redirect('/auth/login')
    }

    const same = await bcrypt.compare(password, user.password)

    if (same) {
        req.session.userId = user._id
        return res.redirect('/')
    }

    res.redirect('/auth/login')
}
```
- **Important change:** `req.session.userId` is set here on successful login, this is the single line that turns a plain login check into a real session. It's `checked everywhere` the app needs to know if a user is logged in.
<br>

**middleware/authMiddleware.js** (This how your file should look like after updating it)

```javascript
const User = require('../models/User')

module.exports = async (req, res, next) => {
  const user = await User.findById(req.session.userId)

  if (!user) {
    return res.redirect('/')
  }

  next()
}
```

- **Important change:** this middleware protects `/posts/new and /posts/store`, logged-out users hitting either route are redirected to the home page instead of reaching the controller.
<br>

**middleware/redirectIfAuthenticatedMiddleware.js** (This how your file should look like after updating it)
```javascript
module.exports = (req, res, next) => {
  if (req.session.userId) {
    return res.redirect('/')
  }
  next()
}
```
- **Important change:** this middleware protects `/auth/register and /auth/login`, logged-in users are redirected to the home page instead of seeing those forms again.
<br>

**controllers/logout.js** (This how your file should look like after updating it)
```javascript
module.exports = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/')
  })
}
```
- **Important change:** this new route `destroys` the session with `req.session.destroy()` and redirects home, this is what makes the Log out link actually work.
<br>

**views/layouts/navbar.ejs** (This how your file should look like after updating it with conditional links)

- **Inside your navbar file, the `<div id="navbarResponsive">` container has been updated to include conditional links based on whether a user is logged in or not.**

```html
<!-- Navigation-->
<nav class="navbar navbar-expand-lg navbar-light" id="mainNav">
    <div class="collapse navbar-collapse" id="navbarResponsive">
        <ul class="navbar-nav ms-auto py-4 py-lg-0">
            <li class="nav-item"><a class="nav-link px-lg-3 py-3 py-lg-4" href="/">Home</a></li>

            <% if (loggedIn) { %>
            <li class="nav-item"><a class="nav-link px-lg-3 py-3 py-lg-4" href="/posts/new">New Post</a></li>
            <li class="nav-item"><a class="nav-link px-lg-3 py-3 py-lg-4" href="/auth/logout">Log out</a></li>
            <% } %>

            <% if (!loggedIn) { %>
            <li class="nav-item"><a class="nav-link px-lg-3 py-3 py-lg-4" href="/auth/login">Login</a></li>
            <li class="nav-item"><a class="nav-link px-lg-3 py-3 py-lg-4" href="/auth/register">New User</a></li>
            <% } %>
        </ul>
    </div>
</nav>
```
- **Important change:** the navbar now reads the global loggedIn variable to conditionally show New Post/Log out vs Login/New User. Since navbar.ejs is included on every page, this applies site-wide.
<br>

**index.js** (session middleware, loggedIn global, route protection, 404 catch-all)
```javascript
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


mongoose.connect('mongodb://localhost:27017/my_database')

//page 107
app.use(expressSession({ secret: 'keyboard cat', resave: false, saveUninitialized: false }))

//page 112
global.loggedIn = null
app.use('*', (req, res, next) => {
  loggedIn = req.session.userId
  next()
})

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(fileUpload()) //Page 80

app.use('/posts/store', validateMiddleware) //Page 93

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
block app.get('/post/:id', getPostController)

// --- 404 catch-all — must be LAST (page 115)---
app.use((req, res) => res.render('notfound'))

app.listen(4000, () => {
    console.log('App listening on port 4000')
})
```
**Important changes:**
- (1) a global loggedIn variable is set on every request via the wildcard middleware, making session state available to navbar.ejs and any other view;
- (2) the catch-all app.use((req, res) => res.render('notfound')) is placed AFTER every other route, so any unmatched URL renders a 404 page instead of Express's default error text, route order matters here;
- (3) resave: false and saveUninitialized: false were added to expressSession(...), not in the book, but a recommended addition **`(see Troubleshooting below)`**.

## Troubleshooting: Express Version Differences
- The book uses `app.use('*', (req, res, next) => {...})` for a wildcard middleware that runs on every request.
- Newer versions of Express (Express 5) upgraded their internal routing library (path-to-regexp), which now requires wildcard route patterns to be named a bare `'*'` throws a routing error.
- The fix is to use a named wildcard instead, such as `'/*splat'` (the name after * can be anything; 'splat' is a common convention).

```javascript
// Book version (breaks on Express 5)
app.use('*', (req, res, next) => { ... })

// Fixed version (Express 5 compatible)
app.use('/*splat', (req, res, next) => { ... })
```
- `expressSession({ secret: 'keyboard cat' })` alone will print deprecation warnings in newer express-session versions and can create unnecessary empty sessions for visitors who never log in.
- Adding `resave: false` (**don't re-save a session that wasn't modified**) and `saveUninitialized: false` (**don't create a session until something is actually stored in it**) is standard practice and silences the warnings.
##
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
      <td>http://localhost:4000/auth/login</td>
      <td>log in; navbar should change to show New Post / Log out</td>
    </tr>
    <tr>
      <td>http://localhost:4000/posts/new</td>
      <td>only accessible while logged in</td>
    </tr>
    <tr>
      <td>http://localhost:4000/post/auth/logout</td>
      <td>logs out, navbar reverts to Login / New User</td>
    </tr>
    <tr>
      <td>http://localhost:4000/post/anything-undefined</td>
      <td>renders the 404 notfound page</td>
    </tr>
  </tbody>
</table>
