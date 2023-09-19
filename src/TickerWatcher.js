import { EventEmitter } from 'node:events';
import WebSocket from 'ws';

export class TickerWatcher extends EventEmitter {
	initialPrice = null;
	startDate = null;
	closed = false;

	constructor({ ticker, duration = 90000, threshold = 0.03 }) {
		super();
		if (!process.env.TIINGO_TOKEN) throw new Error('Missing Tiingo API token');
		this.ws = new WebSocket('wss://api.tiingo.com/iex');
		this.ticker = ticker.toUpperCase(); // doesn't matter, just for appearance
		this.duration = duration;
		this.threshold = threshold;

		// listen for opening of websocket connection
		this.ws.once('open', () => {
			// store info & subscribe to ticker
			this.startDate = new Date();
			void this.log(`Starting ${duration}ms monitor at ${this.startDate}`);
			void this.ws.send(
				JSON.stringify({
					eventName: 'subscribe',
					authorization: process.env.TIINGO_TOKEN,
					eventData: {
						thresholdLevel: 5,
						tickers: [this.ticker],
					},
				})
			);
			this.emit('open');

			// schedule close
			this.closeTimeout = setTimeout(() => this.close(), duration);
		});

		// listen for incoming messages
		this.ws.on('message', (_data) => {
			if (this.closed) return;

			// parse message
			const message = JSON.parse(Buffer.from(_data).toString());
			const { messageType, data } = message;
			if (messageType === 'E') {
				this.log(`Encoutered error: ${message?.response?.message}`);
				console.error(message?.response);
				this.close();
			}

			// validate message
			if (messageType !== 'A' || !Array.isArray(data)) return;

			// send to appropriate handler
			return this.checkDelta(data);
		});
	}

	close() {
		this.closed = true;
		void clearTimeout(this.closeTimeout);
		void this.log(`Ending ${this.duration}ms monitor at ${new Date()}`);
		void this.ws.close();
		this.emit('close');
	}

	log(message, ...args) {
		void console.log(`[${this.ticker}]: ${message}`, ...args);
	}

	checkDelta(data) {
		const { initialPrice, ticker, threshold } = this;
		const [type, , , _ticker, , price] = data;
		if (type !== 'Q' || !price) return;

		if (!initialPrice) {
			this.initialPrice = price;
			return void this.log(`Initial price set to ${price}`);
		}

		// if change in price exceeds threshold, alert
		const delta = Math.abs((price - initialPrice) / initialPrice);
		void this.log(`Price change from ${initialPrice} to ${price}: ${(delta * 100).toFixed(2)}%`);
		if (delta > threshold) {
			void this.log(
				`Price change from ${initialPrice} to ${price} DOES exceed threshold (${threshold * 100}%): ${(
					delta * 100
				).toFixed(2)}%`
			);
			this.emit('priceChange', { ticker, initialPrice, price, delta, threshold });
			void this.close();
		}
	}
}
