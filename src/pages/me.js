const db = require("../db");
const sessions = require("../sessions");
module.exports = (req, res) => {
	if (!sessions.logged_in(req)) {
		res.redirect("/login");
		return;
	}
	const user = sessions.user_from_session(req.cookies.session);
	const posts = db.db.posts.filter(v => v.author == user.id).sort((a, b) => a.created_at.getMilliseconds() - b.created_at.getMilliseconds());
	res.render("pages/me", { posts: posts });
};