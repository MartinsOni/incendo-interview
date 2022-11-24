import http from "http";
import dotenv from "dotenv"
import axios from "axios";
import fs from "fs";
import json2csv from "json2csv";

dotenv.config();

const LAST_FM_API_KEY = process.env.LAST_FM_API_KEY;

// console.log(LAST_FM_API_KEY);

async function fetchArtistData() {
    http.createServer(function (req, res) {
        if (req.url.startsWith("/search&artist")) {
            let artist = req.url.split("=")[1];
            // console.log(artist)
            res.setHeader("Content-disposition", "attachment; filename=artist-detail.csv");
            axios.get(`http://ws.audioscrobbler.com/2.0/?method=artist.search&artist=${artist}&api_key=${LAST_FM_API_KEY}&format=json`)
                .then(response => {
                    if (response.data.results.artistmatches.artist.length > 0) {
                        const artistDetails = response.data.results.artistmatches.artist
                            .map(function (param) {
                                return { "name": param.name, "mbid": param.mbid, "url": param.url, "image_small": param.image[0]["#text"], "image": param.image[2]["#text"] }
                            })
                        let csvString = json2csv.parse(artistDetails);
                        // console.log(csvString);
                        res.write(csvString);
                    } else {
                        let artistData = JSON.parse(fs.readFileSync("text.json"));
                        let randomArtistDetail = artistData[Math.floor(Math.random() * artistData.length)];
                        // console.log(randomArtistDetail)
                        let csvString = json2csv.parse(randomArtistDetail);
                        res.write(csvString);
                    }
                    res.end();

                })
                .catch(error => {
                    console.log(error);
                });
        }
    }).listen(8001, () =>  {
        console.log(`The server is listening for requests 8001`);
    });
}
setTimeout(() => {
    fetchArtistData()
}, 2000)