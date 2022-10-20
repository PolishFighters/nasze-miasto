module.exports = (req, res) => {
	res.status(404);
	res.locals.site = req.url;
	res.render("pages/404");
};