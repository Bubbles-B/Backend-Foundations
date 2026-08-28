<p align="center">
  <strong><span style="color:#58A6FF;">Chapter 11: User Authentication with Express Sessions</span></strong><br>
  <strong><em><span style="color:#8B949E;">Beginning Node.js, Express & MongoDB Development</span></em></strong>
</p>

## Chapter Summary
This chapter adds real login state using `express-session`. On successful login, the user's id is stored in `req.session.userId`, which persists across requests via a browser cookie. Authentication middleware protects the `new-post/store-post` routes from logged-out users, and a second middleware redirects logged-in users away from login/register. The navbar conditionally shows New Post/Log out vs Login/New User based on session state, a logout route destroys the session, and a catch-all route renders a 404 page for unmatched URLs.

##
## 🟨 1. Code From Previous Chapter

We use the code from the previous chapter before updating it.

- **Chapter 10:** `public`, `models`, `views`, `controllers`, `middleware`, `index.js`, `package.json`

> **Important:** This chapter builds on the existing project, so make sure the previous chapter is completed before continuing.
