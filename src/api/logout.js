const sessions = require("../sessions");

module.exports = (req, res) => {
	if (!sessions.logged_in(req)) {
		res.redirect("/?msg=already_logged_out");
		return;
	}
	sessions.remove_session(req.cookies.session);
	res.cookie("session", "", { httpOnly: true });
	res.redirect("/");
};