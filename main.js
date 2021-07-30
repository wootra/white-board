import {
	COMMANDS,
	DRAW_STATUS,
	endDraw,
	getDrawingData,
	getDrawingStatus,
	saveDraw,
	startDraw,
} from './draw/draw.js';

let chatInput;
let drawingArea;
let drawClone;
let typeStatus;
let ctxDrawingArea;
let ctxDrawCloneArea;
let lastPt;
let cloneLastPt;

const convertXY = e => {
	return [e.clientX - e.target.offsetTop, e.clientY - e.target.offsetLeft];
};

const canvasMouseDown = e => {
	const lastPt = convertXY(e);
	startDraw(...lastPt);
	ctxDrawingArea = drawingArea.getContext('2d');
	ctxDrawingArea.moveTo(...lastPt);
};

const canvasMouseUp = e => {
	lastPt = convertXY(e);
	endDraw(...lastPt);
	ctxDrawingArea.lineTo(...lastPt);
	ctxDrawingArea.stroke();
};

const canvasMouseMove = e => {
	lastPt = convertXY(e);
	saveDraw(...lastPt);
	if (getDrawingStatus() === DRAW_STATUS.DRAWING) {
		ctxDrawingArea.lineTo(...lastPt);
		ctxDrawingArea.stroke();
	}
};

const onChat = e => {
	const textToSend = chatInput.value;
	typeStatus.innerText = textToSend.length > 0 ? 'typeing...' : '';
	console.log('testToSend' + textToSend);
};

let handlingInterval = false;
const cloneImage = () => {
	if (handlingInterval) return;

	getDrawingData().then(buff => {
		handlingInterval = true;
		let data;
		while ((data = buff.shift())) {
			if (data.cmd === COMMANDS.START_DRAW) {
				ctxDrawCloneArea = drawClone.getContext('2d');
				drawClone.classList.add('active');
				cloneLastPt = null;
			} else if (data.cmd === COMMANDS.END_DRAW) {
				drawClone.classList.remove('active');
			} else {
				if (cloneLastPt === null) {
					cloneLastPt = data;
					ctxDrawCloneArea.moveTo(cloneLastPt.x, cloneLastPt.y);
				} else {
					cloneLastPt = data;
					ctxDrawCloneArea.lineTo(cloneLastPt.x, cloneLastPt.y);
					ctxDrawCloneArea.stroke();
				}
			}
		}
		handlingInterval = false;
	});
};

window.addEventListener('load', () => {
	chatInput = document.getElementById('chat');
	drawingArea = document.getElementById('drawing');
	drawClone = document.getElementById('draw-clone');
	typeStatus = document.getElementById('type-status');
	chatInput.addEventListener('keyup', onChat);
	drawingArea.addEventListener('mousedown', canvasMouseDown);
	drawingArea.addEventListener('mouseup', canvasMouseUp);
	drawingArea.addEventListener('mousemove', canvasMouseMove);
	setInterval(cloneImage, 200);
});
