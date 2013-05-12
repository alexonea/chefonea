var Database = require('../lib/database.js');
var db = new Database();

var sync = function (req, res) {
	var user = req.session.passport.user;

	if (user) {
		var uid = req.query['uid'];
		var wid = req.query['wid'];
		var data = req.query['data'];
		var name = req.query['name'];

		var result = new Object();
		result.code = 0;
		result.description = 'Success!';

		if (uid === user.id) {
			db.findWorkspace(wid, function (err, data) {
				if (!err) {
					if (data.length == 0) {
						/* not found, needs creation */
						db.addWorkspace({ uid: uid, data: data, lastupdate: new Date(), name: name}, function (err) {
							if (!err) {
								/* created */
								result.code = 0;
								result.description = 'Success!';
								res.write(result);
								res.end();
							} else {
								/* error on create */
								result.code = -3;
								result.description = 'Error on create';
								res.write(result);
								res.end();
							}
						});
					} else {
						/* found, needs update */
						var wsp = data[0];
						if (wsp.uid === uid) {
							/* permissions ok, will update */
								db.updateWorkspace(wid, data, new Date(), function () {
								result.code = 0;
								result.description = 'Success!';
								res.write(result);
								res.end();
							});
						} else {
							/* access denied */
							result.code = -2;
							result.description = 'Access denied!';
							res.write(result);
							res.end();
						}
					}
				} else {
					/* database error */
					result.code = -1;
					result.description = 'Database error!';
					res.write(result);
					res.end();
				}
			});
		} 
	}
};

module.exports = sync;