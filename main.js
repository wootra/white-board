import {
	DRAW_STATUS,
	endDraw,
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

const convertXY = e => {
	return [e.clientX - e.target.offsetTop, e.clientY - e.target.offsetLeft];
};

const canvasMouseDown = e => {
	const lastPt = convertXY(e);
	startDraw(...lastPt);
	ctxDrawingArea = drawingArea.getContext('2d');
	ctxDrawCloneArea = drawClone.getContext('2d');
	ctxDrawingArea.moveTo(...lastPt);
	ctxDrawCloneArea.moveTo(...lastPt);
};

const canvasMouseUp = e => {
	lastPt = convertXY(e);
	endDraw(...lastPt);
	ctxDrawingArea.lineTo(...lastPt);
	ctxDrawCloneArea.lineTo(...lastPt);
	ctxDrawingArea.stroke();
	ctxDrawCloneArea.stroke();
};

const canvasMouseMove = e => {
	lastPt = convertXY(e);
	saveDraw(...lastPt);
	if (getDrawingStatus() === DRAW_STATUS.DRAWING) {
		ctxDrawingArea.lineTo(...lastPt);
		ctxDrawCloneArea.lineTo(...lastPt);
		ctxDrawingArea.stroke();
		ctxDrawCloneArea.stroke();
	}
};

const onChat = e => {
	const textToSend = chatInput.value;
	typeStatus.innerText = textToSend.length > 0 ? 'typeing...' : '';
	console.log('testToSend' + textToSend);
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
});
