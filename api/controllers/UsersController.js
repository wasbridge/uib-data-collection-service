/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var fs = require('fs');
var parse = require('csv-parse');
var async = require('async');

module.exports = {
	upload: function(req, res, next) {
		req.file('content').upload({
            dirname: '.tmp/'
        }, function uploadTemplateComplete(err, files) {
			if (err) return res.serverError(err);

			if (files.length === 0){
				return res.badRequest({
						success: false,
						message: "User list upload is invalid, no file found"
					});
			}

			var parser = parse({delimiter: ','}, function parseStream(err, data){
				if (err)
					return res.serverError(err);

				data.shift(0); //remove the header row
				
				var created = [];
				async.each(data, function parseRow(row, callback) {
					var userObj = {
						userName: row[0],
						password: row[1],
						admin: row.length > 2 && row[2] == 'true' ? true : false
					};

					Users.create(userObj).exec(function userCreated(err, user) {
						if (!err)
							created.push(user);
						callback(null, user);
					});
				}, function usersCreated(err, users) {
					if (err)
						return res.serverError(err);
					
					return res.ok({
						success: true,
						message: "Uploaded the following users, some may be duplicates and were skipped",
						users: created
					});
				});
			});

			var file = files[0].fd;
			fs.createReadStream(file).pipe(parser);
		});
	},

	erase: function(req, res, next) {
		var criteria = { admin: {"!": true} };
		Users.destroy(criteria) 
			.exec(function usersDestroyed(err, users) {
				if (err) return res.serverError(err);

				return res.ok({
					success: true,
					message: "Erased all users, now no one can login to the simulation but the administrators",
					users: users
				});
			});
	}	
};