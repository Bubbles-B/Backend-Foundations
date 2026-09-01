const BlogPost = require('../models/BlogPost.js')

module.exports = async (req, res) => {
    const blogpost = await BlogPost.findById(req.params.id).populate('userid'); //Page 130
    console.log(blogpost)
    res.render('post', {
        blogpost
    });
}