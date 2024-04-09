const fs = require('fs');
const os = require('os');
const path = require('path');

const DRIVE_PATH = path.join(os.tmpdir(), 'AlpsBox-Drive');

async function ensureDriveFolderExists() {
    if (await exists(['/'])) {
        return;
    }
    return createFolder(['/']);
}

function createFolder(paths) {
    return fs.promises.mkdir(path.join(DRIVE_PATH, ...paths), {recursive: true});
}

function readStat(paths) {
    return fs.promises.stat(path.join(DRIVE_PATH, ...paths));
}

function toAlpsFile(paths) {
    return async file => {
        if (file.isDirectory()) {
            return {name: file.name, isFolder: true};
        }
        return {
            name: file.name,
            isFolder: false,
            size: (await readStat([...paths, file.name])).size,
        };
    };
}

async function listFolder(paths) {
    const folderPath = path.join(DRIVE_PATH, ...paths);
    const folderFiles = await fs.promises.readdir(folderPath, {withFileTypes: true});
    const alpsFilesPromises = folderFiles.map(toAlpsFile(paths));
    return Promise.all(alpsFilesPromises);
}

function moveFile(paths, file) {
    return fs.promises.rename(file.file, path.join(DRIVE_PATH, ...paths, file.filename));
}

async function deleteItem(paths) {
    const stat = await readStat(paths);
    if (stat.isDirectory()) {
        return fs.promises.rmdir(path.join(DRIVE_PATH, ...paths), {recursive: true});
    }
    return fs.promises.unlink(path.join(DRIVE_PATH, ...paths));
}

async function readFile(paths) {
    const stat = await readStat(paths);
    if (stat.isDirectory()) {
        return listFolder(paths);
    }
    return fs.promises.readFile(path.join(DRIVE_PATH, ...paths));
}

function exists(paths) {
    return fs.promises.access(path.join(DRIVE_PATH, ...paths), fs.constants.F_OK)
        .then(() => true)
        .catch(() => false);
}

module.exports = {
    createFolder,
    deleteItem,
    ensureDriveFolderExists,
    exists,
    listFolder,
    moveFile,
    readFile,
};
