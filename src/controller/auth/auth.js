const yup = require("yup");
const {
  signup,
  login,
  getUser,
  forgotPassword,
  resetPassword,
  googleLogin,
  googleSignUp,
} = require("../../handler/auth/auth");

const {
  CreateUserSchema,
  ForgotPasswordSchema,
  LoginUserSchema,
  ResetPasswordSchema,
} = require("../../utils/validation/auth");

exports.CreateUser = async function (req, res) {
  try {
    await CreateUserSchema.validate(req.body, { abortEarly: false });
    const response = await signup(req);
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

exports.LoginUser = async function (req, res) {
  try {
    await LoginUserSchema.validate(req.body, { abortEarly: false });
    const response = await login(req);
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

exports.ForgotPassword = async function (req, res) {
  try {
    await ForgotPasswordSchema.validate(req.body, { abortEarly: false });
    const response = await forgotPassword(req);
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

exports.ResetPassword = async function (req, res) {
  try {
    await ResetPasswordSchema.validate(req.body, { abortEarly: false });
    const response = await resetPassword(req);
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

exports.GoogleLogin = async function (req, res) {
  try {
    const response = await googleLogin(req);
    return res.status(response.responseCode).send(response);
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.GoogleSignUp = async function (req, res) {
  try {
    const response = await googleSignUp(req);
    return res.status(response.responseCode).send(response);
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.GetUser = async function (req, res) {
  try {
    const response = await getUser(req);
    return res.status(response.responseCode).send(response);
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
