const { Password } = require("../../model/common");
const { encrypt, decrypt } = require("../../utils/encryption");

exports.createPassword = async (req, res) => {
  const { id } = req;
  const { website, username, password } = req.body;
  try {
    // Encrypt the password before storing
    const encryptedPassword = encrypt(password);
    await Password.create({
      user_id: id,
      website,
      username,
      password: encryptedPassword,
    });
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
    
    // Decrypt passwords and convert to plain objects
    const datas = await Promise.all(
      passwords.map(async (passwordItem) => {
        try {
          // Convert mongoose document to plain object
          const passwordObj = passwordItem.toObject();
          // Decrypt the password
          const decryptedPassword = decrypt(passwordObj.password);
          return {
            ...passwordObj,
            password: decryptedPassword,
          };
        } catch (error) {
          // If decryption fails, return password as is (might be old format)
          return {
            ...passwordItem.toObject(),
            password: passwordItem.password,
          };
        }
      })
    );
    
    return {
      responseCode: 200,
      success: true,
      message: "Passwords fetched successfully",
      data: datas,
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
    let encryptedPassword;

    if (password) {
      encryptedPassword = encrypt(password);
    }
    const payload = {
      ...(website && { website }),
      ...(username && { username }),
      ...(password && { password: encryptedPassword }),
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
