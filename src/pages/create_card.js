const sessions = require("../sessions");
module.exports = (req, res) => {
	if(!sessions.logged_in(req)){
		res.redirect("/login");
		return;
	}
	res.render("pages/create_card");
};