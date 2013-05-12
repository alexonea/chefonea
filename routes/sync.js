var Database = require('../lib/database.js');
var db = new Database();

var sync = function (req, res) {
	var user = req.session.passport.user;

	if (user) {
		var uid = req.query['uid'];
		var wid = req.query['wid'];
		var data = req.query['data'];
		var name = req.query['name'];

		var result = {};
		result.code = 0;
		result.description = 'Success!';
		result.workspace = {};

		if (uid === user.id) {
			db.findWorkspace(wid, function (err, alex) {
				if (!err) {
					if (alex.length == 0) {
						/* not found, needs creation */
						db.addWorkspace({ uid: uid, data: data, lastupdate: new Date(), name: name, _id: db.ObjectId()}, function (err, object) {
							if (!err) {
								/* created */
								console.log(err);
								console.log(object);
								result.code = 0;
								result.description = 'Success!';
								result.workspace.wid = object._id;
								result.workspace.data = object.data;
								result.workspace.lastupdate = object.lastupdate;
								result.workspace.name = object.name;
								res.write(JSON.stringify(result));
								res.end();
							} else {
								/* error on create */
								result.code = -3;
								result.description = 'Error on create';
								res.write(JSON.stringify(result));
								res.end();
							}
						});
					} else {
						/* found, needs update */
						var wsp = alex[0];
						if (wsp.uid === uid) {
							/* permissions ok, will update */

							wsp.lastupdate = new Date();
							wsp.name = name;
							wsp.data = data;
							wsp.save(function (err) {
								result.code = 1;
								result.description = 'Success!';
								result.workspace.wid = wsp._id;
								result.workspace.data = wsp.data;
								result.workspace.lastupdate = wsp.lastupdate;
								result.workspace.name = wsp.name;
								res.write(JSON.stringify(result));
								res.end();
							});
						} else {
							/* access denied */
							result.code = -2;
							result.description = 'Access denied!';
							res.write(JSON.stringify(result));
							res.end();
						}
					}
				} else {
					/* database error */
					result.code = -1;
					result.description = 'Database error!';
					res.write(JSON.stringify(result));
					res.end();
				}
			});
		} 
	}
};

module.exports = sync;