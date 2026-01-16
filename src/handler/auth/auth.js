const { User } = require("../../model/common");
const bcrypt = require("bcryptjs");
const { sendEmail } = require("../../email/email");
const { oauth2Client } = require("../../utils/google-config");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const emailQueue = require("../../utils/queue/queue");

exports.signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });
    emailQueue.add(async () =>
      await sendEmail(email, "Welcome to Password Manager", "Account Create", {
        name,
        loginUrl: `${process.env.FRONTEND_URL}/login`,
      })
    );
    return {
      responseCode: 201,
      success: true,
      message: "User created successfully",
      data: user,
    };
  } catch (error) {
    return {
      responseCode: 400,
      success: false,
      message: "Failed to signup",
      db_error: error.message,
    };
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return {
        responseCode: 400,
        success: false,
        message: "Invalid password",
      };
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    return {
      responseCode: 200,
      success: true,
      message: "Login successful",
      token: token,
      data: user,
    };
  } catch (error) {
    return {
      responseCode: 400,
      success: false,
      message: "Failed to login",
      db_error: error.message,
    };
  }
};

exports.getUser = async (req, res) => {
  const { id } = req;
  try {
    const user = await User.findById(id).select("-password");
    return {
      responseCode: 200,
      success: true,
      message: "User fetched successfully",
      data: user,
    };
  } catch (error) {
    return {
      responseCode: 400,
      success: false,
      message: "Failed to get user",
      db_error: error.message,
    };
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    emailQueue.add(async () =>
      await sendEmail(email, "Reset Your Password", "Password Reset", {
        name: user.name,
        expiryTime: "1 hour",
        resetUrl: `${process.env.FRONTEND_URL}/reset-password?token=${token}`,
      })
    );
    return {
      responseCode: 200,
      success: true,
      message: "Reset password email sent successfully",
    };
  } catch (error) {
    return {
      responseCode: 400,
      success: false,
      message: "Failed to forgot password",
      db_error: error.message,
    };
  }
};

exports.resetPassword = async (req, res) => {
  const { id } = req;
  const { password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate(id, { password: hashedPassword });
    return {
      responseCode: 200,
      success: true,
      message: "Password reset successfully",
    };
  } catch (error) {
    return {
      responseCode: 400,
      success: false,
      message: "Failed to reset password",
      db_error: error.message,
    };
  }
};

exports.googleLogin = async (req, res) => {
  const { code } = req.query;

  try {
    if (!code) {
      return {
        responseCode: 400,
        success: false,
        message: "Missing authorization code.",
      };
    }

    if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
      console.error("Missing OAuth credentials in environment variables");
      return {
        responseCode: 500,
        success: false,
        message: "OAuth credentials not configured properly.",
      };
    }
    const googleRes = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(googleRes.tokens);

    // Get user profile
    const { data: profile } = await axios.get(
      "https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=" +
        googleRes.tokens.access_token
    );

    const user = await User.findOne({ email: profile.email });

    if (!user) {
      return {
        responseCode: 400,
        success: false,
        message: "User not found",
      };
    }

    if (!user.googleID) {
      return {
        responseCode: 400,
        success: false,
        message: "User not registered with google",
      };
    }

    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET
    );
    return {
      success: true,
      responseCode: 200,
      message: "Successfully logged in",
      token: token,
      data: user,
    };
  } catch (error) {
    return {
      responseCode: 400,
      success: false,
      message: `An error has occurred: ${error.message}`,
      db_error: error.message,
    };
  }
};

exports.googleSignUp = async (req, res) => {
  const { code } = req.query;

  try {
    // Validate authorization code
    if (!code) {
      return {
        responseCode: 400,
        success: false,
        message: "Missing authorization code.",
      };
    }

    // Validate environment variables
    if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
      console.error("Missing OAuth credentials in environment variables");
      return {
        responseCode: 500,
        success: false,
        message: "OAuth credentials not configured properly.",
      };
    }
    const googleRes = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(googleRes.tokens);

    // Get user profile
    const { data: profile } = await axios.get(
      "https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=" +
        googleRes.tokens.access_token
    );

    const user = await User.findOne({ email: profile.email });

    if (user) {
      return {
        success: true,
        responseCode: 400,
        message: "User already exists",
      };
    }

    const createUser = await User.create({
      email: profile.email,
      name: profile.name,
      googleID: profile.id,
    });

    const token = jwt.sign(
      {
        id: createUser._id,
      },
      process.env.JWT_SECRET
    );

    return {
      success: true,
      responseCode: 201,
      message: "Successfully created user",
      token: token,
      data: createUser,
    };
  } catch (error) {
    console.error("Unexpected error in googleSignUp:", error);
    return {
      responseCode: 400,
      success: false,
      message: `An unexpected error occurred: ${error.message}`,
      db_error: error.message,
    };
  }
};
