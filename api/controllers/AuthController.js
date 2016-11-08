var passport = require('passport');

module.exports = {

    _config: {
        actions: false,
        shortcuts: false,
    },

    admin: function(req, res) {
        return res.view('admin/actions');
    },

    status: function(req, res) {
        var user = req.user && req.user.length > 0 ? req.user[0] : null;
        return res.ok({
            isLoggedIn: user ? true : false,
            user: user
        });
    },

    login: function(req, res) {
        var redirect = req.param('redirect');
        passport.authenticate('local', function(err, user, info) {

            if ((err) || (!user)) {
                if (redirect) {
                    return res.redirect('/login');
                } else {
                    return res.ok({
                        success: false,
                        message: info.message,
                        user: user
                    });
                }
            }
            req.logIn(user, function(err) {
                if (err) {
                    if (redirect) {
                        return res.redirect('/login');
                    } else {
                        return res.ok({
                            success: false, 
                            message: "Login error", 
                            err: err
                        });
                    }
                }

                if (redirect) {
                    return res.redirect(redirect);
                }
                
                return res.ok({
                	success: true,
                    message: "Logged in successfully",
                    user: user
                });
            });
        })(req, res);
    },

    logout: function(req, res) {
        var redirect = req.param('redirect');
        req.logout();
        if (redirect) {
            return res.redirect(redirect);
        } else {
            return res.ok({
                success: true,
                message: "Successfully logged out"
            });
        }
    }
};