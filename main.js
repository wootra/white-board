import { setupDrawingArea } from './canvas/canvas-from-mouse.js';
import {
	drawCanvasFromData,
	setDrawAreaInactive,
	setupDrawAreaFromServer,
} from './canvas/canvas-from-server.js';
import { getDrawingData } from './draw/draw-buffer.js';
import { connectToServer } from './socket/socket-main.js';
import { COMMANDS } from './utils/consts.js';
import { command } from './utils/utils.js';

let chatInput;
let isTyping = false;
let chattingList;
let clientLevel;
let clientId;
let cache = { clientAliases: {} };

let typeStatus;
let drawStatus;
/**
 * @type {HTMLButtonElement}
 */
let connectBtn;
let connStatus;
let serverConnection = null;

let cloneThreadId = null;

const PROTOCOL = 'echo-protocol';
const SERVER_URL = 'ws://localhost:8080/';

const isConnected = () => serverConnection !== null;

const sendChattingMsg = msg => {
	if (isConnected()) {
		console.log('testToSend', command(COMMANDS.CHAT_INPUT, { msg }));
		serverConnection.send(
			JSON.stringify(command(COMMANDS.CHAT_INPUT, { msg, id: clientId }))
		);
	}
	isTyping = false; //set false because when connection is restarted, should send typing message
};

const onChat = e => {
	const textToSend = chatInput.value;
	// console.log('typing: ', e);
	// if e is enter, then call send chatting message
	const isEnter = e.code === 'Enter';
	if (isEnter) {
		sendChattingMsg(textToSend);
		chatInput.value = '';
	} else if (isTyping === false) {
		// send packet
		if (isConnected()) {
			serverConnection.send(
				JSON.stringify(command(COMMANDS.CHAT_TYPING, { id: clientId }))
			);
			isTyping = true;
		}
	} else {
		//isTyping == true
		if (textToSend.length === 0) {
			//deleted all of text
			sendChattingMsg(textToSend); //to tell the user canceled typing.
		}
	}
};

let handlingInterval = false;
const flushImageToServer = () => {
	if (handlingInterval) return;

	getDrawingData().then(buff => {
		handlingInterval = true;
		let data;
		if (serverConnection) {
			while ((data = buff.shift())) {
				data = { ...data, id: clientId };
				const d = JSON.stringify(data);
				serverConnection.send(d);
			}
		}
		handlingInterval = false;
	});
};

const onConnect = conn => {
	serverConnection = conn;
	connStatus.classList.add('active');
	cloneThreadId = setInterval(flushImageToServer, 200);
};

const onClose = () => {
	connStatus.classList.remove('active');
	connStatus.classList.remove('error');
	serverConnection = null;
	setDrawAreaInactive();
	clearInterval(cloneThreadId);
	cloneThreadId = null;
	connectBtn.innerText = 'Connect';
};

const onError = err => {
	connStatus.classList.add('error');
	console.log('error is received from server: ', err);
};

const onMessage = data => {
	console.log(data);
	if (data.cmd) {
		const cmd = data.cmd;
		if (cmd === COMMANDS.CHAT_TYPING) {
			const { id } = data;
			const alias = cache.clientAliases[id];
			typeStatus.innerText = `${alias} is typeing...`;
			return;
		} else if (cmd === COMMANDS.CHAT_INPUT) {
			//should add chat text in the thread unless the text is empty
			console.log('input msg:', data);
			if (data.msg.length > 0) {
				const aMsg = document.createElement('p');
				aMsg.className = 'msg-line';
				const alias = cache.clientAliases[data.id];
				aMsg.innerText = `${alias}: ${data.msg}`;
				chattingList.appendChild(aMsg);
				chattingList.scrollTop = chattingList.scrollHeight;
			}

			typeStatus.innerText = '';
			return;
		} else if (
			cmd === COMMANDS.REGISTER_SLAVE ||
			cmd === COMMANDS.REGISTER_MASTER
		) {
			console.log(data);
			clientId = data.info.id;
			const myAlias = 'my-alias' + parseInt(Math.random() * 10000);
			cache.clientAliases[clientId] = `me (${myAlias})`;

			clientLevel.innerText = data.clientLevel;
			serverConnection.send(
				JSON.stringify(
					command(COMMANDS.REGISTER_INFO, {
						id: clientId,
						alias: myAlias,
					})
				)
			);
			return;
		} else if (cmd === COMMANDS.REGISTER_INFO) {
			console.log('REGISTER_INFO', data);
			const { id, alias } = data;
			cache.clientAliases[id] = alias;

			// connectToServer(url, 'peer-to-peer');
			return;
		} else if (cmd === COMMANDS.MASTER_SHOULD_SHARE) {
			console.log('MASTER_SHOULD_SHARE', data);
			for (let otherClientId in cache.clientAliases) {
				serverConnection.send(
					JSON.stringify(
						command(COMMANDS.REGISTER_INFO, {
							id: otherClientId,
							alias: cache.clientAliases[otherClientId],
						})
					)
				);
			}
			return;
		} else if (cmd === COMMANDS.CLIENT_CLOSED) {
			console.log('CLIENT_CLOSED', data);
			const { id } = data;
			const { [id]: deleted, ...rest } = cache.clientAliases;
			cache.clientAliases = rest;

			// connectToServer(url, 'peer-to-peer');
			return;
		}
	}

	console.log('data:', data);
	const { id } = data;
	const alias = cache.clientAliases[id];
	if (data.cmd === COMMANDS.START_DRAW) {
		drawStatus.innerText = `${alias} is drawing...`;
	} else if (data.cmd === COMMANDS.END_DRAW) {
		drawStatus.innerText = `${alias} drew the last touch`;
	}

	drawCanvasFromData(data);
};

const onConnectBtnClicked = e => {
	if (isConnected()) {
		serverConnection.close();
	} else {
		connectToServer(SERVER_URL, PROTOCOL, {
			onConnect,
			onClose,
			onMessage,
			onError,
		});
		connectBtn.innerText = 'Disconnect';
	}
};

window.addEventListener('load', () => {
	chatInput = document.getElementById('chat');

	setupDrawAreaFromServer('draw-clone');
	setupDrawingArea('drawing-container', 'drawing', 'draw-clone');
	typeStatus = document.getElementById('type-status');
	drawStatus = document.getElementById('drawing-status');
	clientLevel = document.getElementById('client-level');
	connectBtn = document.getElementById('connect-btn');
	connStatus = document.getElementById('connect-btn');
	chattingList = document.getElementById('chatting-list');

	chatInput.addEventListener('keyup', onChat);
	connectBtn.addEventListener('click', onConnectBtnClicked);
});
