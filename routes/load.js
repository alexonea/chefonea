var Database = require('../lib/database.js');
var db = new Database();

var load = function (req, res) {
	var uid = req.query['uid'];
	var wid = req.query['wid'];

	var query = {};
	query.uid = uid;
	if (wid && wid != 'undefined') {
		query._id = wid;
	}

	var result = new Object();
	result.code = 0;
	result.description = '';
	result.data = [];

	if (uid === req.session.passport.user.id) {

		db.findWorkspace(query, function (err, data) {
			if (!err) {
				/* success */
				for (var i = data.length - 1; i >= 0; i--) {
					result.data.push(data[i]);
				};
				res.write(JSON.stringify(result));
				res.end();
			} else {
				/* error */
				console.log(err);
				result.description = err;
				result.code = -1;
				res.end(JSON.stringify(result));
			}
		});
	} else {
		result.code = -2;
		result.description = 'invalid user';
		res.end(JSON.stringify(result));
	}

};

module.exports = load;