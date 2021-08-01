import {
	endDraw,
	getDrawingStatus,
	saveDraw,
	startDraw,
} from '../draw/draw-buffer.js';
import { DRAW_STATUS } from '../utils/consts.js';

let ctxDrawingArea;
let drawingArea;
let drawingContainer;
let lastPt;

const convertXY = e => {
	return [
		e.clientX - e.target.offsetTop - drawingContainer.offsetTop,
		e.clientY - e.target.offsetLeft - drawingContainer.offsetLeft,
	];
};

const canvasMouseDown = e => {
	const lastPt = convertXY(e);
	startDraw(...lastPt);
	ctxDrawingArea = drawingArea.getContext('2d');
};

const canvasMouseUp = e => {
	endDraw(...lastPt);
	console.log('clear', 0, 0, drawingArea.width, drawingArea.height);
	ctxDrawingArea.clearRect(0, 0, drawingArea.width, drawingArea.height);
};

const canvasMouseMove = e => {
	const nextPt = convertXY(e);
	saveDraw(...nextPt);
	if (getDrawingStatus() === DRAW_STATUS.DRAWING) {
		ctxDrawingArea.beginPath();
		ctxDrawingArea.strokeStyle = 'gray';
		ctxDrawingArea.moveTo(...lastPt);
		ctxDrawingArea.lineTo(...nextPt);
		ctxDrawingArea.stroke();
		ctxDrawingArea.closePath();
	}
	lastPt = nextPt;
};

export const setupDrawingArea = (containerId, drawAreaId) => {
	drawingContainer = document.getElementById(containerId);
	drawingArea = document.getElementById(drawAreaId);
	drawingArea.addEventListener('mousedown', canvasMouseDown);
	drawingArea.addEventListener('mouseup', canvasMouseUp);
	drawingArea.addEventListener('mousemove', canvasMouseMove);
};
