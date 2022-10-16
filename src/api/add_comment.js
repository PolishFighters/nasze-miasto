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
		res.redirect("/post/" + post_id + "?msg=captcha_failed");
		return;
	}

	const content = req.body.content;
	const post_id = req.body.post_id;
	const post_exists = db.db.posts.find(v => v.id == post_id) != undefined;
	
	if(!post_exists) {
		res.redirect("/?msg=post_doesnt_exist");
		return;
	}
	
	db.db.comments.push({
		id: 0,
		author: sessions.user_from_session(req.cookies.session).id,
		post: post_id,
		content: content,
		deleted: false
	});
	db.save();
	res.redirect("/post/" + post_id);
};

// TypeError: Cannot read properties of undefined (reading 'author')
//     at Object.save (d:\Gameefan\Visual Studio Code Projects\nasze-miasto\src\db.js:257:20)
//     at module.exports (d:\Gameefan\Visual Studio Code Projects\nasze-miasto\src\api\add_comment.js:32:5)
//     at Layer.handle [as handle_request] (d:\Gameefan\Visual Studio Code Projects\nasze-miasto\node_modules\express\lib\router\layer.js:95:5)
//     at next (d:\Gameefan\Visual Studio Code Projects\nasze-miasto\node_modules\express\lib\router\route.js:144:13)
//     at Route.dispatch (d:\Gameefan\Visual Studio Code Projects\nasze-miasto\node_modules\express\lib\router\route.js:114:3)
//     at Layer.handle [as handle_request] (d:\Gameefan\Visual Studio Code Projects\nasze-miasto\node_modules\express\lib\router\layer.js:95:5)
//     at d:\Gameefan\Visual Studio Code Projects\nasze-miasto\node_modules\express\lib\router\index.js:284:15
//     at Function.process_params (d:\Gameefan\Visual Studio Code Projects\nasze-miasto\node_modules\express\lib\router\index.js:346:12)
//     at next (d:\Gameefan\Visual Studio Code Projects\nasze-miasto\node_modules\express\lib\router\index.js:280:10)
//     at Function.handle (d:\Gameefan\Visual Studio Code Projects\nasze-miasto\node_modules\express\lib\router\index.js:175:3)