const { Password } = require("../../model/common");

exports.createPassword = async (req, res) => {
    const { id } = req;
  const { website, username, password } = req.body;
  try {
    await Password.create({ user_id: id, website, username, password });
    return {
      responseCode: 201,
      success: true,
      message: "Password created successfully",
    };
  } catch (error) {
    return {
      responseCode: 400,
      success: false,
      message: "Failed to create password",
      db_error: error.message,
    };
  }
};

exports.getPasswords = async (req, res) => {
  const { id } = req;
  try {
    const passwords = await Password.find({ user_id: id });
    return {
      responseCode: 200,
      success: true,
      message: "Passwords fetched successfully",
      data: passwords,
    };
  } catch (error) {
    return {
      responseCode: 400,
      success: false,
      message: "Failed to get passwords",
      db_error: error.message,
    };
  }
};

exports.updatePassword = async (req, res) => {
  const { website, username, password, ID } = req.body;
  try {
    const payload= {
        ...(website && { website }),
        ...(username && { username }),
        ...(password && { password }),
    };
    await Password.findByIdAndUpdate(ID, payload);
    return {
      responseCode: 200,
      success: true,
      message: "Password updated successfully",
    };
  } catch (error) {
    return {
      responseCode: 400,
      success: false,
      message: "Failed to update password",
      db_error: error.message,
    };
  }
};

exports.deletePassword = async (req, res) => {  
    const { ID } = req.body;
  try {
    await Password.findByIdAndDelete(ID);
    return {
      responseCode: 200,
      success: true,
      message: "Password deleted successfully",
    };
  } catch (error) {
    return {
      responseCode: 400,
      success: false,
      message: "Failed to delete password",
      db_error: error.message,
    };
  }
};