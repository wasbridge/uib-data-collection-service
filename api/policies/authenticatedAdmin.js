module.exports = function(req, res, next) {
	var user = req.user && req.user.length > 0 ? req.user[0] : null;
	req.session.user = user;
	
	if(req.isAuthenticated()) {
		if (user && user.admin)
			return next();
	}

	return res.redirect('/login');
};