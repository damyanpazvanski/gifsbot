const express = require('express');
const http = require('https');
const bodyParser = require('body-parser');

const API_KEY = 'I4458ZBCK28A';
const GOOGLE_TOKEN = 'Eyv4qQ28p0u4X4GQvAYNv0txxzsbbLytHZKEOKsoR6k=';

const port = 8080;
const app = express();
const router = express.Router();

app.use(bodyParser.urlencoded({extended: false}))
    .use(bodyParser.json());

router.use(function (req, res, next) {
    res.setHeader('Content-Type', 'application/json; charset=UTF-8');
    next();
});

app.post('/', (mainRequest, mainResponse) => {
    let text = '';

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
                            response(mainRequest.body, true, data.results[0].media[0].gif.url);
                            return mainResponse.json({
                                cards: [{"sections": [{"widgets": [{"image": {
                                                "imageUrl": data.results[0].media[0].gif.url
                                            }}]}]}]});
                        }

                        response(mainRequest.body, false, '');
                    })
                });
            });
        });
    } else {
        return mainResponse.json({text});
    }
});

app.get('*', function(req, res){
    res.send('Not Found!', 404);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

function response(requestBody, isGif, gifUrl) {
    let postData = '{"text": "The are no results for ' + mainRequest.body.message.text + '"}';

    if (isGif) {
        postData = JSON.stringify({cards: [{"sections": [{"widgets": [{"image": {"imageUrl": gifUrl}}]}]}]});
    }

    let options = {
        host: 'chat.googleapis.com',
        path: '/v1/' + requestBody.space.name + '/messages?token=' + GOOGLE_TOKEN,
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
