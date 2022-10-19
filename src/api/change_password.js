const sessions = require("../sessions");
const db = require("../db");
const crypto = require("crypto");
const recaptcha = require("../recaptcha");

const hash = data => {
	let sha = crypto.createHash("sha1");
	sha.update(data);
	return sha.digest("hex");
};

module.exports = (req, res) => {
	if (!sessions.logged_in(req)) {
		res.redirect("/login");
		return;
	}
	
	const old_password = req.body.old_password;
	const new_password = req.body.new_password;
	const confirm_new_password = req.body.confirm_new_password;

	const p1_hash = hash(new_password);
	const p2_hash = hash(confirm_new_password);

	if (p1_hash != p2_hash) {
		res.redirect("/me?msg=passwords_do_not_match");
		return;
	}

	const user_index = db.db.users.findIndex(v => v.email == email);
	const user = db.db.users[user_index];

	if(hash(old_password) != user.password)
	{
		res.redirect("/me?msg=passwords_do_not_match");
		return;
	}

	db.db.users[user_index].password = p2_hash;

	db.save();
	res.redirect("/me?msg=password_change_successful");
};