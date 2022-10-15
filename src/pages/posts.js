const db = require("../db");

module.exports = (req, res) => {
	res.render("pages/posts", { posts: db.db.posts });
};