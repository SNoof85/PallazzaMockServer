// Dependencies
const http = require('http');
const url = require('url');
const fs = require('fs');

// Imports
const statusGenerator = require('../controller/statusGenerator.js');
const config = require('../config/config.js');
const logger = config.logger;

// Instanitate a simple web server
http.createServer(function (req, res) {
    const query = url.parse(req.url, true);

    logger.debug('Processing request: ' + String(req.url));

    // Process the query
    switch (query.pathname)
    {
        // Return the status of the device if status.cgi is queried
        case '/status.cgi':
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify(statusGenerator.getStatus()));
            break;
        // Return a welcome page in every other case
        default:
            fs.readFile('./views/index.html', function(err, data)
            {
                // Try to read index.html
                if (err) {
                    res.writeHead(404, {'Content-Type': 'text/html'});
                    return res.end("404 Not Found");
                }

                let page = String(data);

                // Apply potential configuration changes: port
                page = page.replace(/4200/g, config.port);

                // Return page
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.write(page);
                return res.end();
            });
    }

    logger.debug('Finished processing request: ' + String(req.url));
}).listen(config.port);

logger.info("Server started");