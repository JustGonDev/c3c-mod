var net = require('net');

/**
 * Check if that port on that address can be listenable
 *
 * @param   {number}  port      A port you want to check
 * @param   {string}  address   An address you want to check on
 *
 * @return  {Promise<Boolean>}  A promise that will resolve with either true/false (listenable/not listenable)
 */
module.exports = function checkPort(port, address) {
    typeof port == "string" ? port = parseInt(port) : "";
    isNaN(port) ? port = 80 : "";
    typeof port != "number" ? port = 80 : "";
    typeof address != "string" ? address = "0.0.0.0" : "";
    return new Promise((resolve, reject) => {
        try {
            var server = net.createServer(function(socket) {
                socket.write('Testing port...');
                socket.pipe(socket);
            });
            server.listen(port, address);
            server.on('error', function () {
                resolve(true);
            });
            server.on('listening', function () {
                server.close();
                resolve(false);
            });
        } catch (ex) {
            reject(ex);
        }
    });
};
