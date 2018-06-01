// Dependencies
const http = require('http');
const url = require('url');
const fs = require('fs');

// Imports
const statusGenerator = require('../controller/statusGenerator.js');
const config = require('../config/config.js');
const logger = config.logger;

// Instanitate a simple web server
http.createServer(function (request, response)
{
    const query = url.parse(request.url, true);
    const { headers } = request;

    logger.debug("===================================");
    logger.debug("Processing " + request.method);
    logger.debug("URL: " + String(request.url));
    logger.debug("HEADER: " + JSON.stringify(headers));

    if (request.method === "GET")
    {
        // Process the query
        switch (query.pathname) {
            // Return the status of the device if status.cgi is queried
            case '/status.cgi':
                response.writeHead(200, {'Content-Type': 'application/json'});
                response.end(JSON.stringify(statusGenerator.getStatus()));
                break;
            // Return a welcome page in every other case
            default:
                fs.readFile('./views/index.html', function (err, data) {
                    // Try to read index.html
                    if (err) {
                        response.writeHead(404, {'Content-Type': 'text/html'});
                        return response.end("404 Not Found");
                    }

                    let page = String(data);

                    // Apply potential configuration changes: port
                    page = page.replace(/4200/g, config.port);

                    // Return page
                    response.writeHead(200, {'Content-Type': 'text/html'});
                    response.write(page);
                    return response.end();
                });
        }

        logger.debug('Finished processing request: ' + String(request.url));
    }
    else if (request.method === "POST")
    {
        // Retrieve the body
        let body = [];
        request.on('data', (chunk) =>
        {
            body.push(chunk);
        }).on('end', () =>
        {
            // Finish collecting body
            body = Buffer.concat(body).toString();
            logger.debug("BODY: " + body);

            // Extract HSPINht
            logger.debug("H-XS-PIN: " + headers['x-hs-pin']);

            if (statusGenerator.setState(headers['x-hs-pin'], body))
            {
                // Secret is valid. Accept body
                response.writeHead(200, {'Content-Type': 'text/html'});
                response.write("Success");
            }
            else
            {
                // Secret is invalid. Decline body
                response.writeHead(418, {'Content-Type': 'text/html'});
            }

            logger.debug('Finished processing request: ' + String(request.url));
            return response.end();
        });
    }
}).listen(config.port);

logger.info("Server started");