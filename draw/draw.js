const buffer = [];

export const DRAW_STATUS = Object.freeze({
	IDLE: 0,
	DRAWING: 1,
});

let drawingState = DRAW_STATUS.IDLE;
let lastPt = { x: -1, y: -1 };
export const pt = (x, y) => ({ x, y });

export const startDraw = (x, y) => {
	console.log('startDraw');
	drawingState = DRAW_STATUS.DRAWING;
	lastPt = pt(x, y);
	buffer.push(lastPt);
};

export const getDrawingStatus = () => drawingState;

export const endDraw = (x, y) => {
	if (lastPt.x !== x || lastPt.y !== y) {
		lastPt = pt(x, y);
		buffer.push(lastPt);
	}
	drawingState = DRAW_STATUS.IDLE;
};

export const saveDraw = (x, y) => {
	if (drawingState === DRAW_STATUS.DRAWING) {
		if (lastPt.x != x && lastPt.y != y) {
			lastPt = pt(x, y);
			buffer.push(lastPt);
		}
	}
};

export const getDrawingData = () => {
	if (drawingState === DRAW_STATUS.IDLE) {
		if (buffer.length > 0) {
			const arr = [];
			let pt;
			while ((pt = buffer.pop())) {
				arr.push(pt);
			}
			lastPt = { x: -1, y: -1 }; //initialization.
			return arr;
		} else {
			return [];
		}
	} else if (drawingState === DRAW_STATUS.DRAWING) {
		if (buffer.length > 1) {
			//when still drawing, leave 1 last point to prevent duplication with the new point
			const arr = [];
			let pt;
			while (buffer.length > 1 && (pt = buffer.pop())) {
				arr.push(pt);
			}
			return arr;
		} else {
			return [];
		}
	}
};
