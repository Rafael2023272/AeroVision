import express from "express";
import User from "../models/user.js";

const router = express.Router();

// REGISTER user (Sign Up)
router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists with this email" });
        }

        // Create new user
        const newUser = new User({ name, email, password });
        await newUser.save();
        
        res.status(201).json({ 
            message: "User created successfully",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email
            }
        });

    } catch (error) {
        console.error("Registration error:", error);
        res.status(400).json({ message: error.message });
    }
});

// LOGIN user
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Check password (Note: In production, use bcrypt to hash passwords!)
        if (user.password !== password) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Login successful
        res.status(200).json({ 
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            },
            token: "dummy-token-123" // In production, use JWT tokens
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: error.message });
    }
});

// =============================
// SAVE aircraft to user dashboard
// =============================
router.post("/save-aircraft", async (req, res) => {
    const { userId, aircraft } = req.body;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // SAFETY INITIALIZATION 
        if (!user.savedAircraft) {
            user.savedAircraft = [];
        }

        user.savedAircraft.push(aircraft);
        await user.save();

        res.status(200).json({ message: "Aircraft saved successfully" });

    } catch (error) {
        console.error("Save aircraft error:", error);
        res.status(500).json({ message: error.message });
    }
});

// =============================
// UPDATE saved aircraft by index
// =============================
router.patch("/:id/update-aircraft", async (req, res) => {
    const { index, aircraft } = req.body;

    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.savedAircraft || user.savedAircraft.length === 0) {
            return res.status(400).json({ message: "No saved aircraft to update" });
        }

        if (index < 0 || index >= user.savedAircraft.length) {
            return res.status(400).json({ message: "Invalid aircraft index" });
        }

        // Update the aircraft at the specified index
        user.savedAircraft[index] = aircraft;
        await user.save();

        res.status(200).json({ 
            message: "Aircraft updated successfully",
            savedAircraft: user.savedAircraft 
        });

    } catch (error) {
        console.error("Update aircraft error:", error);
        res.status(500).json({ message: error.message });
    }
});

// =============================
// REMOVE saved aircraft by index
// =============================
router.patch("/:id/remove-aircraft", async (req, res) => {
    const { index } = req.body; // index of aircraft to remove

    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (!user.savedAircraft || user.savedAircraft.length === 0) {
            return res.status(400).json({ message: "No saved aircraft to remove" });
        }

        if (index < 0 || index >= user.savedAircraft.length) {
            return res.status(400).json({ message: "Invalid index" });
        }

        // Remove aircraft
        user.savedAircraft.splice(index, 1);
        await user.save();

        res.status(200).json({ message: "Aircraft removed successfully" });

    } catch (error) {
        console.error("Remove aircraft error:", error);
        res.status(500).json({ message: error.message });
    }
});



// GET all users
router.get("/", async (req, res) => {
    try {
        const users = await User.find().select('-password'); // Don't send passwords
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET user by ID
router.get("/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// UPDATE user
router.put("/:id", async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        ).select('-password');

        if (!user) return res.status(404).json({ error: "User not found" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE user
router.delete("/:id", async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json({ message: "User deleted" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;