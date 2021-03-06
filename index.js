const express = require('express');
const http = require('https');
const bodyParser = require('body-parser');

const API_KEY = 'I4458ZBCK28A';
const GOOGLE_TOKEN = 'Eyv4qQ28p0u4X4GQvAYNv0txxzsbbLytHZKEOKsoR6k=';

const port = 8080;
const app = express();
const router = express.Router();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

router.use(function (req, res, next) {
    res.setHeader('Content-Type', 'application/json; charset=UTF-8');
    next();
});

app.post('/', (mainRequest, mainResponse) => {
    let text = 'Add parameter';

    if (mainRequest.body.token !== GOOGLE_TOKEN) {
        text = `Forbidden`;
        mainResponse.statusCode = 403;

        return mainResponse.json({text});
    }

    if (mainRequest.body.type === 'ADDED_TO_SPACE' && mainRequest.body.space.type === 'ROOM') {
        text = `Thanks for adding me to ${mainRequest.body.space.displayName}`;

        return mainResponse.json({text});
    } else if (mainRequest.body.type === 'ADDED_TO_SPACE'
        && mainRequest.body.space.type === 'DM') {
        text = `Thanks for adding me to a DM, ${mainRequest.body.user.displayName}`;

        return mainResponse.json({text});
    } else if (mainRequest.body.type === 'MESSAGE') {

        let message = mainRequest.body.message.text.substring(21).trim();

        if (message == '') {
            return mainResponse.json({text});
        }

        // http.get("https://api.tenor.com/v1/anonid?key=" + API_KEY, (res) => {
        //     let anonId;

            // res.on('data', (data) => { anonId = JSON.parse(data).anon_id });

            // res.on('end', () => {
                http.get("https://api.tenor.com/v1/search?q=" + message + "&key=" +
                    API_KEY + "&media_filter=minimal&limit=8", (res) =>
                {
                    let data;

                    res.on('data', (rawData) => { data = JSON.parse(rawData) });

                    res.on('end', () => {
                        if (data.results.length) {
                            let element = data.results[Math.floor(Math.random() * data.results.length)];

                            return mainResponse.json({
                                cards: [{"sections": [{"widgets": [{"image": {
                                    "imageUrl": element.media[0].gif.url
                                }}]}]}]});
                        }

                        text = 'The are no results for "' + message + '"';

                        return mainResponse.json({text});
                    })
                });
            // });
        // });
    } else {
        text = "You are not using me correctly!";

        return mainResponse.json({text});
    }
});

app.get('*', function(req, res){
    res.send('Not Found!', 404);
});

app.listen(port, () => {});
