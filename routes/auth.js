import express from "express";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import verifyUser from "../verifyToken.js";
import {
	generateProfileUploadURL,
	deleteProfileImageFromS3,
} from "../s3_profile_image.js";
import { generateMovieUploadURL, deleteMovieFromS3 } from "../s3_movies.js";
import {
	generateMoviePosterUploadURL,
	deleteMoviePosterImageFromS3,
} from "../s3_movie_posters.js";

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
			profilePic: req.body.profilePic,
			password: hashedPassword,
		});

		const user = await newUser.save();
		res.status(201).json(user);
	} catch (err) {
		// send different status code if username or email already exists
		if (err.keyPattern.username === 1 || err.keyPattern.email === 1) {
			res.status(409).json({ message: err });
		} else {
			res.status(500).json({ message: err });
		}
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
		res.status(500).json("Internal Server Error.");
	}
});

// Is Logged In
router.get("/", verifyUser, async (req, res) => {
	try {
		const token = req.headers.authorization.split(" ")[1];
		const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
		const user = await User.findById(decoded.id);
		const { password, ...others } = user._doc;
		res.status(200).json({ message: "User is logged in.", ...others });
	} catch (err) {
		res.status(401).json({ message: err });
	}
});

// Get Auth URL from s3 for movie posters
router.get("/s3/url/movie_posters/:filename", verifyUser, async (req, res) => {
	if (!req.params.filename) {
		res.status(400).json({ message: "No filename provided." });
	}
	if (req.user.isAdmin === true) {
		try {
			const url = await generateMoviePosterUploadURL(req.params.filename);
			res.status(200).json(url);
		} catch (err) {
			res.status(500).json({ message: err });
		}
	} else {
		res.status(401).json({ message: "You are not authorized." });
	}
});

// Get Auth URL from s3 for movies
router.get("/s3/url/movies/:filename", verifyUser, async (req, res) => {
	if (!req.params.filename) {
		res.status(400).json({ message: "No filename provided." });
	}
	if (req.user.isAdmin === true) {
		try {
			const url = await generateMovieUploadURL(req.params.filename);
			res.status(200).json(url);
		} catch (err) {
			res.status(500).json({ message: err });
		}
	} else {
		res.status(401).json({ message: "You are not authorized." });
	}
});

// Get Auth URL from s3 for profile images
router.get("/s3/url/profile_images/:filename", verifyUser, async (req, res) => {
	if (!req.params.filename) {
		res.status(400).json({ message: "No filename provided." });
	}
	if (
		req.user.profilePic.includes(req.params.filename) ||
		req.user.isAdmin === true
	) {
		try {
			const url = await generateProfileUploadURL(req.params.filename);
			res.status(200).json(url);
		} catch (err) {
			res.status(500).json({ message: err });
		}
	}
});

// Delete profile image from s3
router.delete(
	"/s3/delete/profile_images/:filename",
	verifyUser,
	async (req, res) => {
		if (
			req.user.profilePic.includes(req.params.filename) ||
			req.user.isAdmin === true
		) {
			if (!req.params.filename) {
				res.status(400).json({ message: "No filename provided." });
			}
			try {
				const url = await deleteProfileImageFromS3(req.params.filename);
				res.status(200).json(url);
			} catch (err) {
				res.status(404).json({ message: "File not in S3 Bucket" });
			}
		} else {
			res.status(401).json({
				message: "You can only delete your own profile picture!",
			});
		}
	}
);

// Delete movie from s3
router.delete("/s3/delete/movies/:filename", verifyUser, async (req, res) => {
	if (!req.params.filename) {
		res.status(400).json({ message: "No filename provided." });
	}
	if (req.user.isAdmin === true) {
		try {
			const url = await deleteMovieFromS3(req.params.filename);
			res.status(200).json(url);
		} catch (err) {
			res.status(404).json({ message: "File not in S3 Bucket" });
		}
	} else {
		res.status(401).json({ message: "You are not authorized." });
	}
});

// Delete movie poster from s3
router.delete(
	"/s3/delete/movie_posters/:filename",
	verifyUser,
	async (req, res) => {
		if (!req.params.filename) {
			res.status(400).json({ message: "No filename provided." });
		}
		if (req.user.isAdmin === true) {
			try {
				const url = await deleteMoviePosterImageFromS3(
					req.params.filename
				);
				res.status(200).json(url);
			} catch (err) {
				res.status(404).json({ message: "File not in S3 Bucket" });
			}
		} else {
			res.status(401).json({ message: "You are not authorized." });
		}
	}
);

export default router;
