const sessions = require("../sessions");
const db = require("../db");

module.exports = (req, res) => {
	if (!sessions.logged_in(req)) {
		res.redirect("/login");
		return;
	}
	const content = req.body.content;
	if(content==undefined)
	{
		res.redirect("/post_error");
		return;
	}
	db.db.posts.push({
		id: db.db.posts.length + 10,
		content: content,
		likes: 0,
		deleted: false,
		author: sessions.user_from_session(req.cookies.session).id
	});
	db.save();
	res.redirect("/post_added");
};