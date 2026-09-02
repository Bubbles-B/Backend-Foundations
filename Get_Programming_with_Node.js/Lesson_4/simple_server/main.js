//Listing 4.1

// Set the port number the server will listen on
const port = 3000,

    http = require("http"),
    httpStatus = require("http-status-codes"),

    // Create an HTTP server
    app = http.createServer((request, response) => {
        console.log("Received an incoming request!");
        response.writeHead(httpStatus.StatusCodes.OK, {
            "Content-Type": "text/html"
        });

        //http://localhost:3000/

        // Define the HTML response message
        let responseMessage = "<h1>Hello, Universe!</h1>";
        response.write(responseMessage);
        console.log(`Sent a response : ${responseMessage}`);
    });

// Start the server and listen on the defined port
app.listen(port);

// Log a message indicating that the server is running
console.log(`The server has started and is listening on port number: ${port}`);

//strikethrough means is no longer recommended for use in the latest version of the http-status library.