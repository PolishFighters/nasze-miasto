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
		res.redirect("/create_post?msg=captcha_failed");
		return;
	}

	const {
		title,
		content,
		city
	} = req.body;
	if (title == undefined) {
		res.redirect("/create_post?msg=no_title");
		return;
	}
	if (content == undefined) {
		res.redirect("/create_post?msg=no_content");
		return;
	}
	if (city == undefined) {
		res.redirect("/create_post?msg=no_city");
		return;
	}

	const city_exists = db.db.cities.find(v => v.name == city) != undefined;
	if (!city_exists) {
		res.redirect("/create_post?msg=city_doesnt_exits");
		return;
	}

	db.db.posts.push({
		id: 0,
		content: content,
		likes: 0,
		deleted: false,
		author: sessions.user_from_session(req.cookies.session).id,
		title: title,
		created_at: new Date(Date.now()),
		city: city
	});

	db.save();

	res.redirect("/");
};