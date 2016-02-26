const Encoder = function(config) {

	const State = {
		HI: 1,
		LOW: 0
	};

	var buff = [];
	var state = null;
	var counter = 0;

	const threshold = config.threshold || 0.5;

	/**
	 * Add raw value to buffer
	 */
	const addRaw = function(raw) {
		if (raw instanceof Array) {
			buff.push.apply(buff, raw);
		} else {
			buff.push(raw);
		}
	};

	/**
	 * Read the average value from the current buffer
	 */
	const read = function() {
		const sum = buff.reduce(function(sum,a) {
			return sum + a;
		}, 0);
		const avg = sum / Math.max(buff.length, 1);
		return avg;
	};

	const reset = function() {
		clearBuff();
		state = null;
		counter = 0;
	};

	const clearBuff = function() {
		buff = [];
	};

	/**
	 * Calculate the current number of ticks the encoder has received
	 * from the raw values
	 */
	const ticks = function() {
		const current = read();
		// Do not do anything if there is no data in the buffer
		if (buff.length != 0) {
			clearBuff();

			if (state != null) {
				// Only count transition from LOW to HIFGH as tick
				if (current >= threshold && state != State.HI) {
					counter++;
				}
			}
			state = current >= threshold ? State.HI : State.LOW;
		}
		return counter;
	}

	return {
		addRaw: addRaw,
		read: read,
		ticks: ticks,
		reset: reset
	};
};


module.exports = Encoder;