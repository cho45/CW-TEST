navigator.getMedia = (
	navigator.getUserMedia ||
	navigator.webkitGetUserMedia ||
	navigator.mozGetUserMedia ||
	navigator.msGetUserMedia
);

window.AudioContext = (
	window.AudioContext ||
	window.webkitAudioContext ||
	window.mozAudioContext ||
	window.msAudioContext
);


var AutoGainControl = function (context, numberOfInputChannels) {
	var iq = context.createScriptProcessor(4096, numberOfInputChannels, numberOfInputChannels);

	iq.threshold = 0.9;
	// k1 is percentage of decreasing gain
	iq.k1 = 1 - 0.0005;
	// k2 is percentage of increasing gain
	iq.k2 = 1 + 0.0001;

	var gains = [];
	for (var i = 0; i < numberOfInputChannels; i++) {
		gains[i] = 1;
	}

	iq.onaudioprocess = function (e) {
		for (var n = 0; n < numberOfInputChannels; n++) {
			var gain = gains[n];
			var input = e.inputBuffer.getChannelData(n);
			var output = e.outputBuffer.getChannelData(n);
			for (var i = 0, len = e.inputBuffer.length; i < len; i++) {
				output[i] = input[i] * gain;

				if (Math.abs(output[i]) > iq.threshold) {
					gain = gain * iq.k1;
					if (gain < 1e-2) gain = 1e-2;
				} else {
					gain = gain * iq.k2;
					if (1e2 < gain) gain = 1e2;
				}
			}
			gains[n] = gain;
		}
	};

	return iq;
};

var WhiteNoiseGenerator = function (context) {
	var osc = context.createOscillator();
	var iq = context.createScriptProcessor(4096, 1, 1);

	var variance = 1;
	var average = 0;
	iq.onaudioprocess = function (e) {
		var input = e.inputBuffer.getChannelData(0);
		var output = e.outputBuffer.getChannelData(0);
		for (var i = 0, len = e.inputBuffer.length; i < len; i += 2) {
			var a = Math.random(), b = Math.random();
			var x = Math.sqrt(-2 * Math.log(a)) * Math.sin(2 * Math.PI * b) * variance + average;
			var y = Math.sqrt(-2 * Math.log(a)) * Math.cos(2 * Math.PI * b) * variance + average;
			output[i]   = x;
			output[i+1] = y;
		}
	};

	iq.__osc = osc;
	osc.connect(iq);
	osc.start(0);

	return iq;
};

var RoofingFilter = function (context, opts) {
	if (!opts) opts = {};

	var frequency = opts.frequency;
	var filterWidth = opts.width;
	var order = opts.order || 8;
	var Q = opts.Q || 1;

	var bandpass = [];
	for (var i = 0; i < order; i++) {
		var lowpass = context.createBiquadFilter();
		lowpass.type = 'lowpass';
		lowpass.Q.value = Q;
		lowpass.frequency.value = frequency + (filterWidth / 2);
		var highpass = context.createBiquadFilter();
		highpass.type = 'highpass';
		highpass.Q.value = Q;
		highpass.frequency.value = frequency - (filterWidth / 2);

		if (bandpass.length > 0) {
			bandpass[bandpass.length-1].connect(lowpass);
		}
		lowpass.connect(highpass);

		bandpass.push(lowpass, highpass);
	}

	bandpass[0].connect = function (node) {
		bandpass[bandpass.length-1].connect(node);
	};

	return bandpass[0];
};


