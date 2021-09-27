/* eslint-disable class-methods-use-this */
var http = require("http");
var url = require("url");
const Socks = require('socks').SocksClient;
var fs = require("fs");
var util = require("util");

module.exports = function (log) {
    class ProxyServer extends http.Server {
        constructor(options) {
            super();
            //http.Server.call(this, () => { });
            this.proxyList = [];
            if (options.socks) {
                // stand alone proxy loging
                this.loadProxy(options.socks);
            } else if (options.socksList) {
                // proxy list loading
                this.loadProxyFile(options.socksList);
                if (options.proxyListReloadTimeout) {
                    setInterval(
                        () => {
                            this.loadProxyFile(options.socksList);
                        },
                        options.proxyListReloadTimeout * 1000
                    );
                }
            }
            this.addListener(
                'request',
                this.requestListener.bind(this, () => this.randomElement(this.proxyList))
            );
            this.addListener(
                'connect',
                this.connectListener.bind(this, () => this.randomElement(this.proxyList))
            );
        }

        randomElement(array) {
            return array[Math.floor(Math.random() * array.length)];
        }

        getProxyObject(host, port, login, password) {
            return {
                ipaddress: host,
                // eslint-disable-next-line radix
                port: parseInt(port, 10),
                type: 5,
                authentication: {
                    username: login || '',
                    password: password || ''
                }
            };
        }

        parseProxyLine(line) {
            const proxyInfo = line.split(':');

            if (proxyInfo.length !== 4 && proxyInfo.length !== 2) {
                throw new Error(`Incorrect proxy line: ${line}`);
            }

            return this.getProxyObject.apply(this, proxyInfo);
        }

        requestListener(getProxyInfo, request, response) {
            log("[SOCKS2HTTP]", `request: ${request.url}`);

            const proxy = getProxyInfo();
            const ph = url.parse(request.url);

            const socksAgent = new Socks.Agent({
                proxy,
                destination: {
                    host: ph.hostname,
                    port: ph.port
                }
            });

            const options = {
                port: ph.port,
                hostname: ph.hostname,
                method: request.method,
                path: ph.path,
                headers: request.headers,
                agent: socksAgent
            };

            const proxyRequest = http.request(options);

            request.on('error', (err) => {
                log("[SOCKS2HTTP]", `${err.message}`);
                proxyRequest.destroy(err);
            });

            proxyRequest.on('error', (error) => {
                log("[SOCKS2HTTP]", `${error.message} on proxy ${proxy.ipaddress}:${proxy.port}`);
                response.writeHead(500);
                response.end('Connection error\n');
            });

            proxyRequest.on('response', (proxyResponse) => {
                proxyResponse.pipe(response);
                response.writeHead(proxyResponse.statusCode, proxyResponse.headers);
            });

            request.pipe(proxyRequest);
        }

        connectListener(getProxyInfo, request, socketRequest, head) {
            const proxy = getProxyInfo();

            const ph = url.parse(`http://${request.url}`);
            const host = ph.hostname;
            const port = parseInt(ph.port);

            const options = {
                proxy,
                destination: {
                    host,
                    port
                },
                command: 'connect'
            };

            let socket;

            socketRequest.on('error', (err) => {
                log("[SOCKS2HTTP]", `${err.message}`);
                if (socket) {
                    socket.destroy(err);
                }
            });

            Socks.createConnection(options, (error, _socket) => {
                try {
                    socket = _socket.socket;
                    socket.on('error', (err) => {
                        log("[SOCKS2HTTP]", `${err.message}`);
                        socketRequest.destroy(err);
                    });
                } catch (ex) { }

                if (error) {
                    // error in SocksSocket creation
                    log("[SOCKS2HTTP]", `${error.message} connection creating on ${proxy.ipaddress}:${proxy.port}`);
                    socketRequest.write(`HTTP/${request.httpVersion} 500 Connection error\r\n\r\n`);
                    socketRequest.end();
                    return;
                }

                // tunneling to the host
                socket.pipe(socketRequest);
                socketRequest.pipe(socket);

                socket.write(head);
                socketRequest.write(`HTTP/${request.httpVersion} 200 Connection established\r\n\r\n`);
                socket.resume();
            });
        }

        loadProxy(proxyLine) {
            try {
                this.proxyList.push(this.parseProxyLine(proxyLine));
            } catch (ex) {
                log("[SOCKS2HTTP]", ex.message);
            }
        }

        loadProxyFile(fileName) {
            log("[SOCKS2HTTP]", `Loading proxy list from file: ${fileName}`);

            fs.readFile(fileName, (err, data) => {
                if (err) {
                    log("[SOCKS2HTTP]", `Impossible to read the proxy file : ${fileName} error : ${err.message}`);
                    return;
                }

                const lines = data.toString().split('\n');
                const proxyList = [];
                for (let i = 0; i < lines.length; i += 1) {
                    if (!(lines[i] !== '' && lines[i].charAt(0) !== '#')) {
                        try {
                            proxyList.push(this.parseProxyLine(lines[i]));
                        } catch (ex) {
                            log("[SOCKS2HTTP]", ex.message);
                        }
                    }
                }
                this.proxyList = proxyList;
            });
        }
    }
    util.inherits(ProxyServer, http.Server);
    return ProxyServer;
}
