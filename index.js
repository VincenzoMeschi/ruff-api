import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoute from "./routes/auth.js";
import userRoute from "./routes/users.js";
import movieRoute from "./routes/movies.js";
import listRoute from "./routes/lists.js";

const app = express();

dotenv.config();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose
	.connect(process.env.MONGO_URI)
	.then(() => {
		console.log(`Mongoose has connected to MongoDB Cluster0`);
	})
	.catch((err) => {
		console.log(`Mongoose COULD NOT connect to MongoDB: ${err}`);
	});

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/movies", movieRoute);
app.use("/api/lists", listRoute);

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