var Runner = function () { this.init.apply(this, arguments) };
Runner.prototype = {
	init : function (context) {
		var self = this;
		self.context = context || new AudioContext();
		self.player = new Morse.Player(self.context);
		self.nodes = [];

		self.currentNumber = 1;
	},

	retain : function (node) {
		var self = this;
		self.nodes.push(node);
		return node;
	},

	start : function (opts) {
		var self = this;
		var context = self.context;

		if (!opts) opts = {};
		self.opts = opts;

		var noise = self.retain(WhiteNoiseGenerator(context));
		var noiseGain = self.retain(context.createGain());
		noiseGain.gain.value = 0.05;
		noise.connect(noiseGain);

		self.filter = self.retain(RoofingFilter(context, {
			width: 300,
			frequency: 600
		}));

		noiseGain.connect(self.filter);

		var agc = self.retain(AutoGainControl(context, 1));
		agc.threshold = 0.5;
		agc.k1 = 1 - 0.0015;
		agc.k2 = 1 + 0.0001;

		self.filter.connect(agc);

		self.masterGain = self.retain(context.createGain());
		self.masterGain.gain.value = 1;

		agc.connect(self.masterGain);

		var compressor = self.retain(context.createDynamicsCompressor());
		self.masterGain.connect(compressor);
		compressor.connect(context.destination);

		self.elapsed = 0;
		self.mainTimer = setInterval(function () {
			self.elapsed++;
			self.onprogress(self.elapsed);
			// console.log(self.elapsed);
			if (self.elapsed >= 60 * 3) {
				self.finish();
			}
		}, 1000);

		self.finished = false;
		self.results = [];
		self._generateCall();
		self.state = "call";
		self._next();
	},

	finish : function () {
		var self = this;
		if (self.finished) return;
		self.finished = true;
		self.masterGain.gain.value = 0;
		if (self._waitResponseCallbacks) {
			clearTimeout(self._waitResponseCallbacks.timer);
		}
		clearInterval(self.mainTimer);
		clearInterval(self.stateTimer);
		self.nodes = [];
		self.onfinish();
	},

	action : function (action, arg) {
		var self = this;
		if (self.finished) return;
		var args = self._waitResponseCallbacks;
		self._waitResponseCallbacks = null;
		if (args) {
			clearTimeout(args.timer);
		}

		var text = action;
		if (action == "CQ") {
			text = "CQ TEST";
		} else
		if (action == "RES") {
			text = arg + ' ' + self._formatNumber(self.currentNumber);
		} else
		if (action == "#") {
			text = self._formatNumber(self.currentNumber);
		} else
		if (action == "SEND") {
			text = arg;
		}
		self.sending = self._send(text, {
			who : 'me',
			gain: 0.7,
			wpm : self.opts.wpm,
			tone : 600
		}, function () {
			if (args) args.callback(action, arg);
		});
	},

	cancel : function () {
		var self = this;
		self.sending.stop(0);
		self.sending.onended = null;
		self.sending = null;
	},

	_send : function (text, opts, callback) {
		var self = this;
		var source = self.context.createBufferSource();
		source.buffer = self.player.createToneBuffer(text, opts);
		source.connect(self.filter);
		source.start(0);
		source.onended = function () {
			self.onsent(self.current.dialogue);
			callback();
		};
		self.current.dialogue.push({
			text : text,
			who: opts.who
		});
		return source;
	},

	_next : function (delay, arg) {
		var self = this;
		if (self.finished) return;
		if (typeof delay == 'undefined') delay = 500;
		self.stateTimer = setTimeout(function () {
			self["_state_" + self.state](arg);
		}, delay);
	},

	_waitResponse : function (args) {
		var self = this;
		self._waitResponseCallbacks = args;
		if (args.timeout) {
			args.timer = setTimeout(function () {
				if (self._waitResponseCallbacks) {
					self._waitResponseCallbacks.errorback();
					self._waitResponseCallbacks = null;
				}
			}, args.timeout);
		}
	},

	_state_call : function () {
		var self = this;
		self.current.count++;
		self.current.source = self._send("DE " + self.current.call, self.current,
			function () {
				self._waitResponse({
					callback: function (action, arg) {
						console.log('callback');
						if (action == "NIL") {
							setTimeout(function () {
								self._checkResult();
								self._generateCall();
								self._next();
							}, 1000);
							return;
						} else
						if (action == "?") {
							self._next();
							return;
						} else
						if (action == "RES") {
							var maybeCall = arg.toUpperCase();
							self.current.anotherCall = maybeCall;
							var levenshtein = Levenshtein.get(maybeCall, self.current.call);
							if (levenshtein === 0) {
								setTimeout(function () {
									self.state = "number";
									self.current.source = self._send("R", self.current,
										function () {
											self._next(0);
										}
									);
								}, 500);
								return;
							} else
							if (levenshtein <= 2) {
								self._next(500, levenshtein + 1);
								return;
							}
						} else
						if (action == "SEND") {
							var maybeCall = arg.toUpperCase(); // no warnings
							var levenshtein = Levenshtein.get(maybeCall, self.current.call); // no warnings
							self.current.anotherCall = maybeCall;
							if (levenshtein === 0) {
								setTimeout(function () {
									self.state = "number";
									self.current.source = self._send("NR?", self.current,
										function () {
											self._next(0, true);
										}
									);
								}, 500);
							} else {
								self._next(500, 2);
								return;
							}
						}

						// unknown handler penalty
						setTimeout(function () {
							if (self.current.count >= 5) {
								self._generateCall();
							}
							self._next();
						}, 5000);
					},
					errorback: function timeout () {
						console.log('errorback');
						if (self.current.count >= 5) {
							self._generateCall();
						}
						self._next();
					},
					timeout: 10000
				});
			}
		);
	},

	_state_number : function (sent) {
		var self = this;
		self.current.source = self._send(sent ? " " : self.current.number, self.current,
			function () {
				self._waitResponse({
					callback: function (action, arg) {
						if (action == "TU") {
							self.current.anotherNumber = self._formatNumber(+arg);
							self._checkResult();

							self.currentNumber++;
							self._generateCall();
							self.state = "call";
							self._next();
							return;
						} else
						if (action == "?") {
							self._next();
							return;
						}

						// unknown handler penalty
						setTimeout(function () {
							if (self.current.count >= 3) {
								self._generateCall();
							}
							self._next();
						}, 3000);
					},
					errorback : function () {
						self._next();
					},
					timeout: 10000
				});
			}
		);
	},

	_checkResult : function () {
		var self = this;
		self.current.levenshtein = Levenshtein.get(self.current.anotherCall, self.current.call);
		self.current.elapsed = self.elapsed;
		if (self.current.levenshtein !== 0 || self.current.number != self.current.anotherNumber) {
			self.current.score = 0;
		}
		self.current.time = self.current.elapsed - (self.results.length > 0 ? self.results[self.results.length-1].elapsed : 0);
		self.results.push(self.current);
		self.onresult(self.current);
		self.current = null;
	},

	_formatNumber : function (number) {
		var self = this;
		return '5NN' + String(1000 + number).slice(1);
	},

	_generateCall : function () {
		var self = this;
		var call = String_random(/(J[A-S][0-9]|7[KLMN][0-9]|8[J-N][0-9])[A-Z]{3}(\/[0-9])?/);
		var number = self._formatNumber(Math.round(Math.random() * 3 * (self.elapsed + 1)));
		var buffer = self.player.createToneBuffer(call + number, {
			gain: 0.7,
			wpm : 20,
			tone : 600
		});
		var score = Math.round(buffer.duration * 1000);

		self.current = {
			score : score,
			number: number,
			call: call,
			gain: 0.20 + Math.random() * 0.50,
			wpm : self.opts.wpm - Math.round(Math.random() * self.opts.wpm * 0.5),
			tone : 400 + Math.random() * 500,
			dialogue: [],
			count : 0
		};
	}
};

