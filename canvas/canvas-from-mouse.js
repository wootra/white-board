import {
	endDraw,
	getDrawingStatus,
	saveDraw,
	startDraw,
} from '../draw/draw-buffer.js';
import { DRAW_STATUS } from '../utils/consts.js';

/**
 * @type {HTMLOrSVGImageElement}
 */
let drawingArea;

/**
 * @type {SVGPathElement}
 */
let pathElement;

/**
 * @type {HTMLDivElement}
 */
let drawingContainer;

/**
 * @type {[number, number]}
 */
let lastPt;

let tempVal;

const convertXY = e => {
	// console.log(drawingArea.width.baseVal.value);
	const wid = drawingArea.width.baseVal.value;
	const hig = drawingArea.height.baseVal.value;
	const x = e.clientX - drawingContainer.offsetLeft + 1;
	const relX = ((x * 1.0) / wid) * 100.0;
	const y = e.clientY - drawingContainer.offsetTop + 1;
	const relY = ((y * 1.0) / hig) * 100.0;
	return [
		Number.parseFloat(relX.toFixed(2)),
		Number.parseFloat(relY.toFixed(2)),
	];
};

const canvasMouseDown = e => {
	const lastPt = convertXY(e);
	pathElement = document.createElementNS(
		'http://www.w3.org/2000/svg',
		'polyline'
	);
	// stroke="black" fill="green" stroke-width="2"
	pathElement.style = 'stroke: gray; fill: none';
	// pathElement.setAttribute('stroke', 'gray');
	// pathElement.setAttribute('stroke-width', '1');
	// pathElement.setAttribute('fill', 'none');
	tempVal = '' + lastPt.join(', ') + ' ';
	pathElement.setAttribute('points', tempVal);
	drawingArea.appendChild(pathElement);

	startDraw(...lastPt);
};

const canvasMouseUp = e => {
	endDraw(...lastPt);
	drawingArea.innerHTML = '';
};

const canvasMouseMove = e => {
	const nextPt = convertXY(e);
	saveDraw(...nextPt);
	if (getDrawingStatus() === DRAW_STATUS.DRAWING) {
		tempVal += '' + nextPt.join(', ') + ' ';
		pathElement.setAttribute('points', tempVal);
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
