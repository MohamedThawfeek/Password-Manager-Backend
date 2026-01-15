const router = require("express").Router();
const authRoutes = require("./auth");
const passwordsRoutes = require("./paswords");


router.use("/auth", authRoutes);
router.use("/", passwordsRoutes);


module.exports = router;
