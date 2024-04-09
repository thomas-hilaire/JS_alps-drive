const express = require('express');
const busboy = require('express-busboy');
const driveFs = require('./api/drive/fs');
const driveRouter = require('./api/drive/router');
const fs = require("fs");
const path = require("path");
const os = require("os");

const app = express();
const port = 3000;
const startServer = () => app.listen(port, () => {
    console.log(`Alps Box Server listening on port ${port}! You can now open http://localhost:${port} in your browser`)
});

busboy.extend(app, {upload: true});
app.use( function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader("Access-Control-Allow-Headers", "*");
    next();
});
app.use('/', express.static('frontend'));
app.use('/api/drive', driveRouter);

driveFs.ensureDriveFolderExists()
    .then(startServer)
    .catch(err => console.error(`Alps Box Server cannot start ! ${err}`));
