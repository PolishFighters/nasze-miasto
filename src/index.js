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
const e = require("express");
const sessions = require("./sessions");
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
	res.render("pages/index");
});

app.get("/login", require("./pages/login"));
app.get("/card_error", require("./pages/card_error"));
app.get("/card_added", require("./pages/card_added"));
app.get("/create_card", require("./pages/create_card"));

app.use("/api/", require("./api/"));

app.listen(port, () => {
	console.log(`Listening at http://localhost:${port}`);
});