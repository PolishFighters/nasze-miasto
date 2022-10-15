const fetch = require("sync-fetch");
module.exports = (id) => {
	if (process.env.NODE_ENV != "production") {
		// Running on dev
		return true;
	}
	let response = fetch("https://www.google.com/recaptcha/api/siteverify", {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: `response=${id}&secret=${process.env.RECAPTCHA_SECRET}`/*{ secret: secret, response: id }*/
	});
	//console.log(JSON.stringify(response));
	return response.json().success;
};