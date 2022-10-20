const sessions = require("../sessions");
const db = require("../db");

module.exports = (req, res) => {
	if (!sessions.logged_in(req)) {
		res.redirect("/login");
		return;
	}

	const user = sessions.user_from_session(req.cookies.session);
	if (!user.admin) {
		res.redirect("/post/"+req.query.post);
		return;
	}

	const comment_id = req.query.comment;
	const comment_index = db.db.comments.findIndex(v => v.id == comment_id);

	if(comment_index < 0)
	{
		res.redirect("/post/"+req.query.post);
		return;
	}

	db.db.comments[comment_index].deleted = true;
	db.save();
	res.redirect("/post/"+req.query.post);
};