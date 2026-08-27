//Page 104
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
        // store user session, covered later
        return res.redirect('/')
    }

    res.redirect('/auth/login')
}