const router = require("express").Router();

router.post("/login", require("./login"));
router.get("/logout", require("./logout"));
router.post("/create_post", require("./create_post"));
router.post("/signup", require("./signup"));
router.get("/like_post", require("./like_post"));
router.get("/unlike_post", require("./unlike_post"));

module.exports = router;