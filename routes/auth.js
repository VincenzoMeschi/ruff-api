import express from "express";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const saltRounds = 10;
const router = express.Router();

// Register
router.post("/register", async (req, res) => {
	try {
		const salt = bcrypt.genSaltSync(saltRounds);
		const hashedPassword = bcrypt.hashSync(req.body.password, salt);

		const newUser = new User({
			username: req.body.username,
			email: req.body.email,
			password: hashedPassword,
		});


		const user = await newUser.save();
		res.status(201).json(user);
	} catch (err) {
		res.status(500).json({ message: err });
	}
});

// Login
router.post("/login", async (req, res) => {
	try {
		const user = await User.findOne({
			$or: [{ username: req.body.username }, { email: req.body.email }],
		});

		if (!user) {
			return res
				.status(401)
				.json(
					"Either the username or email is incorrect, or the user does not exist."
				);
		}

		let isPasswordCorrect = bcrypt.compareSync(
			req.body.password,
			user.password
		);
		if (isPasswordCorrect) {
			// Login Successful
			const accessToken = jwt.sign(
				{ id: user.id, isAdmin: user.isAdmin },
				process.env.JWT_SECRET_KEY,
				{ expiresIn: "24 hours" }
			);
			const { password, ...others } = user._doc;
			res.status(200).json({ ...others, accessToken });
		} else {
			res.status(401).json("Incorrect password. Please try again.");
		}
	} catch (err) {
		res.status(500).json({ message: err });
	}
});

export default router;
