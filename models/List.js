import mongoose from "mongoose";

const ListSchema = new mongoose.Schema(
	{
		title: { type: String, required: true, unique: true },
		type: { type: String },
		genre: { type: String },
		content: [{ type: mongoose.Schema.Types.ObjectId, ref: "Movie" }],
	},
	{ timestamps: true }
);

export default mongoose.model("List", ListSchema);
