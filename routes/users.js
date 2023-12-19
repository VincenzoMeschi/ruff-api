import express from "express";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import verifyUser from "../verifyToken.js";

const router = express.Router();
const saltRounds = 10;

// Update

router.put("/:id", verifyUser, async (req, res) => {
	if (req.user.id === req.params.id || req.user.isAdmin) {
		if (req.body.password) {
			const salt = bcrypt.genSaltSync(10);
			req.body.password = bcrypt.hashSync(req.body.password, salt);
		}

		try {
			const updatedUser = await User.findByIdAndUpdate(
				req.params.id,
				{
					$set: req.body,
				},
				{ new: true }
			);

			res.status(200).json(updatedUser);
		} catch (err) {
			res.status(500).json(err);
		}
	} else {
		return res.status(403).json("You can only update your account!");
	}
});

// Delete

router.delete("/:id", verifyUser, async (req, res) => {
	if (req.user.id === req.params.id || req.user.isAdmin) {
		try {
			await User.findByIdAndDelete(req.params.id);
			res.status(200).json("User has been deleted...");
		} catch (err) {
			res.status(500).json(err);
		}
	} else {
		return res.status(403).json("You can only delete your account!");
	}
});
// Get User

router.get("/find/:id", async (req, res) => {
	try {
		const user = await User.findById(req.params.id);
		const { password, ...others } = user._doc;
		res.status(200).json(others);
	} catch (err) {
		res.status(500).json(err);
	}
});
// Get All Users

router.get("/", verifyUser, async (req, res) => {
	const query = req.query.new;
	if (req.user.isAdmin) {
		try {
			const users = query
				? await User.find().sort({ _id: -1 }).limit(10)
				: await User.find();
			res.status(200).json(users);
		} catch (err) {
			res.status(500).json(err);
		}
	} else {
		return res.status(403).json("You are not allowed to see all users!");
	}
});
// Get All User Stats

router.get("/stats", async (req, res) => {
	const today = new Date();
	const lastYear = today.setFullYear(today.setFullYear() - 1);

	const monthsArray = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"Auguest",
		"September",
		"October",
		"November",
		"December",
	];

	try {
		const data = await User.aggregate([
			{ $project: { month: { $month: "$createdAt" } } },
			{ $group: { _id: "$month", total: { $sum: 1 } } },
		]);

		res.status(200).json(data);
	} catch (err) {
		res.status(500).json(err);
	}
});

// Admin creates new user OR admin user
router.post("/admin/create/user", verifyUser, async (req, res) => {
	if (req.user.isAdmin) {
		try {
			const salt = bcrypt.genSaltSync(saltRounds);
			const hashedPassword = bcrypt.hashSync(req.body.password, salt);

			const newUser = new User({
				username: req.body.username,
				email: req.body.email,
				password: hashedPassword,
				isAdmin: req.body.isAdmin,
				profilePic: req.body.profilePic,
			});

			const user = await newUser.save();
			res.status(201).json(user);
		} catch (err) {
			res.status(500).json({ message: err + "server EREFASDFADF" });
		}
	} else {
		res.status(403).json({ message: "You are not authorized to do that." });
	}
});

export default router;
