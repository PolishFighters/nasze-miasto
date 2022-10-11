const db = require("./db");
const uuid = require("uuid4");

module.exports = {
	sessions: [],
	create_session: (user) => {
		const sid = uuid();
		let session_object = {
			sid: sid,
			uid: user.id
		};
		module.exports.sessions.push(session_object);
		return sid;
	},
	remove_session: (sid) => {
		const session_index = module.exports.sessions.findIndex(v => v.sid == sid);
		if (session_index < 0) return;
		module.exports.sessions.splice(session_index, 1);
	},
	get_session: (sid) => {
		return module.exports.sessions.find(v => v.sid == sid);
	},
	user_from_session: (sid) => {
		const s = module.exports.get_session(sid);
		if(s==undefined) return undefined;
		return db.db.users.find(v=>v.id==s.uid);
	},
	logged_in: (req) => {
		return module.exports.get_session(req.cookies.session) != undefined;
	}
};