const https = require('https');
const fs = require('fs');
const axios = require('axios');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser')
const express = require('express');
const path = require('path');
const cors = require("cors");
const app = express();
const port = process.env.PORT || 4000;

// const Round = require('./round')

const options = {
  // key: fs.readFileSync('server.key'),
  // cert: fs.readFileSync('server.cert')
};
app.use(cors());
app.use(express.static('public')); 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());


app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});
app.get('/company-horse', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

// app.get('/data/:id', async (req, res, next) => {

//   console.log("hi respose")
//   const response = await axios.get(`https://eu-central-1.linodeobjects.com/games-encoded-storage/games-videos/vhr-cue-ns/${req.params.id}.webvtt`);
  
//   const objects = response.data.match(/{.*?}/g).map(JSON.parse);
//   let a = [...objects];
//   res.json(a)

//   next()

// })

// app.get('/api/win', async (req, res, next) => {
//   console.log("api win-------")
//   const response = await axios.get(`http://54.183.245.65/api/win.php`);
//   console.log(response.data)
//   res.json(response.data)
//   next()
// })

// app.post('/getVideoId', (req, res, next) => {
//   console.log( req.body)

//   const { tickets } = req.body
//   console.log(tickets)
//   axios.post(`http://54.183.245.65/api/bet.php`, req.body);
//   // let videoID = videoIds[Math.round(Math.random() * videoIds.length)];
//   // res.json(videoID);
//   res.json("success");
//   next()
// })

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


// const round = Round();
// round.init()


// const videoIds = [
//   "77ce775833e94f2f848f84a5cd17a976",
// "897f4738f55cbe54664dc024e4c0a5c6",
// "72fa02d2eede51dd06e6c4786df893f3",

// "606bda995f8db9a3825ec039e34b9624",
// "2b25b85265f8433cdc0c96d7dccb4988",

// "dd3bc1078532d0e9fedd9b10972dce5e",

// "66c52328c62604204eebfbeb97ab2b27",

// "40e3bed790663b12e75bb47a6a2edd23",

// "7e51ea0e9e35a9738698b472ace2b322",

// "e3090d73cef80026f87a2b7eff196b89",
// "f3572b7f06cc62e7f0e1cb9da62d05b9",

// "1e0edb223ac6915b8b2f163fe44d8bc2",

// "3722a08cd8431b9598e37022025c692f",

// "3cff913e97bcdb333ff66b4cc83151b1",

// "6343f5096ba35984002bac85dfe0474f", 
// "c8dd81c12aeb26ad937d656e1963257d",

// "03bb2953ca4560589267ff662cafa78e",

// "78fdc68b607a27fd3796912c0efa70a3",

// "a032d2da3cc3ad72e9c5d84c8d1591df",

// "1bebd97240d79aecbc81891dd62c2dc9",

// "3eca0fd3c95d38864aaac1b9a9a23ef6",

// "6eacb0956e640c5da61a3717aeaae5c1",

// "d21a6e3c143db6d2076203fd38c5bf2f",

// "aeaf89cd76399a9f4559e4480ac6b556",

// "3cca01d2f9899208488dfc3b4b902a9f",

// "6f956ffca6aea7bed3c66c6aa0b111d9",

// "b660a980d7150df4ddec897efbd5c972",

// "1681c65df40d75793fba1a15e0e97a44",

// "b084a70ed40dd68acf656ddf2cb11a3d",

// "3e8d86d77bbd3dc3eb812c47ed39b6ce",

// "8e67834b9492a336c49b4fc0ae6a16b8", 
// "422b9c25df518ec1b4c615638188c86a",

// "f93723abb4b87d9bb3c69e30798c379b",

// "065dcb55715ce3e419fb2fa7bb40a09a", 
// "1a587ad77eabaf26cb6cb7584a3e19e2",

// "730cfdd5896d7539d0fa6cb8182001a6",
// ];
