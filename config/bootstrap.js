/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.bootstrap.html
 */

module.exports.bootstrap = function(cb) {

  console.log("Seeding Database");

  function createAdministrator(done) {
    console.log("Creating Administrator");
    sails.models.users.create({
      userName: 'admin',
      admin: true,
      password: 'uibdataadmin'
    }, function(err, user) {
      if (err) {
        console.log("Error: " + JSON.stringify(err));
        return done();
      }

      if (!user) {
        console.log("Failed to create admin");
        return done();
      }

      console.log("Created Admin:");
      console.log(JSON.stringify(user));
      return done();
    });
  };
  // It's very important to trigger this callback method when you are finished
  // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
  async.parallel([
    createAdministrator
  ], function() {
  	cb();
  });
};
