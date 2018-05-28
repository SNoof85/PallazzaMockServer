// Dependencies
var http = require('http');
var url = require('url');
var fs = require('fs');
var statusGenerator = require('../controller/statusGenerator.js');
var config = require('../config/config.js');

// Instanitate a simple web server
http.createServer(function (req, res) {
    var query = url.parse(req.url, true);

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

                var page = String(data);

                // Apply potential configuration changes: port
                page = page.replace(/4200/g, config.port);

                // Return page
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.write(page);
                return res.end();
            });
    }
}).listen(config.port);