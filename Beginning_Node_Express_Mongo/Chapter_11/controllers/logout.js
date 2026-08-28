//page 114
module.exports = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/')
    })
}