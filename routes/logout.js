var logout = function (req, res) {
	req.logout();
	res.render(req.query['redirect'], { title: 'Matrix', user: false });	
};

module.exports = logout;