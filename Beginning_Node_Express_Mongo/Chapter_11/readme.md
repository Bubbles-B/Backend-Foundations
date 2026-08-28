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

**controllers/logout.js** (This how your file should look like after updating it)
```javascript
module.exports = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/')
  })
}
```
- **Important change:** this new route `destroys` the session with `req.session.destroy()` and redirects home, this is what makes the Log out link actually work.




