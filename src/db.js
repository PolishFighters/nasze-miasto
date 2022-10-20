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
	cities: [],
	comments: []
};

const fix_likes = () => {
	for (let pi = 0; pi < module.exports.db.posts.length; pi++) {
		const post = module.exports.db.posts[pi];
		post.likes = 0;
	}
	let sums = {};
	for (let ui = 0; ui < module.exports.db.users.length; ui++) {
		const user = module.exports.db.users[ui];
		for (let li = 0; li < user.liked.length; li++) {
			const like = user.liked[li];
			if(!(like in sums)){
				sums[like] = 0;
			}
			sums[like]++;
		}
	}
	for (const skey in sums) {
		if (Object.hasOwnProperty.call(sums, skey)) {
			const sum = sums[skey];
			const post_index = module.exports.db.posts.findIndex(v=>v.id==skey);
			module.exports.db.posts[post_index].likes = sum;
		}
	}
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
				liked: [0, 1, 2],
				admin: false
			}
		],
		posts: [
			{
				id: 0,
				content: "Proszę odświeżyć stronę",
				likes: 2022, //cache
				deleted: false,
				author: 0,
				title: "Proszę odświeżyć stronę",
				created_at: new Date(),
				city: "Kraina Administracji"
			}
		],
		cities: [
			{
				id: 0,
				name: ""
			}
		],
		comments: [
			{
				id: 0,
				author: 0,
				post: 0,
				content: "",
				deleted: false
			}
		]
	},
	load: () => {
		pool.query("SELECT * FROM users").then(res => {
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
					liked: row.liked.split(",").filter(v => v.length > 0).map(v => parseInt(v) ?? -1),
					admin: row.admin
				});
				// FIXME: Find a better way to clone an object
				original_state.users = JSON.parse(JSON.stringify(module.exports.db.users));
			}
		}).catch(err => console.error(err));
		pool.query("SELECT * FROM posts").then(res => {
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
					author: row.author,
					title: decode(row.title),
					created_at: row.created_at,
					city: decode(row.city)
				});
			}
			// FIXME: Find a better way to clone an object
			original_state.posts = JSON.parse(JSON.stringify(module.exports.db.posts));
		}).catch(err => console.error(err));

		pool.query("SELECT * FROM cities").then(res => {
			// Remove the sample city
			module.exports.db.cities.pop();
			const rows = res.rows;

			for (let ri = 0; ri < rows.length; ri++) {
				const row = rows[ri];
				module.exports.db.cities.push({
					id: row.id,
					name: decode(row.name)
				});
			}

			original_state.cities = JSON.parse(JSON.stringify(module.exports.db.cities));
		}).catch(err => console.error(err));

		pool.query("SELECT * FROM comments").then(res => {
			// Remove the sample comment
			module.exports.db.comments.pop();
			const rows = res.rows;

			for (let ri = 0; ri < rows.length; ri++) {
				const row = rows[ri];
				module.exports.db.comments.push({
					id: row.id,
					author: row.author,
					post: row.post,
					content: decode(row.content),
					deleted: row.deleted
				});
			}

			original_state.comments = JSON.parse(JSON.stringify(module.exports.db.comments));
		}).catch(err => console.error(err));
	},
	save: () => {
		fix_likes();
		let changes = [];

		for (let ui = 0; ui < module.exports.db.users.length; ui++) {
			const user = module.exports.db.users[ui];
			const old_index = original_state.users?.findIndex(v => v.id == user.id) ?? -1;
			if (old_index < 0) {
				changes.push(`INSERT INTO users (id, firstname, lastname, email, password, liked, admin) VALUES (DEFAULT, '${encode(user.firstname)}', '${encode(user.lastname)}', '${encode(user.email)}', '${user.password}', '${user.liked.join(",")}', ${user.admin})`);
				original_state.users.push({ id: user.id, firstname: user.firstname, lastname: user.lastname, email: user.email, password: user.password, liked: user.liked });
				continue;
			}
			const old_version = original_state.users[old_index];
			if (old_version.firstname != user.firstname) {
				changes.push(`UPDATE users SET firstname='${encode(user.firstname)}' WHERE id=${user.id}`);
				original_state.users[old_index].firstname = user.firstname;
			}
			if (old_version.lastname != user.lastname) {
				changes.push(`UPDATE users SET lastname='${encode(user.lastname)}' WHERE id=${user.id}`);
				original_state.users[old_index].lastname = user.lastname;
			}
			if (old_version.email != user.email) {
				changes.push(`UPDATE users SET email='${encode(user.email)}' WHERE id=${user.id}`);
				original_state.users[old_index].email = user.email;
			}
			if (old_version.password != user.password) {
				changes.push(`UPDATE users SET password='${user.password}' WHERE id=${user.id}`);
				original_state.users[old_index].password = user.password;
			}
			const liked_old_rep = old_version.liked.join(",");
			const liked_rep = user.liked.join(",");
			if (liked_old_rep != liked_rep) {
				changes.push(`UPDATE users SET liked='${liked_rep}' WHERE id=${user.id}`);
				original_state.users[old_index].liked = JSON.parse(JSON.stringify(user.liked));
			}
			if (old_version.admin != user.admin) {
				changes.push(`UPDATE users SET admin=${user.admin} WHERE id=${user.id}`);
				original_state.users[old_index].admin = user.admin;
			}
		}

		for (let pi = 0; pi < module.exports.db.posts.length; pi++) {
			const post = module.exports.db.posts[pi];
			const old_index = original_state.posts?.findIndex(v => v.id == post.id) ?? -1;
			if (old_index < 0) {
				changes.push(`INSERT INTO posts (id, content, likes, deleted, author, title, created_at, city) VALUES (DEFAULT, '${encode(post.content)}', ${post.likes}, ${post.deleted}, ${post.author}, '${encode(post.title)}', '${post.created_at.toISOString()}', '${encode(post.city)}')`);
				original_state.posts.push({ id: post.id, content: post.content, likes: post.likes, deleted: post.deleted, author: post.author, city: post.city });
				continue;
			}
			const old_version = original_state.posts[old_index];
			if (old_version.content != post.content) {
				changes.push(`UPDATE posts SET content='${encode(post.content)}' WHERE id=${post.id}`);
				original_state.posts[old_index].content = post.content;
			}
			if (old_version.likes != post.likes) {
				changes.push(`UPDATE posts SET likes=${post.likes} WHERE id=${post.id}`);
				original_state.posts[old_index].likes = post.likes;
			}
			if (old_version.deleted != post.deleted) {
				changes.push(`UPDATE posts SET deleted=${post.deleted} WHERE id=${post.id}`);
				original_state.posts[old_index].deleted = post.deleted;
			}
			if (old_version.author != post.author) {
				changes.push(`UPDATE posts SET author=${post.author} WHERE id=${post.id}`);
				original_state.posts[old_index].author = post.author;
			}
			if (old_version.title != post.title) {
				changes.push(`UPDATE posts SET title='${encode(post.title)}' WHERE id=${post.id}`);
				original_state.posts[old_index].title = post.title;
			}
			if (old_version.created_at != post.created_at) {
				changes.push(`UPDATE posts SET created_at='${post.created_at.toISOString()}' WHERE id=${post.id}`);
				original_state.posts[old_index].created_at = post.created_at;
			}
			if (old_version.city != post.city) {
				changes.push(`UPDATE posts SET city='${encode(post.city)}' WHERE id=${post.id}`);
				original_state.posts[old_index].city = post.city;
			}
		}

		for (let ci = 0; ci < module.exports.db.cities.length; ci++) {
			const city = module.exports.db.cities[ci];
			const old_index = original_state.cities?.findIndex(v => v.id == city.id) ?? -1;
			if (old_index < 0) {
				changes.push(`INSERT INTO cities (id, name) VALUES (DEFAULT, '${encode(city.name)}')`);
				original_state.cities.push({ id: city.id, content: city.name });
				continue;
			}
			const old_version = original_state.cities[old_index];
			if (old_version.name != city.name) {
				changes.push(`UPDATE cities SET name='${encode(city.name)}' WHERE id=${city.id}`);
				original_state.cities[old_index].name = city.name;
			}
		}

		for (let ci = 0; ci < module.exports.db.comments.length; ci++) {
			const comment = module.exports.db.comments[ci];
			const old_index = original_state.comments?.findIndex(v => v.id == comment.id) ?? -1;
			if (old_index < 0) {
				changes.push(`INSERT INTO comments (id, author, post, content, deleted) VALUES (DEFAULT, ${comment.author}, ${comment.post}, '${encode(comment.content)}', ${comment.deleted})`);
				original_state.comments.push({ id: comment.id, author: comment.author, post: comment.post, content: comment.content, deleted: comment.deleted });
				continue;
			}
			const old_version = original_state.comments[old_index];
			if (old_version.author != comment.author) {
				changes.push(`UPDATE comments SET author=${comment.author} WHERE id=${comment.id}`);
				original_state.comments[old_index].author = comment.author;
			}

			if (old_version.post != comment.post) {
				changes.push(`UPDATE comments SET post=${comment.post} WHERE id=${comment.id}`);
				original_state.comments[old_index].post = comment.post;
			}

			if (old_version.content != comment.content) {
				changes.push(`UPDATE comments SET content='${encode(comment.content)}' WHERE id=${comment.id}`);
				original_state.comments[old_index].content = comment.content;
			}

			if (old_version.deleted != comment.deleted) {
				changes.push(`UPDATE comments SET deleted=${comment.deleted} WHERE id=${comment.id}`);
				original_state.comments[old_index].deleted = comment.deleted;
			}
		}

		const sql = changes.join(";");
		if (sql.length == 0) return;
		pool.query(sql).then(res => {
			module.exports.db.users.splice(1);
			module.exports.db.posts.splice(1);
			module.exports.db.cities.splice(1);
			module.exports.db.comments.splice(1);
			module.exports.load();
		}).catch(err => console.error(err, `\n\nFailed with query: ${sql}`));
	},
	decode: decode,
	encode: encode
};