const sessions = require("../sessions");
module.exports = (req, res) => {
	if(!sessions.logged_in(req)){
		res.redirect("/login");
		return;
	}
	const user = sessions.user_from_session(req.cookies.session);
	if(!user.admin) {
		res.redirect("/?msg=no_perms");
		return;
	}
	res.render("pages/admin");
};