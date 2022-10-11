const router = require("express").Router();

router.post("/login", require("./login"));
router.get("/logout", require("./logout"));

module.exports = router;