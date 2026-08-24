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
│   └── post.ejs           (single post detail)
└── index.js               (routes for list/create/store/show)
```
**Important Changes**
- BlogPost.js is updated with username and datePosted.
- create.ejs contains the **new blog post form.**
- index.ejs displays **all blog posts.**
- post.ejs displays **a single blog post.**
- index.js contains the routes for **listing, creating, storing, and displaying posts.**





