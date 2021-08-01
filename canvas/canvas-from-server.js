import { COMMANDS } from '../utils/consts.js';

let drawClone;
/**
 * @type {SVGPathElement}
 */
let pathElement;
let lastPt;
let tempVal;

export const drawCanvasFromData = data => {
	if (data.cmd === COMMANDS.START_DRAW) {
		drawClone.classList.add('active');
		lastPt = null;
		pathElement = document.createElementNS(
			'http://www.w3.org/2000/svg',
			'polyline'
		);
		pathElement.setAttribute('stroke', 'black');
		// pathElement.setAttribute('stroke-width', '2');
		pathElement.setAttribute('fill', 'none');
		drawClone.appendChild(pathElement);
		tempVal = '';
	} else if (data.cmd === COMMANDS.END_DRAW) {
		drawClone.classList.remove('active');
	} else {
		if (lastPt === null) {
			lastPt = data;
			tempVal += `${lastPt.x},${lastPt.y} ` + '';
			pathElement.setAttribute('points', tempVal);
		} else {
			lastPt = data;
			tempVal += `${lastPt.x},${lastPt.y} ` + '';
			pathElement.setAttribute('points', tempVal);
		}
	}
};

export const setupDrawAreaFromServer = canvasId => {
	drawClone = document.getElementById(canvasId);
};

export const setDrawAreaInactive = () => {
	drawClone.classList.remove('active'); //if connection is closed, should be inactive
};
