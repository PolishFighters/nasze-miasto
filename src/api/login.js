const sessions = require("../sessions");
const db = require("../db");
const crypto = require("crypto");

const hash = data => {
	let sha = crypto.createHash("sha1");
	sha.update(data);
	return sha.digest("hex");
};

module.exports = (req, res) => {
	if (sessions.logged_in(req)) {
		res.redirect("/?msg=already_logged_in");
		return;
	}
	const email = req.body.email;
	const password = req.body.password;
	const user = db.db.users.find(v => v.email == email);
	if (user == undefined) {
		res.redirect("/?msg=invalid_creds");
		return;
	}
	if (user.password != hash(password)) {
		res.redirect("/?msg=invalid_creds");
		return;
	}
	const sid = sessions.create_session(user);
	res.cookie("session", sid, { httpOnly: true });
	res.redirect("/");
};