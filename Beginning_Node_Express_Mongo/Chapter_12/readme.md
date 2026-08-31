<p align="center">
  <strong><span style="color:#58A6FF;">Chapter 12: Showing Validation Errors</span></strong><br>
  <strong><em><span style="color:#8B949E;">Beginning Node.js, Express & MongoDB Development</span></em></strong>
</p>

## Chapter Summary
This chapter makes registration errors visible to the user instead of silently redirecting. Mongoose's validation error object is parsed into `readable messages`, passed to the view via connect-flash **`(a one-time, self-clearing session area)`**, and displayed in red above the form. mongoose-unique-validator turns duplicate-username crashes into a normal validation error, required field messages are customized to be user-friendly, and the form's previously entered values are preserved on failed submission instead of being cleared.
##

**Understanding Flash Messages**
- A flash message is data stored in the session for exactly one request cycle, then automatically cleared. That's different from `req.session.someValue`, which persists indefinitely until you delete it yourself.
- **The flow:** `req.flash('key', value)` stores something just before a redirect.
- On the very next request (the page the user lands on), req.flash('key') reads that value back AND deletes it at the same time.
- If the user refreshes that page again, the value is gone, which is exactly the behavior you want for one-time error messages: **show them once**, then don't keep nagging the user every time they revisit the page.

##
## 🟨 1. Code From Previous Chapter

We use the code from the previous chapter before updating it.

- **Chapter 11:** `public`, `models`, `views`, `controllers`, `middleware`, `index.js`, `package.json`

> **Important:** This chapter builds on the existing project, so make sure the previous chapter is completed before continuing.


## 🟨 2. Prerequisites / Install
```text
npm install --save mongoose-unique-validator
npm install connect-flash
```

## 🟨 3. File Structure
The relevant files touched or added in this chapter are:

```text
chapter12/
├── controllers/
│   ├── newUser.js       (passes flashed errors + old form data to the view)
│   └── storeUser.js     (parses validation errors, flashes them)
├── models/
│   └── User.js          (uniqueValidator plugin + custom error messages)
├── views/
│   └── register.ejs     (displays error list + preserves entered values)
└── index.js             (connect-flash middleware registered)
```


## 🟨4. Final Code
**models/User.js** (unique validator + custom messages)

**Note:** the book's require('mongoose-unique-validator') assumes an older package version. Newer versions ship the plugin under a .default export, so a plain require() returns an object instead of the plugin function, causing schema.plugin() to throw. The line below handles both versions.

```javascript
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const uniqueValidator = require('mongoose-unique-validator').default || require('mongoose-unique-validator')
const bcrypt = require('bcrypt')

const UserSchema = new Schema({
  username: {
    type: String,
    required: [true, 'Please provide username'],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Please provide password']
  }
})

UserSchema.plugin(uniqueValidator)

UserSchema.pre('save', async function () {
  const user = this
  const hash = await bcrypt.hash(user.password, 10)
  user.password = hash
})

const User = mongoose.model('User', UserSchema)
module.exports = User
```

**Important changes:** 

- **(1) UserSchema.plugin(uniqueValidator)** turns a duplicate username into a normal Mongoose `ValidationError` instead of a raw MongoDB E11000 crash, this is what lets the duplicate-username case be caught and displayed the same way as any other field error.
- **(2) the required arrays ([true, 'message'])*** provide the friendly text shown to the user instead of Mongoose's default technical message.
- **(3) require('mongoose-unique-validator').default || require('mongoose-unique-validator')** safely handles both old and new versions of the package, since your installed version exports the plugin under .default rather than as the module itself.
<br>

**controllers/storeUser.js** (async/await, with flashed errors + preserved form data)

This controller handles user registration by attempting to create a new database record and gracefully managing input validation failures:
```javascript
const User = require('../models/User.js')

module.exports = async (req, res) => {
  try {
    await User.create(req.body)
    res.redirect('/')
  } catch (error) {
    const validationErrors = Object.keys(error.errors).map(
      key => error.errors[key].message
    )
    req.flash('validationErrors', validationErrors)
    req.flash('data', req.body)
    return res.redirect('/auth/register')
  }
}
```
*   **User Creation:** It attempts to create a new user record in MongoDB using the form data submitted in `req.body`. On success, it redirects the user to the homepage (`/`).
*   **Error Extraction (Mapping):** If the input fails database validation rules (e.g., duplicate username or missing fields), the `catch` block intercepts the Mongoose error object. It loops through the errors using JavaScript's `.map()` method to extract only the human-readable message strings into a flat array.
*   **Session Flash Storage:** The array of error messages is saved into session memory via `req.flash('validationErrors')` to be displayed on the frontend. Concurrently, `req.flash('data', req.body)` saves the submitted form data.
*   **Form Repopulation & Redirect:** Finally, the browser is redirected back to `/auth/register`. This reloads the signup page, displays the flash error alerts, and uses the flashed data to automatically repopulate the input fields so the user doesn't have to retype their username.
<br>

