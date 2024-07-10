const express = require("express");
const cors = require("cors");
const { S3Client, PutObjectCommand, S3 } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
const PORT = 8000;

app.use(express.json());
app.use(cors());

const client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

app.post("/generate-presigned-url", async (req, res) => {
  try {
    const { fileName, fileType } = req.body;

    const command = new PutObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: fileName,
      ContentType: fileType,
      Metadata: {},
    });

    const url = await getSignedUrl(client, command, {
      expiresIn: 1800,
    });
    console.log(`Generated a new presigned url ${url}`);
    return res.status(201).json({ url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error generating presigned URL" });
  }
});

app.listen(PORT, () => {
  console.log(`Listening on PORT ${PORT}`);
});
