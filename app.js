const express = require("express");
const axios = require('axios'); // Import axios once
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT;

app.set("view engine", "ejs");
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const allowedOrigins = [
  'http://localhost:4200',
  'http://localhost:3000',
  // Add production URLs here
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
}));

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/convert-mp3", async (req, res) => {
  const videoId = req.body.videoId;

  if (!videoId) {
    return res.status(400).json({ success: false, message: "Please enter a video ID" });
  }

  try {
    const fetchAPI = await axios.get(`https://youtube-mp36.p.rapidapi.com/dl?id=${videoId}`, {
      headers: {
        "x-rapidapi-key": process.env.API_KEY,
        "x-rapidapi-host": process.env.API_HOST
      }
    });
    
    const fetchResponse = fetchAPI.data;
    if (fetchResponse.status === "ok") {
      res.json({
        success: true,
        song_title: fetchResponse.title,
        song_link: fetchResponse.link
      });
    } else {
      res.status(fetchResponse.status === "invalid id" ? 400 : 500).json({
        success: false,
        message: fetchResponse.msg || "Conversion failed"
      });
    }
  } catch (error) {
    console.error("Error during conversion:", error);
    res.status(500).json({ success: false, message: "An error occurred during conversion." });
  }
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
