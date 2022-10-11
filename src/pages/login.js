const sessions = require("../sessions");
module.exports = (req, res) => {
	if (sessions.logged_in(req)) {
		res.redirect("/?msg=already_logged_in");
		return;
	}
	res.render("pages/login.ejs");
};