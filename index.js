const express = require('express');
const http = require('https');

const API_KEY = 'I4458ZBCK28A';

const port = 8080;
const app = express();
const router = express.Router();

router.use(function timeLog (req, res, next) {
    res.setHeader('Content-Type', 'application/json; charset=UTF-8');
    next()
});

app.get('/', (req, res) => {
    res.statusCode = 200;
    res.end(JSON.stringify({message: 'Works fine.'}));
});

app.get('/gif', function (req, res) {
    if (req.query.q.length) {
        response(req.query.q);
    }

    res.send(JSON.stringify({message: 'Sent gif!'}))
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

function response(query) {
    http.get("https://api.tenor.com/v1/anonid?key=" + API_KEY, (res) => {
        let anonId;

        res.on('data', (data) => { anonId = JSON.parse(data).anon_id });

        res.on('end', () => {
            http.get("https://api.tenor.com/v1/search?tag=" + query + "&key=" +
                API_KEY + "&limit=1&anon_id=" + anonId, (res) =>
            {
                let data;

                res.on('data', (rawData) => { data = JSON.parse(rawData) });

                res.on('end', () => {
                    if (data.results.length) {
                        let postData = JSON.stringify({
                            cards: [{"sections": [{"widgets": [{"image": {
                                "imageUrl": data.results[0].media[0].gif.url
                            }}]}]}]});

                        let options = {
                            host: 'chat.googleapis.com',
                            path: '/v1/spaces/AAAA5bxLNhk/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=J70KRSi_2j6hr1GosiBewEbGnBzUCQEMedGe_8bPpGg%3D',
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json; charset=UTF-8',
                                'Content-Length': postData.length
                            }
                        };

                        let req = http.request(options, function(res) {});

                        req.write(postData);
                        req.end();
                    }
                })
            });
        });
    });
}
