const fs = require("fs");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();
const port = (process.env.PORT || 3000);
const fileUpload = require("express-fileupload");
const ejs = require("ejs");
const path = require("path");
app.set("view engine", "ejs");

ejs.fileLoader = (path) => {
	return fs.readFileSync(path, { encoding: "utf-8" });
};

app.set({
	"Content-Type": "text/html",
});

const db = require("./db");
const sessions = require("./sessions");
db.load();

app.use(express.static("node_modules/bootstrap/dist/"));
app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(fileUpload({
	createParentPath: true
}));

app.use((req, res, next) => {
	res.locals.user = sessions.user_from_session(req.cookies.session);
	res.locals.logged_in = res.locals.user != undefined;
	res.locals.db = db.db;
	res.locals.trunc = function truncate(input, len) {
		if (input.length > len) {
			return input.substring(0, len) + "...";
		}
		return input;
	};
	next();
});

app.set("views", "web");

app.get("/", (req, res) => {
	const sorted_posts = db.db.posts.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
	res.render("pages/index", { posts: sorted_posts });
});

app.get("/login", require("./pages/login"));
app.get("/create_post", require("./pages/create_post"));
app.get("/signup", require("./pages/signup"));
app.get("/post/:id", require("./pages/post"));
app.get("/admin", require("./pages/admin"));
app.get("/me", require("./pages/me"));
app.get("/contact", require("./pages/contact"));

app.use("/api/", require("./api/"));

app.use(require("./pages/404"));

app.use(function (err, req, res, next) {
	console.error(err.stack);
	res.status(500);
	res.render("pages/500", { err: err });
});

app.listen(port, () => {
	console.log(`Listening at http://localhost:${port}`);
});