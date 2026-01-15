const router = require("express").Router();
const { GeneralAuthentication } = require("../middleware/user-auth");
const {
  CreatePassword,
  DeletePassword,
  UpdatePassword,
  GetPasswords,
} = require("../controller/password/password");

router.post("/create-password", [GeneralAuthentication], CreatePassword);
router.put("/update-password", [GeneralAuthentication], UpdatePassword);
router.get("/get-passwords", [GeneralAuthentication], GetPasswords);
router.delete("/delete-password", [GeneralAuthentication], DeletePassword);

module.exports = router;
