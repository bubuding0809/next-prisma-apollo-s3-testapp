import aws from "aws-sdk";

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res.status(403).json({
      message: "Method not allowed",
    });
  }

  try {
    // 1.
    const s3 = new aws.S3({
      accessKeyId: process.env.APP_AWS_ACCESS_KEY,
      secretAccessKey: process.env.APP_AWS_SECRET_KEY,
      region: process.env.APP_AWS_REGION,
    });

    // 2.
    aws.config.update({
      accessKeyId: process.env.APP_AWS_ACCESS_KEY,
      secretAccessKey: process.env.APP_AWS_SECRET_KEY,
      region: process.env.APP_AWS_REGION,
      signatureVersion: "v4",
    });

    // 3.
    const objectParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: req.body.split("/").pop(),
    };

    // 4.
    try {
      await s3.headObject(objectParams).promise();
    } catch (err) {
      return res.status(404).json(err);
    }

    // 5.
    await s3
      .deleteObject(objectParams, (err, data) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully deleted object", data);
        }
      })
      .promise();

    return res.status(200).json({ message: "Image deleted" });
  } catch (error) {
    return res.status(500).json(error);
  }
}
