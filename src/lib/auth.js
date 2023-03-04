module.exports = {

	isLoggedIn(req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		}
		return res.redirect("/login");
	},

	isNotLoggedIn(req, res, next) {
		if (!req.isAuthenticated()) {
			return next();
		}
		return res.redirect('/main');
	},

	isAdmin(req, res, next) {
		if (req.user.RANGO === "ADMIN") {
			return next();
		}
		return res.redirect('/main');
	}


}


