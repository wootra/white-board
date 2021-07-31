const CONN_STATUS = Object.freeze({
	CONNECTED: 1,
	DISCONNECTED: 0,
});

export const connectToServer = (
	url,
	protocol,
	{ onConnect, onClose, onError, onMessage }
) => {
	const client = new WebSocket(url, protocol);

	console.log('trying to connect...', url, protocol, client);
	let connStatus = CONN_STATUS.DISCONNECTED;
	let buff = [];

	client.onclose = () => {
		connStatus = CONN_STATUS.DISCONNECTED;
		onClose && onClose();
	};

	client.onerror = err => {
		console.log('Connection Error', err);
		onError && onError(err);
	};

	client.onopen = ev => {
		console.log('client is connected', ev);
		connStatus = CONN_STATUS.CONNECTED;
		onConnect && onConnect(ev.target);

		client.onmessage = e => {
			console.log('received from ev.target:', e, JSON.stringify(e.data));
			if (typeof e.data === 'string') {
				const msg = e.data;
				onMessage && onMessage(JSON.parse(msg));
			} else {
				console.log('wrong type');
			}
		};
	};

	client.onmessage = e => {
		console.log('received from client:', e, JSON.stringify(e.data));

		if (typeof e.data === 'string') {
			const msg = e.data;
			for (const c in msg) {
				if (c === '\n') {
					const oneData = JSON.parse(buff.join(''));
					console.log('received: ', oneData);
					onMessage && onMessage(oneData);
					buff = [];
				} else {
					buff.push(c);
				}
			}
		} else {
			console.log('wrong type');
		}
	};
};
