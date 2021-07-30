const buffer = [];

export const DRAW_STATUS = Object.freeze({
	IDLE: 0,
	DRAWING: 1,
});

export const COMMANDS = Object.freeze({
	START_DRAW: 1,
	END_DRAW: 2,
});

let drawingState = DRAW_STATUS.IDLE;
let lastPt = { x: -1, y: -1 };
export const pt = (x, y) => ({ x, y });
export const command = cmd => ({ cmd });

export const startDraw = (x, y) => {
	console.log('startDraw');
	drawingState = DRAW_STATUS.DRAWING;
	buffer.push(command(COMMANDS.START_DRAW));
	lastPt = pt(x, y);
	buffer.push(lastPt);
};

export const getDrawingStatus = () => drawingState;

export const endDraw = (x, y) => {
	if (lastPt.x !== x || lastPt.y !== y) {
		lastPt = pt(x, y);
		buffer.push(lastPt);
	}
	buffer.push(command(COMMANDS.END_DRAW));
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
			return new Promise(res => {
				const arr = [];
				let pt;
				while ((pt = buffer.shift())) {
					arr.push(pt);
				}
				lastPt = { x: -1, y: -1 }; //initialization.
				return res(arr);
			});
		} else {
			return Promise.resolve([]);
		}
	} else if (drawingState === DRAW_STATUS.DRAWING) {
		if (buffer.length > 1) {
			return new Promise(res => {
				const arr = [];
				let pt;
				while (buffer.length > 1 && (pt = buffer.shift())) {
					arr.push(pt);
				}
				res(arr);
			});
			//when still drawing, leave 1 last point to prevent duplication with the new point
		} else {
			return Promise.resolve([]);
		}
	} else {
		return Promise.resolve([]);
	}
};
