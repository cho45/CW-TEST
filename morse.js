var Morse = {};
Morse.codes = {
	"A":".-",
	"B":"-...",
	"C":"-.-.",
	"D":"-..",
	"E":".",
	"F":"..-.",
	"G":"--.",
	"H":"....",
	"I":"..",
	"J":".---",
	"K":"-.-",
	"L":".-..",
	"M":"--",
	"N":"-.",
	"O":"---",
	"P":".--.",
	"Q":"--.-",
	"R":".-.",
	"S":"...",
	"T":"-",
	"U":"..-",
	"V":"...-",
	"W":".--",
	"X":"-..-",
	"Y":"-.--",
	"Z":"--..",
	"0":"-----",
	"1":".----",
	"2":"..---",
	"3":"...--",
	"4":"....-",
	"5":".....",
	"6":"-....",
	"7":"--...",
	"8":"---..",
	"9":"----.",
	".":".-.-.-",
	",":"--..--",
	"?":"..--..",
	"'":".----.",
	"!":"-.-.--",
	"/":"-..-.",
	"(":"-.--.",
	")":"-.--.-",
	"&":".-...",
	":":"---...",
	";":"-.-.-.",
	"=":"-...-", // BT (new paragraph)
	"+":".-.-.", // AR (end of message)
	"-":"-....-",
	"_":"..--.-",
	"\"":".-..-.",
	"$":"...-..-",
	"@":".--.-.",
	"\n" : ".-.-", // AA (new line)
	"\x01" : "-.-.-", // CT/KA (attention)
	"\x04" : "...-.-" // VA/SK (end of transmission)
};

Morse.reverse = {};
(function () {
	for (var key in Morse.codes) if (Morse.codes.hasOwnProperty(key)) {
		var val = Morse.codes[key];
		Morse.reverse[val] = key;
	}
})();


Morse.Player = function () { this.init.apply(this, arguments) };
Morse.Player.prototype = {
	init : function (context) {
		var self = this;
		self.context = context || new AudioContext();
	},

	play : function (code, config) {
		var self = this;
		var source = self.context.createBufferSource();
		source.buffer = self.createToneBuffer(code, config);
		source.connect(self.context.destination);
		source.start(0);
		return source;
	},

	createToneBuffer : function (code, config) {
		var self = this;

		if (!config.word_spacing) config.word_spacing = 1;
		if (!config.character_spacing) config.character_spacing = 1;
		if (!config.gain) config.gain = 1;

		var speed = 
			config.cpm ? 6000 / config.cpm:
			config.wpm ? 1200 / config.wpm:
				50;
		var unit = self.context.sampleRate * (speed / 1000);
		var tone = self.context.sampleRate / (2 * Math.PI * config.tone);

		var sequence = [], length = 0;
		for (var i = 0, n, len = code.length; i < len; i++) {
			var c = code.charAt(i).toUpperCase();
			if (c == ' ') {
				n = 7 * config.word_spacing * unit;
				length += n;
				sequence.push(-n);
			} else {
				var m = Morse.codes[c];
				for (var j = 0, mlen = m.length; j < mlen; j++) {
					var mc = m.charAt(j);
					if (mc === '.') {
						n = 1 * unit;
						length += n;
						sequence.push(n);
					} else
					if (mc === '-') {
						n = 3 * unit;
						length += n;
						sequence.push(n);
					}
					if (j < mlen - 1) {
						n = 1 * unit;
						length += n;
						sequence.push(-n);
					}
				}
				n = 3 * config.character_spacing * unit;
				length += n;
				sequence.push(-n);
			}
		}
		length = Math.ceil(length);

		var buffer = self.context.createBuffer(1, Math.ceil(length), self.context.sampleRate);
		var data   = buffer.getChannelData(0);

		for (var i = 0, x = 0, len = sequence.length; i < len; i++) {
			var s = sequence[i];
			if (s < 0) {
				while (s++ < 0) {
					data[x++] = 0;
				}
			} else {
				for (var p = 0; p < s; p++) {
					data[x++] = Math.sin(p / tone) * config.gain;
				}
				// remove ticking (fade)
				for (var f = 0, e = self.context.sampleRate * 0.0008; f < e; f++) {
					data[x - f] = data[x - f] * (f / e); 
				}
			}
		}

		return buffer;
	}
};
