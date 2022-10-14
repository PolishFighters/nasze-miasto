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
    const 
    {
        first_name,
        last_name,
        email,
        password,
        confirm_password,
     } = req.body;

	const user = db.db.users.find(v => v.email == email);
    if(confirm_password != password) {
        res.redirect("/singup?msg=passwords_do_not_match");
		return;
    }

	if (user != undefined) {
		res.redirect("/singup?msg=address_is_not_available");
		return;
	}

    db.db.users.push({
        id: 0,
        firstname: first_name,
        lastname: last_name,
        email: email,
        password: hash(password),
        liked: []
    });
    db.save();
    db.load();
	res.redirect("/");
};