import mongoose from "mongoose";

const MovieSchema = new mongoose.Schema(
	{
		title: { type: String, required: true, unique: true },
		desc: { type: String },
		img: { type: String },
		imgTitle: { type: String },
		imgSm: { type: String },
		preview: { type: String },
		video: { type: String },
		year: { type: String },
		limit: { type: String },
		genere: { type: String },
		isSeries: { type: Boolean, default: false },
	},
	{ timestamps: true }
);

export default mongoose.model("Movie", MovieSchema);
