var forum = function (req, res) {
	res.render('forum', { title: 'Forum', user: req.session.passport.user });
};

module.exports = forum;