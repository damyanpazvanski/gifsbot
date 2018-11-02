const express = require('express');
const http = require('https');

const API_KEY = 'I4458ZBCK28A';

const port = 8080;
const app = express();
const router = express.Router();

router.use(function (req, res, next) {
    res.setHeader('Content-Type', 'application/json; charset=UTF-8');
    next();
});

app.post('/', (mainRequest, mainResponse) => {
    let text = '';

    if (mainRequest.body.token !== 'Eyv4qQ28p0u4X4GQvAYNv0txxzsbbLytHZKEOKsoR6k=') {
        text = `Forbidden`;
        mainResponse.statusCode = 403;

        return mainResponse.json({text});
    }

    if (mainRequest.body.type === 'ADDED_TO_SPACE' && mainRequest.body.space.type === 'ROOM') {
        text = `Thanks for adding me to ${mainRequest.body.space.displayName}`;
    } else if (mainRequest.body.type === 'ADDED_TO_SPACE'
        && mainRequest.body.space.type === 'DM') {
        text = `Thanks for adding me to a DM, ${mainRequest.body.user.displayName}`;
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
                            return mainResponse.json({
                                cards: [{"sections": [{"widgets": [{"image": {
                                                "imageUrl": data.results[0].media[0].gif.url
                                            }}]}]}]});
                        }

                        text = `The are no results for "${mainRequest.body.message.text}"`;
                    })
                });
            });
        });
    }

    return mainResponse.json({text});
});

app.get('*', function(req, res){
    res.send('Not Found!', 404);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
