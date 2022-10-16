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
	if (sessions.logged_in(req)) {
		res.redirect("/signup?msg=already_logged_in");
		return;
	}
	
	const cresponse = req.body["g-recaptcha-response"];
	if(!recaptcha(cresponse)) {
		res.redirect("/signup?msg=captcha_failed");
		return;
	}

	const {
		first_name,
		last_name,
		email,
		password,
		confirm_password,
	} = req.body;

	if (password != confirm_password) {
		res.redirect("/signup?msg=passwords_do_not_match");
		return;
	}

	const user = db.db.users.find(v => v.email == email);
	if (user != undefined) {
		res.redirect("/signup?msg=address_is_not_available");
		return;
	}

	db.db.users.push({
		id: 0,
		firstname: first_name,
		lastname: last_name,
		email: email,
		password: hash(password),
		liked: [],
		admin: false
	});

	db.save();

	res.redirect("/login");
};