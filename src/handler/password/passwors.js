const { Password, Images } = require("../../model/common");
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


exports.uploadImage = async (req, res) => {
  const { imageFile } = req.files;
  try {
    const imageName = Images.length + 1;
    const image = await Images.create({
      image_url: imageFile.data,
      image_type: imageFile.mimetype,
      image_name: imageFile.name+imageName,
    });
    return {
      responseCode: 200,
      success: true,
      message: "Image uploaded successfully",
      data: image,
    };
  } catch (error) {
    return {
      responseCode: 400,
      success: false,
      message: "Failed to upload image",
      db_error: error.message,
    };
  }
};


exports.getImages = async (req, res) => {
  const { id } = req.query;
  try {
    const images = await Images.findById(id);
    return {
      responseCode: 200,
      success: true,
      message: "Images fetched successfully",
      data: images,
    };
  } catch (error) {
    return {
      responseCode: 400,
      success: false,
      message: "Failed to get images",
      db_error: error.message,
    };
  }
};