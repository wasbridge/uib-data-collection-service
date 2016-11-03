/**
 * RunsController
 *
 * @description :: Server-side logic for managing runs
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var fs = require('fs');
var archiver = require('archiver');

module.exports = {

	store: function(req, res, next) {
		var blob = JSON.parse(req.param('blob'));
		var run = {
			blob: blob
		};

		Runs.create(run, function(err, run) {
      		if (err) return res.serverError(err);
      		return res.ok({message:"Created run with data", data: blob});
      	});
	},

	erase: function(req, res, next) {
		Runs.destroy()
			.exec(function(err) {
				return res.ok({message: "Erased all data"});
			});
	},

	download: function(req, res, next) {
		Runs.find().exec(function(err, runs) {
			if (err) return res.serverError(err);
			if (runs.length > 0) {
				return res.ok({message:"Found data", data: runs});
			} else  {
				return res.ok({message:"Found no data", data: runs});
			}
		});
	},

	_archiveData: function(fd, runs, next) {
		var output = fs.createWriteStream(fd);
		var archive = archiver('zip', {
		    store: true // Sets the compression method to STORE.
		});

		// listen for all archive data to be written
		output.on('close', function(err) {
			return next(err, fd)
		});

		// good practice to catch this error explicitly
		archive.on('error', function(err) {
			return next(err, null);
		});

		// pipe archive data to the file
		archive.pipe(output);

		//for each blob create a CSV file
		runs.forEach(function(run) {
			var blob = run.blob;
			var content = "";
			
			//each key gets it own row which will use the key for the label
			for (var key in blob) {
				var data = blob[key];
				content += key + ", ";

				//for overtime data only write out the values, not the time
				if (data instanceof Array) {
					data.forEach(function(value) {
						content += value.value + ", ";
					});
				} else {
					content += data;
				}
				//append for a new row
				content += "\n";
			}

			archive.append(content, { name: "data-record-" + run.id + ".csv" });
		});

		// finalize the archive (ie we are done appending files but streams have to finish yet)
		archive.finalize();
	}
};

