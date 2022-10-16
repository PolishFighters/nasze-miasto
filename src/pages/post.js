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

	const comments = db.db.comments.filter(v=>v.post==post_id);

	let processed_comments = [];

	for (let ci = 0; ci < comments.length; ci++) {
		const comment = comments[ci];
		const user = db.db.users.find(v=>v.id==comment.author);
		processed_comments.push({
			author: `${user.firstname} ${user.lastname}`,
			content: xss(comment.content)
		});
	}

	processed_comments.reverse();

	res.render("pages/post", { post: post, xss: xss(post.content), comments: processed_comments });
};