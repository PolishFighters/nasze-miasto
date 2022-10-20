const sessions = require("../sessions");
const db = require("../db");

module.exports = (req, res) => {
	if (!sessions.logged_in(req)) {
		res.redirect("/login");
		return;
	}

	const user = sessions.user_from_session(req.cookies.session);
	if (!user.admin) {
		res.redirect("/");
		return;
	}

	const {
		city,
		province,
		county
	} = req.body;

	db.db.cities.push({
		id: 0,
		name: city + ", " + county + ", " + province
	});

	db.save();
	res.redirect("/admin");
};
