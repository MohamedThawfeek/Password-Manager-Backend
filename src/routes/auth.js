const router = require("express").Router();
const { GeneralAuthentication } = require("../middleware/user-auth");
const {
  CreateUser,
  LoginUser,
  ForgotPassword,
  ResetPassword,
  GoogleLogin,
  GoogleSignUp,
  GetUser,
} = require("../controller/auth/auth");

router.post("/create-user", CreateUser);
router.post("/login-user", LoginUser);
router.post("/forgot-password", ForgotPassword);
router.put("/reset-password", ResetPassword);
router.get("/google-login", GoogleLogin);
router.get("/google-signup", GoogleSignUp);
router.get("/get-user", [GeneralAuthentication], GetUser);

module.exports = router;