Polymer({
	is: "my-app",

	properties : {
		mySpeed : {
			type: Number,
			value: 30
		},

		running: {
			type: Boolean,
			value: false
		},

		elapsed: {
			type: Number,
			value: 0
		},

		results: {
			type: Array,
			value: []
		},

		dialogue: {
			type: String,
			value: ""
		},

		totalScore: {
			type: Number
		}
	},

	start : function () {
		var self = this;

		self.running = true;
		self.results = [];
		self.dialogue = "";
		self.totalScore = 0;

		self.runner = new Runner();
		self.runner.onprogress = function (n) {
			self.set('remain', (3 * 60) - n);
		};
		self.runner.onresult = function (result) {
			var copied = self.runner.results.slice(0);
			self.set('results', copied);
		};
		self.runner.onsent = function (dialogue) {
			console.log('onsent');
			var text = "";
			for (var i = 0, it; (it = dialogue[i]); i++) {
				if (it.who == 'me') {
					text += '> ' + it.text + "\n";
				} else {
					// text += '< ' + it.text.replace(self.runner.current.call, '******').replace(self.runner.current.number, '******') + "\n";
					text += '< ' + it.text + "\n";
				}
			}
			self.set('dialogue', text);
		};
		self.runner.onfinish = function () {
			var score = 0;
			for (var i = 0, it; (it = self.runner.results[i]); i++) {
				score += it.score;
			}
			self.set('totalScore', score);
			self.stop();
		};
		self.runner.start({
			wpm: self.mySpeed
		});

		self.$.inputCall.value = "";
		self.$.inputNumber.value = "";
		self.$.inputCall.$.input.focus();
	},

	stop : function () {
		this.running = false;
		this.runner.finish();
	},

	action : function (e) {
		if (!this.runner) return;
		var action = Polymer.dom(e).localTarget.dataset.action;
		if (action == 'HIS') {
			this.runner.action('SEND', this.$.inputCall.value);
		} else
		if (action == 'TU') {
			this.runner.action('TU', this.$.inputNumber.value);
		} else {
			this.runner.action(action);
		}
		this.$.inputCall.$.input.focus();
	},

	ready: function() {
		var self = this;

		window.addEventListener('keydown', function (e) {
			var fun = {
				'U+001B': function () {
					// ESC
					self.runner.cancel();
				},

				'F1': function () {
					self.runner.action('CQ');
				},
				'F2': function () {
					self.runner.action('#');
				},
				'F3': function () {
					self.runner.action('TU', self.$.inputNumber.value);
				},
				'F4': function () {
					self.runner.action('NIL');
				},
				'F5': function () {
					self.runner.action('SEND', self.$.inputCall.value);
				},
				'F6': function () {
					self.runner.action('?');
				},
				'F7': function () {
				},
				'F8': function () {
				},
				'F9': function () {
				},
				'F10': function () {
				},
				'F11': function () {
				},
				'F12': function () {
				}
			}[e.keyIdentifier];
			if (fun) fun();
		});

		self.$.inputCall.addEventListener('keypress', function (e) {
			if (e.keyIdentifier === 'Enter') {
				self.runner.action('RES', self.$.inputCall.value);
				self.$.inputNumber.$.input.focus();
			}
		});

		self.$.inputNumber.addEventListener('keypress', function (e) {
			if (e.keyIdentifier === 'Enter') {
				self.runner.action('TU', self.$.inputNumber.value);
				self.$.inputCall.value = "";
				self.$.inputNumber.value = "";
				self.$.inputCall.$.input.focus();
			}
		});

		self.$.inputCall.addEventListener('keyup', function (e) {
			var selection = this.$.input.selectionStart;
			this.value = this.value.toUpperCase();
			this.$.input.selectionStart = selection;
			this.$.input.selectionEnd = selection;
		});

		self.$.inputNumber.addEventListener('keyup', function (e) {
			var selection = this.$.input.selectionStart;
			this.value = this.value.toUpperCase();
			this.$.input.selectionStart = selection;
			this.$.input.selectionEnd = selection;
		});
	}
});
