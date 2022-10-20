const sessions = require("../sessions");
const db = require("../db");

module.exports = (req, res) => {
	if (!sessions.logged_in(req)) {
		res.redirect("/");
		return;
	}

	const post_id = req.query.post;
	const user = sessions.user_from_session(req.cookies.session);
	const post_index = db.db.posts.findIndex(v => v.id == post_id);
	const post = db.db.posts[post_index];

	if (post_index < 0) {
		res.redirect("/");
		return;
	}

	if (post.author != user.id && !user.admin) {
		res.redirect("/post/" + post_id);
		return;
	}

	db.db.posts[post_index].deleted = true;

	db.save();
	res.redirect("/");
};