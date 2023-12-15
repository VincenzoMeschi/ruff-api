import express from "express";
import List from "../models/List.js";
import verifyUser from "../verifyToken.js";
import Movie from "../models/Movie";

const router = express.Router();

// Create a list
router.post("/", verifyUser, async (req, res) => {
	if (req.user.isAdmin) {
		const newList = new List(req.body);
		try {
			const savedList = await newList.save();
			res.status(201).json(savedList);
		} catch (err) {
			res.status(500).json(err);
		}
	} else {
		return res
			.status(403)
			.json(
				"Unauthorized Access. Please contact admin if you believe this is a mistake."
			);
	}
});

// Delete list
router.delete("/find/:id", verifyUser, async (req, res) => {
	if (req.user.isAdmin) {
		try {
			await Movie.findByIdAndDelete(req.params.id);
			res.status(200).json("List has been deleted...");
		} catch (err) {
			res.status(500).json(err);
		}
	} else {
		return res
			.status(403)
			.json(
				"Unauthorized Access. Please contact admin if you believe this is a mistake."
			);
	}
});
// Get lists
router.get("/", verifyUser, async (req, res) => {
	const typeQuery = req.query.type;
	const genereQuery = req.query.genere;
	let list = [];

	try {
		if (typeQuery) {
			if (genereQuery) {
				list = await List.aggregate([
					{ $sample: { size: 10 } },
					{ $match: { type: typeQuery, genere: genereQuery } },
				]);
			} else {
				list = await List.aggregate([
					{ $sample: { size: 10 } },
					{ $match: { type: typeQuery } },
				]);
			}
		} else {
			list = await List.aggregate([{ $sample: { size: 10 } }]);
		}
		res.status(200).json(list);
	} catch (err) {
		res.status(500).json(err);
	}
});

export default router;
