// const express = require('express');
const WebSocketServer = require('websocket').server;

const COMMANDS = Object.freeze({
	// START_DRAW: 1,
	// END_DRAW: 2,
	// CHAT_TYPING: 3,
	// CHAT_INPUT: 4,
	CLIENT_CLOSED: 95,
	MASTER_SHOULD_SHARE: 96,
	REGISTER_INFO: 97,
	REGISTER_MASTER: 98,
	REGISTER_SLAVE: 99,
});

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

const cache = {
	clients: [],
};

const registerMsterPayload = info => {
	return JSON.stringify({
		cmd: COMMANDS.REGISTER_MASTER, //client info,
		clientLevel: 0,
		info,
	});
};

const registerSlavePayload = info => {
	return JSON.stringify({
		cmd: COMMANDS.REGISTER_SLAVE, //client info,
		clientLevel: 1,
		info,
	});
};

const clientPrefix = parseInt(Math.random() * 1000000);
let clientIdSeed = 1;
let masterId = null;

const getUniqId = () => {
	let limit = 100;
	while (limit-- > 0) {
		clientIdSeed++;
		const clientId = clientPrefix * clientIdSeed;
		if (!cache.clients.find(c => c.id === clientId)) {
			return clientId;
		}
	}
	throw Error('failed to create a uniq ID. please fix the algorithm.');
};

const acceptRequest = (req, protocol, origin) => {
	const conn = req.accept(protocol, origin);
	let clientId;
	try {
		clientId = getUniqId();
	} catch (e) {
		console.log(e.message);
		conn.close();
	}

	console.log(new Date() + ' Connection accepted.');

	conn.on('message', msg => {
		if (msg.type === 'utf8') {
			cache.clients.forEach(c => {
				const len = c.conn.send(msg.utf8Data);
			});
		}
	});

	conn.on('close', data => {
		cache.clients = cache.clients.filter(c => c.id !== clientId);
		if (masterId === clientId && cache.clients.length > 0) {
			console.log('reassign master');
			cache.clients[0].conn.send(registerMsterPayload({ id: clientId }));
			for (let c of cache.clients) {
				c.conn.send(
					JSON.stringify({ cmd: COMMANDS.CLIENT_CLOSED, id: clientId })
				);
			}
		}
		console.log('close', data);
	});

	if (cache.clients.length === 0) {
		//first client
		conn.send(registerMsterPayload({ id: clientId }));
		masterId = clientId;
	} else {
		conn.send(registerSlavePayload({ id: clientId }));
		cache.clients[0].conn.send(
			JSON.stringify({
				cmd: COMMANDS.MASTER_SHOULD_SHARE, //master should share all clients' info
			})
		);
	}
	cache.clients.push({ id: clientId, conn });

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
