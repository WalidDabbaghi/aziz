const express = require("express");
const fetch = require("node-fetch");
const request = require('request');
const cors = require('cors');

require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.use(express.static('public'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const allowedOrigins = [
  'http://localhost:4200',  // Your Angular dev server - VERY IMPORTANT!
  'http://localhost:3000', // Only if backend/frontend are on the same port during dev
  // Add other origins here as needed (e.g., your deployed Angular app's domain)
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
  res.render("index"); // Or res.sendFile(...) if not using EJS
});
app.post("/convert-mp3", async (req, res) => {
  const videoId = req.body.videoId;

  if (!videoId) {
    return res.status(400).json({ success: false, message: "Please enter a video ID" });
  }
  try {
    const fetchAPI = await fetch(`https://youtube-mp36.p.rapidapi.com/dl?id=${videoId}`, {
      "method": "GET",
      "headers": {
        "x-rapidapi-key": process.env.API_KEY, // Make sure you have this in your .env file
        "x-rapidapi-host": process.env.API_HOST // Make sure you have this in your .env file
      }
    });
    const fetchResponse = await fetchAPI.json();
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