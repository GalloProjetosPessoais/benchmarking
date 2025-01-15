const attachUser = (req, res, next) => {
    const authUser = req.cookies.authUser;
    if (!authUser) {
        return res.redirect('/login');
    }
    res.locals.user = authUser;
    next();
};

module.exports = attachUser;
