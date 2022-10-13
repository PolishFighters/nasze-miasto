const pg = require("pg");

const fallback_config = {
	user: "postgres",
	host: "localhost",
	database: "nasze-miasto",
	password: "root",
	port: "5432"
};

const pool_config = process.env.DATABASE_URL ? {
	connectionString: process.env.DATABASE_URL,
	ssl: { rejectUnauthorized: false }
} : fallback_config;

const pool = new pg.Pool(pool_config);

const decode = asc => {
	if (asc == undefined) {
		return undefined;
	}
	return decodeURIComponent(Buffer.from(asc, "base64").toString("utf-8"));
};

const encode = data => {
	if (data == undefined) {
		return undefined;
	}
	return Buffer.from(encodeURIComponent(data)).toString("base64");
};
let original_state = {
	users: [],
	posts: [],
};
module.exports = {
	db: {
		users: [
			{
				id: 0,
				firstname: "Jan",
				lastname: "Kowalski",
				email: "jkowalski@example.com",
				password: "ff174f1711656f0f640a0e66442dc58c6efb00d5",
				liked: [0, 1, 2]
			}
		],
		posts: [
			{
				id: 0,
				content: "",
				likes: 3243, //cache
				deleted: false,
				author: 0,
			}
		]
	},
	load: () => {
		pool.query("SELECT * FROM users").then(res=>{
			// Remove the sample user
			module.exports.db.users.pop();
			const rows = res.rows;
			for (let ri = 0; ri < rows.length; ri++) {
				const row = rows[ri];
				module.exports.db.users.push({
					id: row.id,
					firstname: decode(row.firstname),
					lastname: decode(row.lastname),
					email: decode(row.email),
					password: row.password,
					liked: row.liked.split(",").map(v=>parseInt(v) ?? -1)
				});
				// FIXME: Find a better way to clone an object
				original_state.users = JSON.parse(JSON.stringify(module.exports.db.users));
			}
		}).catch(err=>console.error(err));
		pool.query("SELECT * FROM posts").then(res=>{
			// Remove the sample user
			module.exports.db.posts.pop();
			const rows = res.rows;
			for (let ri = 0; ri < rows.length; ri++) {
				const row = rows[ri];
				module.exports.db.posts.push({
					id: row.id,
					content: decode(row.content),
					likes: row.likes,
					deleted: row.deleted,
					author: row.author
				});
			}
			// FIXME: Find a better way to clone an object
			original_state.posts = JSON.parse(JSON.stringify(module.exports.db.posts));
		}).catch(err=>console.error(err));
	},
	save: () => {
		let changes = [];

		for (let ui = 0; ui < module.exports.db.users.length; ui++) {
			const user = module.exports.db.users[ui];
			const old_index = original_state.users?.findIndex(v=>v.id==user.id) ?? -1;
			if(old_index < 0) {
				changes.push(`INSERT INTO users VALUES (NULL, '${encode(user.firstname)}', '${encode(user.lastname)}', '${encode(user.email)}', '${user.password}', '${user.liked.join(",")}')`);
				original_state.users.push({id: user.id, firstname: user.firstname, lastname: user.lastname, email: user.email, password: user.password, liked: user.liked});
				continue;
			}
			const old_version = original_state.users[old_index];
			if(old_version.firstname != user.firstname) {
				changes.push(`UPDATE users SET firstname='${encode(user.firstname)}' WHERE id=${user.id}`);
				original_state.users[old_index].firstname = user.firstname;
			}
			if(old_version.lastname != user.lastname) {
				changes.push(`UPDATE users SET lastname='${encode(user.lastname)}' WHERE id=${user.id}`);
				original_state.users[old_index].lastname = user.lastname;
			}
			if(old_version.email != user.email) {
				changes.push(`UPDATE users SET email='${encode(user.email)}' WHERE id=${user.id}`);
				original_state.users[old_index].email = user.email;
			}
			if(old_version.password != user.password) {
				changes.push(`UPDATE users SET password='${encode(user.password)}' WHERE id=${user.id}`);
				original_state.users[old_index].password = user.password;
			}
			const liked_old_rep = old_version.liked.join(",");
			const liked_rep = user.liked.join(",");
			if(liked_old_rep != liked_rep) {
				changes.push(`UPDATE users SET liked='${liked_rep}' WHERE id=${user.id}`);
				original_state.users[old_index].liked = JSON.parse(JSON.stringify(user.liked));
			}
		}

		for (let pi = 0; pi < module.exports.db.posts.length; pi++) {
			const post = module.exports.db.posts[pi];
			const old_index = original_state.posts?.findIndex(v=>v.id==post.id) ?? -1;
			if(old_index < 0) {
				changes.push(`INSERT INTO posts VALUES (NULL, '${encode(post.content)}', ${post.likes}, ${post.deleted}, ${post.author})`);
				original_state.posts.push({id: post.id, content: post.content, likes: post.likes, deleted: post.deleted, author: post.author});
				continue;
			}
			const old_version = original_state.posts[old_index];
			if(old_version.content != post.content) {
				changes.push(`UPDATE posts SET content='${encode(post.content)}' WHERE id=${post.id}`);
				original_state.posts[old_index].content = post.content;
			}
			if(old_version.likes != post.likes) {
				changes.push(`UPDATE posts SET likes=${post.likes} WHERE id=${post.id}`);
				original_state.posts[old_index].likes = post.likes;
			}
			if(old_version.deleted != post.deleted) {
				changes.push(`UPDATE posts SET deleted=${post.deleted} WHERE id=${post.id}`);
				original_state.posts[old_index].deleted = post.deleted;
			}
			if(old_version.author != post.author) {
				changes.push(`UPDATE posts SET author=${post.author} WHERE id=${post.id}`);
				original_state.posts[old_index].author = post.author;
			}
		}
		const sql = changes.join(";");
		if(sql.length==0) return;
		pool.query(sql).then(res=>{}).catch(err=>console.error(err));
	},
	add_post: (content, author) => {

		pool.query("INSERT INTO posts(content, likes, deleted, author) VALUES ($1::text, 0, false, $2::int)", [content, author]).then(res =>
		{
			if (err) 
			{
				console.error('Error executing query', err.stack)
				return false;
			}
			else
			{
				return true;
			}
		}).catch(err=>console.error(err));
	},
	decode: decode,
	encode: encode
};