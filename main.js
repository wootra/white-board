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

let typeStatus;
let connectBtn;
let connStatus;
let serverConnection = null;

let drawer = 'user' + parseInt(Math.random() * 100);
let cloneThreadId = null;

const isConnected = () => serverConnection !== null;

const sendChattingMsg = msg => {
	if (isConnected()) {
		console.log('testToSend', command(COMMANDS.CHAT_INPUT, { msg }));
		serverConnection.send(
			JSON.stringify(command(COMMANDS.CHAT_INPUT, { msg }))
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
			serverConnection.send(JSON.stringify(command(COMMANDS.CHAT_TYPING)));
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
				data = { ...data, drawer };
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
};

const onError = err => {
	connStatus.classList.add('error');
	console.log('error is received from server: ', err);
};

const onMessage = data => {
	if (data.cmd) {
		if (data.cmd === COMMANDS.CHAT_TYPING) {
			typeStatus.innerText = 'typeing...';
			return;
		} else if (data.cmd === COMMANDS.CHAT_INPUT) {
			//should add chat text in the thread unless the text is empty
			console.log('input msg:', data.msg);
			const aMsg = document.createElement('p');
			aMsg.className = 'msg-line';
			aMsg.innerText = data.msg;
			chattingList.appendChild(aMsg);
			chattingList.scrollTop = chattingList.scrollHeight;
			typeStatus.innerText = '';
			return;
		}
	}

	drawCanvasFromData(data);
};

const onConnectBtnClicked = e => {
	connectToServer('ws://localhost:8080/', 'echo-protocol', {
		onConnect,
		onClose,
		onMessage,
		onError,
	});
};

// const onResize = (screenW, screenH) => {
// 	let w, h;
// 	w = h = screenW > screenH ? screenH : screenW;
// 	console.log('size is:', w);
// 	mouseDrawingCanvasResize(w, h);
// 	serverDrawingCanvasResize(w, h);
// };

window.addEventListener('load', () => {
	chatInput = document.getElementById('chat');

	setupDrawAreaFromServer('draw-clone');
	setupDrawingArea('drawing-container', 'drawing');
	typeStatus = document.getElementById('type-status');
	connectBtn = document.getElementById('connect-btn');
	connStatus = document.getElementById('connect-btn');
	chattingList = document.getElementById('chatting-list');

	chatInput.addEventListener('keyup', onChat);
	connectBtn.addEventListener('click', onConnectBtnClicked);
	// window.addEventListener('resize', e => {
	// 	console.log(e);
	// 	onResize(e.currentTarget.innerWidth, e.currentTarget.innerHeight);
	// });
	// onResize(window.innerWidth, window.innerHeight);
});
