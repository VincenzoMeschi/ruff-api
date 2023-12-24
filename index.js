import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import authRoute from "./routes/auth.js";
import userRoute from "./routes/users.js";
import movieRoute from "./routes/movies.js";
import listRoute from "./routes/lists.js";

const app = express();

dotenv.config();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

mongoose
	.connect(process.env.MONGO_URI)
	.then(() => {
		console.log(`Mongoose has connected to MongoDB Cluster0`);
	})
	.catch((err) => {
		console.log(`Mongoose COULD NOT connect to MongoDB: ${err}`);
	});

app.use(cors());
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/movies", movieRoute);
app.use("/api/lists", listRoute);
app.use(express.static(path.join(__dirname, "../client/build")));
app.use("/admin", express.static(path.join(__dirname, "../admin/build")));

// The catchall handler: for any request that doesn't match
// one above, send back React's index.html file.
app.get("*", (req, res) => {
	res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

app.get("/admin/*", (req, res) => {
	res.sendFile(path.join(__dirname, "../admin/build/index.html"));
});

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
