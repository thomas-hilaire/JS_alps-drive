const {expect} = require('chai');
const express = require('express');
const request = require('supertest');

const fs = require('./fs');
const router = require('./router');

describe('Drive router', () => {

    let app;

    beforeEach(() => {
        app = express();
        app.use(router);
    });

    describe('on POST', () => {

        it('should reject the request with an error 400 when the name is invalid', async () => {
            await request(app)
                .post('/')
                .query({name: 'ne doit pas contenir de .'})
                .expect(400, 'The folder name contains illegal chars');
        });

        it('should reject the request with an error 404 when the folder is not found', async () => {
            await request(app)
                .post('/notExisting')
                .query({name: 'ok'})
                .expect(404, '"notExisting" has been not found');
        });

        it('should create a folder when the name is valid', async () => {
            await request(app)
                .post('/')
                .query({name: 'ok'})
                .expect(201);

            const newFolder = await fs.readFile(['ok']);

            expect(newFolder).to.be.empty;
        });

    });
});
