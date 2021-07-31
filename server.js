// const express = require('express');
const WebSocketServer = require('websocket').server;
const http = require('http');
const port = 8080;
const server = http.createServer((req, res) => {
	console.log(new Date() + ' Recved reqest for ' + req.url);
	res.writeHead(404);
	res.end();
});

server.on('upgrade', msg => {
	// console.log('upgrade is needed:', msg);
});

server.listen(port, () => {
	console.log(`${new Date()} server is listening on ${port}`);
});

const originAllowed = origin => {
	console.log(`origin ${origin} is checked but return true`);
	return true; //TODO: change to the right logic
};

const wsServer = new WebSocketServer({
	httpServer: server,
	autoAcceptConnections: false,
});

const buff = [];
const clients = [];

wsServer.on('request', req => {
	console.log('request', req);
	if (!originAllowed(req.origin)) {
		req.reject(`origin ${req.origin} is not allowed`);
		return;
	}

	const conn = req.accept('echo-protocol', req.origin);
	clients.push(conn);
	console.log(new Date() + ' Connection accepted.');

	conn.on('message', msg => {
		console.log('message:', msg);
		// wsServer.broadcast(msg);
		// conn.emit('message', 'my-data');
		// conn.sendUTF('recv');
		if (msg.type === 'utf8') {
			clients.forEach(c => {
				const len = c.send(msg.utf8Data);
				console.log('message:', msg, '/', len);
				// c.sendUtf8(msg)
			});
		}
	});

	conn.on('close', data => {
		console.log('close', data);
	});
});

wsServer.on('connect', connectedClient => {
	console.log('connect', connectedClient);

	// connectedClient.on('request', req => {
	// 	console.log('request', req);
	// 	if (!originAllowed(req.origin)) {
	// 		req.reject(`origin ${req.origin} is not allowed`);
	// 		return;
	// 	}

	// 	const conn = req.accept('echo-protocol', req.origin);
	// 	clients.push(conn);
	// 	console.log(new Date() + ' Connection accepted.');

	// 	conn.on('message', msg => {
	// 		// wsServer.broadcast(msg);
	// 		if (msg.type === 'utf8') {
	// 			clients.forEach(c => {
	// 				const len = c.sendUTF(msg);
	// 				console.log('message:', msg, '/', len);
	// 				// c.sendUtf8(msg)
	// 			});
	// 		}
	// 	});

	// 	conn.on('close', data => {
	// 		console.log('close', data);
	// 	});
	// });
});
