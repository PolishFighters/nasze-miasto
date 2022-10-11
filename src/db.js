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
					firstname: row.firstname,
					lastname: row.lastname,
					email: row.email,
					password: row.password,
					liked: row.liked.split(",").map(v=>parseInt(v) ?? -1)
				});
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
		}).catch(err=>console.error(err));
	},
	decode: decode,
	encode: encode
}