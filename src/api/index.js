const router = require("express").Router();

router.post("/login", require("./login"));
router.get("/logout", require("./logout"));
router.post("/create_post", require("./create_post"));
router.post("/signup", require("./signup"));
router.get("/like_post", require("./like_post"));
router.get("/unlike_post", require("./unlike_post"));
router.post("/add_comment", require("./add_comment"));
router.post("/change_password", require("./change_password"));
router.post("/add_city", require("./add_city"));
router.get("/delete_post", require("./delete_post"));
router.get("/delete_comment", require("./delete_comment"));

module.exports = router;