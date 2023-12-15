import jwt from "jsonwebtoken";

export default (req, res, next) => {
	const authHeader = req.headers.authorization;
	if (authHeader) {
		const token = authHeader.split(" ")[1]; // Bearer <token>

		jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
			if (err) {
				return res.status(403).json("Token is not valid!");
				req.user = user;
				next();
			}

			req.user = user;
			next();
		});
	} else {
		return res.status(401).json("You are not authenticated!");
	}
};
