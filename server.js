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

const clients = [];

const acceptRequest = (req, protocol, origin) => {
	const conn = req.accept(protocol, origin);

	if (clients.length > 0) {
		console.log('===socket info==');
		console.log(conn.socket._peername);
		console.log('==========');
		clients[0].send(
			JSON.stringify({
				cmd: 99, //client info,
				conn: conn.socket._peername,
				temp: 'hey',
			})
		);
		conn.send(
			JSON.stringify({
				cmd: 98, //client info,
				conn: clients[0].socket._peername,
				temp: 'hey',
			})
		);
	}
	clients.push(conn);
	// console.log('===>\n', conn);

	console.log(new Date() + ' Connection accepted.');

	conn.on('message', msg => {
		if (msg.type === 'utf8') {
			clients.forEach(c => {
				const len = c.send(msg.utf8Data);
			});
		}
	});

	conn.on('close', data => {
		console.log('close', data);
	});
	return conn;
};

wsServer.on('request', req => {
	if (!originAllowed(req.origin)) {
		req.reject(`origin ${req.origin} is not allowed`);
		return;
	}

	const conn = acceptRequest(req, 'echo-protocol', req.origin);
});

wsServer.on('connect', connectedClient => {
	// console.log('connected', connectedClient);
	console.log('================================================');
});
