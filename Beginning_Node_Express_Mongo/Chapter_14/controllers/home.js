const BlogPost = require('../models/BlogPost.js')

module.exports = async (req, res) => {
    const blogposts = await BlogPost.find({}).populate('userid'); //page 129
    console.log(req.session) //Page 109
    res.render('index', {
        blogposts
    });
}