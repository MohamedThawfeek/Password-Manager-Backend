const jwt = require("jsonwebtoken");
const { User } = require("../model/common");

exports.GeneralAuthentication = async (req, res, next) => {
  try {
    const token = await req.headers["authorization"];
    const tokens = token.split(" ")[1];
    const data = await jwt.verify(tokens, process.env.JWT_SECRET);
    const { id } = data;

    const findUser = await User.findById(id);
    if (!findUser) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }
    req.id = id;
    next();
  } catch (error) {
    return res.status(404).json({
      status: false,
      message: "Invalid token.",
    });
  }
};