**controllers/newUser.js** (reads flashed errors + old form data)

This middleware controls the logic for rendering the sign-up page, ensuring that both fresh visitors and users with failed registration attempts see the correct form data:
```javascript
module.exports = (req, res) => {
  var username = ''
  var password = ''
  const data = req.flash('data')[0]

  if (typeof data != 'undefined') {
    username = data.username
    password = data.password
  }

  res.render('register', {
    errors: req.flash('validationErrors'),
    username: username,
    password: password
  })
}
```
*   **Initialization:** It sets default empty strings for the `username` and `password` variables so that standard, first-time visitors don't see raw `undefined` or `null` values inside the HTML form text inputs.
*   **Array Extraction:** Because `req.flash('data')` retrieves items stored in an array wrapper, it grabs the first index (`[0]`) to isolate the actual user input data object.
*   **Condition Check:** If the data array contains a previous failed form submission object (meaning its type is not `undefined`), the controller overrides the empty strings with the user's previously typed username and password.
*   **View Rendering:** It displays the `register` template view file, safely passing the validation error messages along with the preserved input values so the user can see what went wrong without losing their typed inputs.
<br>


**views/register.ejs** (error list + persisted values)

This EJS template renders the registration form, conditionally loops through any flashed validation error messages, and repopulates the input fields using the values passed from the controller:

```html
<div class="container">
  <div class="row">
    <div class="col-lg-8 col-md-10 mx-auto">
      <% if (errors != null && errors.length > 0) { %>
      <ul class="list-group">
        <% for (var i = 0; i < errors.length; i++) { %>
        <li class="list-group-item list-group-item-danger"><%= errors[i] %></li>
        <% } %>
      </ul>
      <% } %>

      <form action="/users/register" method="POST">
        <input type="text" class="form-control" placeholder="User Name"
          name="username" value="<%= username %>">
        <input type="password" class="form-control" placeholder="Password"
          name="password" value="<%= password %>">
      </form>
    </div>
  </div>
</div>
```

*   **Error Banner Placement:** The template conditionally checks if the `errors` array exists and contains items. If errors are present, they are dynamically rendered using a Bootstrap `.list-group` layout. This block should always be placed inside the main wrapping container, positioned directly above the `<form>` tag so notifications remain visually tied to the fields.
*   **Data Persistence Layer:** The `value="<%= username %>"` and `value="<%= password %>"` attributes are critical. While the controller grabs the data from flash storage, these attributes inject those strings directly back into the HTML input elements. This ensures users do not lose their typed progress if a registration attempt is rejected.
*   **Bootstrap Structural Adaptations:**
    *   **Floating Labels:** If using modern Bootstrap `.form-floating` classes, the `value` attribute belongs directly on the `<input>` element. The ordering of element attributes does not affect its behavior:
        ```html
        <div class="form-floating">
          <input type="text" class="form-control" placeholder="User Name" id="username" name="username" value="<%= username %>">
          <label for="username">User Name</label>
        </div>
        ```
    *   **Template Clean-up:** Ensure all legacy placeholder text or copy inherited from generic contact form baselines (e.g., *"Want to get in touch?"*) is removed or refactored to match a user registration profile flow.
<br>

**index.js** (connect-flash registered)

This registers the flash messaging middleware within the Express application lifecycle, enabling temporary session-based data storage across page redirects:

```javascript
const flash = require('connect-flash')

app.use(flash())
```

*   **Middleware Registration Order:** The placement of `app.use(flash())` is strictly order-dependent. It **must** be registered after the `express-session` middleware because flash storage relies on an active session instance to save data temporarily.
*   **Routing Lifecycle placement:** It must be initialized **before** any application router or route handlers that call `req.flash(...)`. This guarantees that the flash helper methods are bound to the incoming request object before the controllers execute.

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
      <th align="left">What to do</th>
      <th align="left">Results</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>http://localhost:4000/auth/register</td>
      <td>Then Submit blank </td>
      <td>'Please provide username' / 'Please provide password' shown in red</td>
    </tr>
    <tr>
      <td>http://localhost:4000/auth/register</td>
      <td>Submit a duplicate username</td>
      <td>a friendly duplicate-username error, not a crash</td>
    </tr>
    <tr>
      <td>http://localhost:4000/auth/register</td>
      <td>Refresh the page after an error</td>
      <td>errors disappear (flash cleared), form fields stay filled</td>
    </tr>
  </tbody>
</table>

