const db = require("../db");
const xss = require("xss");

module.exports = (req, res) => {
	const post_id = req.params.id;
	const post = db.db.posts.find(v => v.id == post_id);

	if (post == undefined) {
		res.redirect("/?msg=post_not_found");
		return;
	}

	if (post.deleted) {
		res.redirect("/?msg=post_deleted");
		return;
	}

	res.render("pages/post", { post: post, xss: xss(post.content) });
};