import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand, DeleteObjectCommand, S3 } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

const region = process.env.AWS_REGION;
const bucketName = process.env.AWS_BUCKET_NAME;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID_MOVIES;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY_MOVIES;

const s3 = new S3({
	region,

	credentials: {
		accessKeyId,
		secretAccessKey,
	},

	// The key signatureVersion is no longer supported in v3, and can be removed.
	// @deprecated SDK v3 only supports signature v4.
	signatureVersion: "4",
});

export async function generateMovieUploadURL(Key) {
	const uploadURL = await getSignedUrl(
		s3,
		new PutObjectCommand({
			Bucket: bucketName,
			Key: `movies/full_trailer/${Key}`,
		}),
		{
			expiresIn: 30,
		}
	);

	return uploadURL;
}

export async function deleteMovieFromS3(Key) {
	const deleteURL = await getSignedUrl(
		s3,
		new DeleteObjectCommand({
			Bucket: bucketName,
			Key: `movies/full_trailer/${Key}`,
		}),
		{
			expiresIn: 30,
		}
	);

	return deleteURL;
}
