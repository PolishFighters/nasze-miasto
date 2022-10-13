const db = require("../db");
const sessions = require("../sessions");

module.exports = (req, res) => {
    
    if (!sessions.logged_in(req)) {
		res.redirect("/login");
		return;
	}
    

    const { textarea } = req.body;

    if(db.add_post(textarea, sessions.get_session(req.cookies.session).uid ))
    {
        res.redirect("/errorCard");
    }
    else
    {
        res.redirect("/addedCard");
    }
};