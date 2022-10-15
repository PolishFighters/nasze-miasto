const sessions = require("../sessions");
const db = require("../db");

module.exports = (req, res) => {
	if (!sessions.logged_in(req) || req.query.post == undefined) {
        res.redirect("/");
		return;
	}

    const post_id = req.query.post;
    const user_id =  sessions.user_from_session(req.cookies.session).id;
    const post_index = db.db.posts.findIndex(v => v.id == post_id)
    const user_index = db.db.users.findIndex(v => v.id == user_id);

    if(user_index == undefined || post_index == undefined){
        res.redirect("/");
        return;
    }

    const is_liked = db.db.users[user_index].liked.find(v => v == post_id) != undefined;
    if(is_liked){
        res.redirect("/");
        return;
    }

    db.db.users[user_index].liked.push(post_id);
    db.db.posts[post_index].likes++;
    db.save();

    res.redirect("/");
};