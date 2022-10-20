const sessions = require("../sessions");
const db = require("../db");
const recaptcha = require("../recaptcha");

module.exports = (req, res) => {
	if (!sessions.logged_in(req)) {
		res.redirect("/login");
		return;
	}
	const cresponse = req.body["g-recaptcha-response"];
	if (!recaptcha(cresponse)) {
		res.redirect("/post/" + post_id + "?msg=captcha_failed");
		return;
	}

	const content = req.body.content;
	const post_id = req.body.post_id;
	const post_exists = db.db.posts.find(v => v.id == post_id) != undefined;
	
	if(!post_exists) {
		res.redirect("/?msg=post_doesnt_exist");
		return;
	}
	
	db.db.comments.push({
		id: 0,
		author: sessions.user_from_session(req.cookies.session).id,
		post: post_id,
		content: content,
		deleted: false
	});
	db.save();
	res.redirect("/post/" + post_id);
};