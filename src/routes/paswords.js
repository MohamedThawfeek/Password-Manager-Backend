const router = require("express").Router();
const { GeneralAuthentication } = require("../middleware/user-auth");
const {
  CreatePassword,
  DeletePassword,
  UpdatePassword,
  GetPasswords,
  UploadImage,
  GetImages,
} = require("../controller/password/password");
const { GetLocations } = require("../controller/location/location");

router.post("/get-locations", GetLocations);

router.post("/create-password", [GeneralAuthentication], CreatePassword);
router.put("/update-password", [GeneralAuthentication], UpdatePassword);
router.get("/get-passwords", [GeneralAuthentication], GetPasswords);
router.delete("/delete-password", [GeneralAuthentication], DeletePassword);
router.post("/upload-image", UploadImage);
router.get("/get-images", GetImages);

module.exports = router;
