var logout = function (req, res) {
	req.logout();
	res.render('index', { title: 'Matrix', user: false });	
};

module.exports = logout;