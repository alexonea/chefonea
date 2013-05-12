var DATABASE_URI = process.env.MONGOLAB_URI.toString().trim() || null;

var mongoose = require('mongoose');
var db = mongoose.connect(DATABASE_URI || 'mongodb://localhost/modess');

var user = mongoose.Schema({
	id: String,
	name: String,
	email: String,
	photo: String,
	type: {
		type: String, enum: ['admin', 'basic'], 
		default: 'basic'
	}
});

var workspace = mongoose.Schema({
	_id: String,
	uid: String,
	name: String,
	data: String,
	lastupdate: Date
});

mongoose.connection.once('open', function (err) {
	console.log('Connected to database!');
});

var User = db.model('user', user);
var Workspace = db.model('workspace', workspace);

function Database() {
	var database = {};

	/* add user to database */
	database.addUser = function (options, cb) {
		var user = new User(options);

		user.save(cb);
	}

	/* get users from database */
	database.findUser = function (options, cb) {
		if (typeof options == 'string') options = {id: options};
		if (typeof options == 'undefined') options = {};
		User.find(options, cb);
	}

	/* get all workspaces matching the options */
	database.findWorkspace = function (options, cb) {
		if (typeof options == 'string') options = {_id: options};
		if (typeof options == 'undefined') options = {};
		Workspace.find(options, cb);
	}

	/* add a new workspace */
	database.addWorkspace = function (options, cb) {
		var workspace = new Workspace(options);

		workspace.save(cb);
	}

	database.updateWorkspace = function (workspace_id, new_data, new_name, time, cb) {
		console.log('update');
		Workspace.update({ _id: workspace_id }, { data: new_data, name: 'alex', lastupdate: time }, cb);
	}

	database.ObjectId = function () {
		return (new mongoose.Types.ObjectId()).valueOf();
	};

	return database;
}


module.exports = Database;