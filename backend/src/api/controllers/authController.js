import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../../database/User.js";
import { OAuth2Client } from "google-auth-library";


const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

// Generate JWT token
function generateToken(userId) {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// POST /api/auth/register
export async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required.",
      });
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    // Generate login token
    const token = generateToken(user._id.toString());

    return res.status(201).json({
      message: "Account created successfully.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("❌ Registration error:", error.message);

    return res.status(500).json({
      message: "Failed to create account.",
    });
  }
}

// POST /api/auth/login
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Find user
    const user = await User.findOne({
      email: normalizedEmail,
    });

    // Don't reveal whether email exists
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    // Check whether the account has a password
    if (!user.password) {
      return res.status(401).json({
        message: "This account uses Google login. Please continue with Google.",
      });
    }

    // Compare password with hashed password
    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    // Generate login token
    const token = generateToken(user._id.toString());

    return res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("❌ Login error:", error.message);

    return res.status(500).json({
      message: "Failed to log in.",
    });
  }
}

// GET /api/auth/me
export async function getMe(req, res) {
  try {
    const user = await User.findById(req.user.userId)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    return res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("❌ Get user error:", error.message);

    return res.status(500).json({
      message: "Failed to get user.",
    });
  }
}


// POST /api/auth/google
export async function loginWithGoogle(req, res) {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        message: "Google credential is required.",
      });
    }

    // Verify Google's ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(401).json({
        message: "Invalid Google credential.",
      });
    }

    const {
      sub: googleId,
      email,
      name,
      email_verified: emailVerified,
    } = payload;

    if (!email || !emailVerified || !googleId) {
      return res.status(401).json({
        message: "Google account verification failed.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find the user using Google ID first
    let user = await User.findOne({ googleId });

    // If not found, check whether the email already exists
    if (!user) {
      user = await User.findOne({
        email: normalizedEmail,
      });
    }

    if (user) {
      // Link Google account to an existing email account
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    } else {
      // Create a new Google-authenticated user
      user = await User.create({
        name: name?.trim() || "Google User",
        email: normalizedEmail,
        googleId,
      });
    }

    // Generate the existing JWT
    const token = generateToken(user._id.toString());

    return res.status(200).json({
      message: "Google login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("❌ Google login error:", error.message);

    return res.status(401).json({
      message: "Google authentication failed.",
    });
  }
}

