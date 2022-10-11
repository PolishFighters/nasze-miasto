const fs = require("fs");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();
const port = (process.env.PORT || 3000);
const fileUpload = require("express-fileupload");
const ejs = require("ejs");
app.set("view engine", "ejs");

ejs.fileLoader = (path) => {
	return fs.readFileSync(path, { encoding: "utf-8" });
};

app.set({
	"Content-Type": "text/html",
});

const db = require("./db");
db.load();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(fileUpload({
	createParentPath: true
}));

app.set("views", "web");

app.get("/", (req, res) => {
	db.db.users[0].email = "email"+Math.random().toString();
	db.db.users[0].firstname = "firstname"+Math.random().toString();
	db.db.users[0].lastname = "lastname"+Math.random().toString();
	db.db.users[0].password = "password"+Math.random().toString();
	db.db.users[0].liked = [1, (50*Math.random())|0, 2];
	db.save();
	res.render("pages/index");
});

app.listen(port, () => {
	console.log(`Listening at http://localhost:${port}`);
});