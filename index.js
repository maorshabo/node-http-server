var restify = require('restify');
var request = require('request');
var winston = require('winston');

var server = restify.createServer({
    name: 'Node-http-API',
    version: '1.0.0'
});
var message,client;
var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.File)({ filename: 'logs.log' })
    ]
});

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());
server.use(restify.CORS());
server.use(restify.fullResponse());
function unknownMethodHandler(req, res) {
    if (req.method.toLowerCase() === 'options') {
        var allowHeaders = ['Accept', 'Accept-Version', 'Content-Type', 'Api-Version', 'Origin', 'X-Requested-With','Partner-Name','Partner-Password']; // added Origin & X-Requested-With

        if (res.methods.indexOf('OPTIONS') === -1) res.methods.push('OPTIONS');

        res.header('Access-Control-Allow-Credentials', true);
        res.header('Access-Control-Allow-Headers', allowHeaders.join(', '));
        res.header('Access-Control-Allow-Methods', res.methods.join(', '));
        res.header('Access-Control-Allow-Origin', req.headers.origin);

        return res.send(200);
    }
    else
        return res.send(new restify.MethodNotAllowedError());
}
server.on('MethodNotAllowed', unknownMethodHandler);
server.post('/post', function (req, res, next) {
    message = req.body;
    headers = {
        'Content-Type' : 'application/json',
        'Partner-Name' : req.headers['partner-name'],
        'Partner-Password' : req.headers['partner-password']
    };

    var options = {
        url: message.host + message.url,
        method: 'POST',
        headers: headers,
        body: JSON.stringify(message.data)
    };

    function callback(error, response, body) {
        if (error)
            logger.log('error', response.statusCode, { error: error });
        logger.log('info', 'Response from Zooz', { headers: response, body: body });

        if (body)
            res.send(response.statusCode,JSON.parse(body));
        else
            res.send(response.statusCode);
    }

    request(options, callback);
});

server.listen(8080, function () {
    console.log('%s listening at %s', server.name, server.url);
});