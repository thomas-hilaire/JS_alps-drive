const express = require('express');
const url = require('url');
const driveFs = require('./fs');
const router = express.Router();

const VALIDE_FOLDER_REGEX = new RegExp('^[a-zA-Z0-9 ]+$');
const VALIDE_FILE_REGEX = new RegExp('^[a-zA-Z0-9. ]+$');

const parseItemPaths = requestUrl => {
    const urlParts = url.parse(requestUrl).pathname.split('/').filter(Boolean);
    return {
        paths: urlParts,
        item: urlParts[urlParts.length - 1],
    };
};

router.post('/*', async (req, res, next) => {
    const {paths} = parseItemPaths(req.url);

    if (!req.query.name) {
        return res.status(400).send('No folder name');
    }
    if (!VALIDE_FOLDER_REGEX.test(req.query.name)) {
        return res.status(400).send('The folder name contains illegal chars');
    }
    if (!await driveFs.exists(paths)) {
        return res.status(404).send(`"${paths}" has been not found`);
    }

    try {
        await driveFs.createFolder([...paths, req.query.name]);
        return res.sendStatus(201);
    } catch (error) {
        return res.status(500).send(`Cannot create the folder: ${error}`);
    }
});

router.put('/*', async (req, res, next) => {
    const {paths} = parseItemPaths(req.url);
    const file = req.files.file;

    if (!file || !file.filename) {
        return res.status(400).send('No file received');
    }
    if (!VALIDE_FILE_REGEX.test(file.filename)) {
        return res.status(400).send('The file name is not valid');
    }
    if (!await driveFs.exists(paths)) {
        return res.status(404).send(`"${req.url}" has been not found`);
    }

    try {
        await driveFs.moveFile(paths, file);
        return res.sendStatus(201);
    } catch (error) {
        return res.status(500).send(`Cannot create the file: ${error}`);
    }
});

router.delete('/*', async (req, res, next) => {
    const {paths, item} = parseItemPaths(req.url);

    if (!paths || paths.length === 0) {
        return res.status(400).send('No name');
    }
    if (!VALIDE_FILE_REGEX.test(item)) {
        return res.status(400).send('The name is not valid');
    }
    if (!await driveFs.exists(paths)) {
        return res.status(404).send(`"${req.url}" has been not found`);
    }

    try {
        await driveFs.deleteItem(paths);
        return res.sendStatus(200);
    } catch (error) {
        return res.status(500).send(`Cannot delete the file: ${error}`);
    }
});

router.get('/*', async (req, res, next) => {
    const {paths} = parseItemPaths(req.url);

    if (!await driveFs.exists(paths)) {
        return res.status(404).send(`"${req.url}" has been not found`);
    }

    try {
        const data = await driveFs.readFile(paths);
        return res.send(data);
    } catch (error) {
        return res.status(500).send(`Cannot read the content: ${error}`);
    }
});

module.exports = router;
