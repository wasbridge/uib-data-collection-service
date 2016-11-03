/**
 * RunsController
 *
 * @description :: Server-side logic for managing runs
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var fs = require('fs');
var archiver = require('archiver');
var SkipperDisk = require('skipper-disk');

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
		var archiveFxn = this._archiveData;
		Runs.find().exec(function(err, runs) {
			if (err) return res.serverError(err);
			if (runs.length > 0) {
				var zipFile = 'experiment_data.zip';
	            var fd = require('path').resolve(sails.config.appPath, '.tmp/data-' + (new Date()).getTime()) + ".zip";
	            archiveFxn(fd, runs, function(err, fd) {
	            	if (err) return res.serverError(err);
	            	
	            	var fileAdapter = SkipperDisk();
	            	fileAdapter.read(fd)
		              .on('error', function (err) {
	    	            return res.serverError(err);
	        	      })
	        		  .pipe(res.attachment(zipFile).type('application/zip'));
	            });
			} else  {
				return res.ok({message:"Found no data", data: runs});
			}
		});
	},

	_archiveData: function(fd, runs, next) {
		var writeArray = function(key, arr) {
			var ret = [];
			var subKeys = key == "pageArrivals" ? ["page", "time"] : ["value"];

			subKeys.forEach(function(subKey) {
				var row = ["\"" + key + " - " + subKey + "\""];
				arr.forEach(function(item) {	
					row.push(item[subKey]);
				});
				ret.push(row);
			});
			return ret;
		};

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
			var content = [];
			
			//each key gets it own row which will use the key for the label
			for (var key in blob) {
				var data = blob[key];
				if (data instanceof Array) {
					var arrRows = writeArray(key, data);
					arrRows.forEach(function(row) {
						content.push(row);
					});
				} else {
					content.push(["\"" + key + "\"", data]);
				}
			}

			var string = "";
			content.forEach(function(row) {
				string += row.join(", ") + "\n";
			});

			archive.append(string, { name: "experiment_data/data-record-" + run.id + ".csv" });
		});

		// finalize the archive (ie we are done appending files but streams have to finish yet)
		archive.finalize();
	}
};

