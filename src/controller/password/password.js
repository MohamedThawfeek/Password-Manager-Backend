const yup = require("yup");
const {
  createPassword,
  deletePassword,
  updatePassword,
  getPasswords,
  uploadImage,
  getImages,
  getImageData,
  streamImage,
} = require("../../handler/password/passwors");

const {
  CreatePasswordSchema,
  DeletePasswordSchema,
  UpdatePasswordSchema,
} = require("../../utils/validation/passwords");

exports.CreatePassword = async function (req, res) {
  try {
    await CreatePasswordSchema.validate(req.body, { abortEarly: false });
    const response = await createPassword(req);
    return res.status(response.responseCode).send(response);
  } catch (err) {
    if (err instanceof yup.ValidationError) {
      const errorMessages = err.inner.reduce((acc, currentError) => {
        acc[currentError.path] = currentError.message;
        return acc;
      }, {});
      return res.status(400).json({ message: errorMessages });
    }
    // Optionally handle other errors
    return res.status(500).json({ message: "Internal server error" });
  }
};


exports.DeletePassword = async function (req, res) {
  try {
    await DeletePasswordSchema.validate(req.body, { abortEarly: false });
    const response = await deletePassword(req);
    return res.status(response.responseCode).send(response);
  } catch (err) {
    if (err instanceof yup.ValidationError) {
      const errorMessages = err.inner.reduce((acc, currentError) => {
        acc[currentError.path] = currentError.message;
        return acc;
      }, {});
      return res.status(400).json({ message: errorMessages });
    }
    // Optionally handle other errors
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.UpdatePassword = async function (req, res) {
  try {
    await UpdatePasswordSchema.validate(req.body, { abortEarly: false });
    const response = await updatePassword(req);
    return res.status(response.responseCode).send(response);
  } catch (err) {
    if (err instanceof yup.ValidationError) {
      const errorMessages = err.inner.reduce((acc, currentError) => {
        acc[currentError.path] = currentError.message;
        return acc;
      }, {});
      return res.status(400).json({ message: errorMessages });
    }
    // Optionally handle other errors
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.GetPasswords = async function (req, res) {
  try {
    const response = await getPasswords(req);
    return res.status(response.responseCode).send(response);
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.UploadImage = async function (req, res) {
  try {
    const response = await uploadImage(req);
    return res.status(response.responseCode).send(response);
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.GetImages = async function (req, res) {
  try {
    const response = await getImages(req);  
    return res.status(response.responseCode).send(response);
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.GetImageData = async function (req, res) {
  try {
    const response = await getImageData(req);
    return res.status(response.responseCode).send(response);
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Stream image endpoint - fastest method (sends binary directly)
exports.StreamImage = streamImage;