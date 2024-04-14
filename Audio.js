var soundToLoad = [
	"bgMusic",
	"end",
	"die",
	"dok",
	"oooh",
	"waaa2",
	"waaaa",
	"wet",
]
var muted = false
let sounds = {}
let soundsLoaded = 0
function loadSounds(callback) {
	soundToLoad.forEach(name => {
		let audio = new Audio(`./sounds/${name}.mp3`)
		audio.addEventListener("canplaythrough", event => {
			sounds[name] = audio
			soundsLoaded++
			if (soundsLoaded == soundToLoad.length) {
				console.log("Loaded all Sounds.")
				// sounds.leftStep.volume = 0.3
				// sounds.rightStep.volume = 0.3
				// sounds.unlock1.volume = 0.3
				// sounds.drums.volume = 0.7
				sounds.oooh.volume = 0.5
				sounds.waaa2.volume = 0.3
				sounds.end.volume = 0.7
				sounds.bgMusic.loop = true
				callback()
			}
		})
	})
}
function mute() {
	audioHandle.stopSound("drums")
	muted = true
}
function unmute() {
	muted = false
	if (isInGame || isIntro || isOutro) {
		audioHandle.playSound("drums")
	}
}
class AudioHandler {
	constructor() {}
	get ctx() {
		if (!this.audioCtx) {
			this.audioCtx = new AudioContext()
		}
		return this.audioCtx
	}
	playSound(name) {
		if (muted) return
		if (!sounds[name].paused) {
			sounds[name].pause()
			sounds[name].currentTime = 0
		}

		sounds[name].play()
	}
	stopSound(name) {
		sounds[name].pause()
	}
}
let audioHandle = new AudioHandler()
