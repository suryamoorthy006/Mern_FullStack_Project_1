const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const { promisify } = require("util");

const User = require("./models/User.js");
const Note = require("./models/Note.js");

const scrypt = promisify(crypto.scrypt);
const BCRYPT_ROUNDS = 12;
const TOKEN_TTL_SECONDS = 60 * 60;
const TOKEN_SECRET = process.env.TOKEN_SECRET || crypto.randomBytes(32).toString("hex");
const app = express();

function normalizeEmail(value) {
    return String(value || "").trim().toLowerCase();
}

function createToken(userId, email) {
    const payload = Buffer.from(
        JSON.stringify({
            sub: userId,
            email,
            exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
        })
    ).toString("base64url");

    const signature = crypto
        .createHmac("sha256", TOKEN_SECRET)
        .update(payload)
        .digest("base64url");

    return `${payload}.${signature}`;
}

async function hashPassword(password) {
    const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    return { hash, salt: "managed-by-bcrypt" };
}

async function issueToken(user, res) {
    const token = createToken(user._id.toString(), user.email);
    console.log(`Auth token for ${user.email} (valid for 1 hour): ${token}`);
    return res.status(200).json({ token, expiresIn: TOKEN_TTL_SECONDS, email: user.email });
}

async function verifyPassword(password, user) {
    if (user.passwordHash.startsWith("$2")) {
        return bcrypt.compare(password, user.passwordHash);
    }

    const derivedKey = await scrypt(password, user.passwordSalt, 64);
    const storedHash = Buffer.from(user.passwordHash, "hex");

    return (
        derivedKey.length === storedHash.length &&
        crypto.timingSafeEqual(derivedKey, storedHash)
    );
}

mongoose
    .connect("mongodb://localhost:27017/notesDB")
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("Error connecting to MongoDB:", err));

app.use(bodyParser.json());
app.use(cors());

app.post("/api/auth/register", async (req, res) => {
    try {
        const email = normalizeEmail(req.body.email);
        const password = String(req.body.password || "");

        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            return res.status(400).json({ message: "Enter a valid email address." });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters." });
        }
        if (await User.exists({ email })) {
            return res.status(409).json({ message: "An account with this email already exists." });
        }

        const { hash, salt } = await hashPassword(password);
        const user = await User.create({ email, passwordHash: hash, passwordSalt: salt });
        return issueToken(user, res);
    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({ message: "Unable to create your account right now." });
    }
});

app.post("/api/auth/login", async (req, res) => {
    try {
        const email = normalizeEmail(req.body.email);
        const password = String(req.body.password || "");
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: "Email or password is incorrect." });
        }

        if (!(await verifyPassword(password, user))) {
            return res.status(401).json({ message: "Email or password is incorrect." });
        }

        return issueToken(user, res);
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Unable to sign you in right now." });
    }
});

app.get("/api/notes", async (req, res) => {
    try {
        const notes = await Note.find().sort({ createdAt: -1 });
        return res.status(200).json(notes);
    } catch (error) {
        console.error("Fetch notes error:", error);
        return res.status(500).json({ message: "Unable to fetch notes." });
    }
});

app.post("/api/notes", async (req, res) => {
    try {
        const { title, description } = req.body;
        const note = await Note.create({ title, description });
        return res.status(201).json(note);
    } catch (error) {
        console.error("Create note error:", error);
        return res.status(500).json({ message: "Unable to create note." });
    }
});

app.put("/api/notes/:id", async (req, res) => {
    try {
        const { title, description } = req.body;
        const note = await Note.findByIdAndUpdate(
            req.params.id,
            { title, description },
            { new: true, runValidators: true }
        );

        if (!note) {
            return res.status(404).json({ message: "Note not found." });
        }

        return res.status(200).json(note);
    } catch (error) {
        console.error("Update note error:", error);
        return res.status(500).json({ message: "Unable to update note." });
    }
});

app.delete("/api/notes/:id", async (req, res) => {
    try {
        const note = await Note.findByIdAndDelete(req.params.id);

        if (!note) {
            return res.status(404).json({ message: "Note not found." });
        }

        return res.status(200).json({ message: "Note deleted successfully." });
    } catch (error) {
        console.error("Delete note error:", error);
        return res.status(500).json({ message: "Unable to delete note." });
    }
});

app.listen(4000, () => {
    console.log("Server is running on port 4000");
});