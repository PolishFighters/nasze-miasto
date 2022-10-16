const sessions = require("../sessions");
const db = require("../db");
const recaptcha = require("../recaptcha");

module.exports = (req, res) => {
	if (!sessions.logged_in(req)) {
		res.redirect("/login");
		return;
	}

	const cresponse = req.body["g-recaptcha-response"];
	if(!recaptcha(cresponse)) {
		res.redirect("/post_error?msg=captcha_failed");
		return;
	}

	const {
		title,
		content,
		city
	} = req.body;
	if(title==undefined)
	{
		res.redirect("/post_error?msg=no_title");
		return;
	}
	if(content==undefined)
	{
		res.redirect("/post_error?msg=no_content");
		return;
	}
	if(city==undefined)
	{
		res.redirect("/post_error?msg=no_city");
		return;
	}

	const is_city_exit = db.db.cities.find(v => v.name == city) != undefined;
	if(!is_city_exit)
	{
		res.redirect("/post_error?msg=city_doesnt_exits");
		return;
	}


			
	db.db.posts.push({
		id: db.db.posts.length + 10,
		content: content,
		likes: 0,
		deleted: false,
		author: sessions.user_from_session(req.cookies.session).id,
		title: title,
		created_at: new Date(Date.now()),
		city: city
	});
	db.save();
	
	res.redirect("/post_added");
};