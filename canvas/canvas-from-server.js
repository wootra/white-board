import { COMMANDS } from '../utils/consts.js';

let drawClone;
let ctxDrawCloneArea;
let cloneLastPt;

export const drawCanvasFromData = data => {
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
};

export const setupDrawAreaFromServer = canvasId => {
	drawClone = document.getElementById(canvasId);
};

export const setDrawAreaInactive = () => {
	drawClone.classList.remove('active'); //if connection is closed, should be inactive
};
