let startButton = document.querySelector("#startButton")
let playAgainButton = document.querySelector("#again")
let startScreen = document.querySelector("#startScreen")
let endScreen = document.querySelector("#endScreen")
let stats = document.querySelector("#stats")

let instructions = document.querySelector("#instructionButton")
let infoScreen = document.querySelector("#infoScreen")
let backButton = document.querySelector("#back")

const width = 2000
const height = 2000
const canvas = document.createElement("canvas")
canvas.id = "gameCanvas"
// document.body.appendChild(canvas)
canvas.width = width
canvas.height = height
const ctx = canvas.getContext("2d")

const offCanvas = document.createElement("canvas")
offCanvas.width = width
offCanvas.height = height
const offCtx = offCanvas.getContext("2d")
const lightCnv = document.createElement("canvas")
lightCnv.width = width
lightCnv.height = height
const lightCtx = lightCnv.getContext("2d")
const groundCanvas = document.createElement("canvas")
groundCanvas.width = width
groundCanvas.height = height + 100
const groundCtx = groundCanvas.getContext("2d")
const groundCanvas2 = document.createElement("canvas")
groundCanvas2.width = width
groundCanvas2.height = height + 100
const groundCtx2 = groundCanvas2.getContext("2d")
const offCanvas2 = document.createElement("canvas")
offCanvas2.width = width
offCanvas2.height = height
const offCtx2 = offCanvas2.getContext("2d")
let lightTexture
let glCanvas = createCanvas(width, height)
let glC = glCanvas.getContext("webgl")

var renderer = new THREE.WebGLRenderer({ preserveDrawingBuffer: true })
function initThree() {
	// const renderer = new THREE.WebGLRenderer()
	renderer.setSize(width, height)
	const scene = new THREE.Scene()
	const camera = new THREE.OrthographicCamera(
		width / -2,
		width / 2,
		height / 2,
		height / -2,
		0.01,
		1000,
	)
	camera.position.z = 1
	canvasTexture = new THREE.CanvasTexture(canvas)
	lightTexture = new THREE.CanvasTexture(lightCnv)
	lightTexture.needsUpdate = true
	canvasTexture.needsUpdate = true
	let finalMat = new THREE.MeshBasicMaterial({
		map: canvasTexture,
	})

	let finalMesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(), finalMat)
	finalMesh.position.set(0, 0, 0)
	finalMesh.scale.set(width, height, 1)

	scene.add(finalMesh)

	composer = new THREE.EffectComposer(renderer)
	const renderPass = new THREE.RenderPass(scene, camera)
	composer.addPass(renderPass)
	const textPass = new THREE.TexturePass(canvasTexture)
	composer.addPass(textPass)

	const bgLinePass = new THREE.BgLinePass()
	composer.addPass(bgLinePass)

	document.body.appendChild(renderer.domElement)
	// composer.addPass(bgLinePass)
}

initThree()

let mouseP = new Vec2()
let mouseDown = false
let mouseDownP = null
let player

let gameState = {
	player: null,
	ticker: 0,
	money: 0,
	pentagrams: [],
	minions: [],
	enemies: [],
	path: [],
	ended: false,
	enemiesKilled: 0,
	minionsSummoned: 0,
	mostMinions: 0,
}
const PERCEPTION_DIS = 300
const SEPERATION_DIS = 30
const MAX_SPEED = 6
const DOWNSPEED = 2
function getMouseP(ev) {
	let rect = renderer.domElement.getBoundingClientRect()

	return new Vec2(ev.clientX - rect.left, ev.clientY - rect.top).multiply(
		width / rect.width,
	)
}
renderer.domElement.addEventListener("mousemove", ev => {
	mouseP = getMouseP(ev)
})
renderer.domElement.addEventListener("mousedown", ev => {
	mouseDownP = mouseP = getMouseP(ev)
	mouseDown = true
})
renderer.domElement.addEventListener("mouseup", () => {
	mouseDown = false
})

// class PathImg {
// 	constructor(p, x) {
// 		this.p = p
// 		this.size = width / 5
// 		this.initImg()
// 		this.x = x
// 	}
// 	initImg() {
// 		this.canvas = createCanvas(this.size, this.size)
// 		let ct = this.canvas.getContext("2d")
// 		let amnt = 15
// 		let tileSize = this.size / amnt
// 		for (let i = 0; i < 15; i++) {
// 			let offsetX = rndInt(-15, 15)
// 			let y = (1 - i / 15) * this.size
// 			for (let j = 0; j < 15; j++) {
// 				let x = offsetX + (1 - j / 15) * this.size
// 				console.log(x, y, tileSize)
// 				ct.strokeRect(x, y, tileSize, tileSize)
// 			}
// 		}
// 	}
// 	render(ct) {
// 		ct.drawImage(this.canvas, this.p.x, this.p.y)
// 	}
// }
class Pentagram {
	constructor(p) {
		this.p = p
		this.initImg()
		this.loaded = 0
		this.isTouched = false
		this.playingSound = false
	}
	initImg() {
		this.rad = 40
		this.canvas = createCanvas(this.rad * 2, this.rad * 2)
		let ct = this.canvas.getContext("2d")

		ct.strokeStyle = "white"
		ct.lineWidth = 0.5
		ct.beginPath()
		for (let i = 0; i < 3; i++) {
			new Vec2(this.rad, this.rad)
				.copy()
				.addAngle(rndAng(), rndFloat(-5, 5))
				.arc(ct, this.rad - 10)
			new Vec2(this.rad, this.rad)
				.copy()
				.addAngle(rndAng(), rndFloat(-5, 5))
				.arc(ct, this.rad - 10)
		}

		let p0 = new Vec2(this.rad, this.rad).copy().addAngle(-PI05, this.rad - 5)
		let curAng = -PI05
		for (let i = 0; i < 5; i++) {
			curAng += (PI2 / 5) * 2
			let p1 = new Vec2(this.rad, this.rad)
				.copy()
				.addAngle(curAng, this.rad - 5)
			for (let j = 0; j < 5; j++) {
				p0.copy().addAngle(rndAng(), rndFloat(-5, 5)).moveTo(ct)
				p1.copy().addAngle(rndAng(), rndFloat(-5, 5)).lineTo(ct)
			}

			p0 = p1
		}
		ct.stroke()
		ct.closePath()
	}
	render(ct) {
		ct.drawImage(this.canvas, this.p.x - this.rad, this.p.y - this.rad)

		if (this.loaded > 0) {
			ct.fillStyle = "purple"
			ct.beginPath()
			ct.rect(
				this.p.x - this.rad,
				this.p.y + this.rad + 10,
				(this.rad * 2 * this.loaded) / 100,
				10,
			)
			ct.fill()
			ct.stroke()
			ct.closePath()
		}
	}
}
class Player {
	constructor() {
		this.p = Vec2.middle()
		this.m = new Vec2()
		this.rot = 0
		this.hp = 100
		this.mSpeed = 10
	}
	update() {
		const mDis = this.p.distanceTo(mouseP)
		const mDir = this.p.angleTo(mouseP)
		if (mDis > 5) {
			const angDiff = compareAngles(this.rot, mDir)
			if (Math.abs(angDiff) > 0.1) {
				this.rot += angDiff * 0.5
			}
		}

		this.m.multiply(0.95)

		if (mDis > 5) {
			this.p.addAngle(this.rot, Math.min(mDis * 0.5, this.mSpeed))
		}
		// this.p.addVector(this.m)
		// this.m.addAngle(mDir, 0.05)
	}
	damage(amount) {
		this.hp -= amount
		this.damaged = true
		if (this.hp < 0) {
			gameState.ended = true
			audioHandle.playSound("end")
		}
	}
	render(ct) {
		ct.fillStyle = "black"
		ct.save()
		this.p.translate(ct)
		ct.rotate(this.rot)
		ct.fillRect(-5, -17.5, 10, 35)
		if (this.isLoading) {
			ct.save()

			ct.translate(0, -17.5)
			ct.rotate((Math.abs((gameState.ticker % 21) - 10) / 10) * -1.75)
			ct.fillRect(-2.5, -2.5, 15, 5)
			ct.restore()
			ct.save()
			ct.translate(0, 17.5)
			ct.rotate((Math.abs((gameState.ticker % 21) - 10) / 10) * 1.75)
			ct.fillRect(-2.5, -2.5, 15, 5)
			ct.restore()
		}
		ct.restore()

		ct.fillStyle = "rgba(0,0,50,1)"
		ct.beginPath()
		this.p.arc(ct, 10)
		ct.fill()
		ct.stroke()
		ct.closePath()

		if (this.hp < 100) {
			ct.fillStyle = "green"
			ct.fillRect(this.p.x - 30, this.p.y - 30, (this.hp / 100) * 60, 7)
		}

		if (this.damaged) {
			this.damaged = false
			offCtx.fillStyle = "rgb(100,10,10)"
			for (let i = 0; i < 5; i++) {
				let p = this.p.copy().addAngle(rndAng(), rndInt(-40, 40))
				let rad = rndFloat(3, 7)
				offCtx.beginPath()
				p.arc(offCtx, rad)
				offCtx.fill()
				offCtx.closePath()
			}
		}

		lightCtx.shadowBlur = 25
		let rgr = lightCtx.createRadialGradient(
			this.p.x,
			this.p.y,
			0,
			this.p.x,
			this.p.y,
			350,
		)
		rgr.addColorStop(0, "rgba(255,255,255,1)")
		rgr.addColorStop(0.7, "rgba(255,255,255,0.2)")
		rgr.addColorStop(1, "rgba(255,255,255,0)")
		lightCtx.fillStyle = rgr
		lightCtx.beginPath()
		this.p.arc(lightCtx, 350)
		lightCtx.fill()
		lightCtx.closePath()
	}
}
class StrongEnemy {
	constructor(p) {
		this.p = p
		this.rot = rndAng()
		this.m = new Vec2()
		this.mSpeed = 0.4
		this.size = rndInt(75, 75)
		this.damageAmount = 20
		this.hp = 250
		this.maxHp = 250
		this.initImg()
	}
	damage(amount) {
		this.hp -= amount

		audioHandle.playSound("dok")
	}
	initImg() {
		const { size } = this
		this.img = createCanvas(size, size)
		let ct = this.img.getContext("2d")
		ct.lineWidth = 0.5
		ct.strokeStyle = "rgb(150,10,10)"
		ct.beginPath()
		for (let i = 0; i < 100; i++) {
			let rot = (i / 100) * PI2 + rndFloat(-0.1, 0.1)
			new Vec2(size / 2, size / 2)
				.addAngle(rot, (rndFloat(0.3, 0.5) * size) / 2)
				.moveTo(ct)
			new Vec2(size / 2, size / 2)
				.addAngle(rot, (rndFloat(0.9, 1) * size) / 2)
				.lineTo(ct)
		}
		ct.closePath()
		ct.stroke()
	}

	update() {
		const { player } = gameState
		this.m.scaleToLength(MAX_SPEED)
		this.p.addVector(this.m)
		this.m.multiply(0.95)

		const mDis = this.p.distanceTo(player.p)
		const mDir = this.p.angleTo(player.p)
		if (mDis < this.size) {
			this.m.multiply(-0.5)
			this.p.addAngle(mDir, -40)
			player.damage(this.damageAmount)

			audioHandle.playSound("wet")
		} else {
			this.m.addAngle(mDir, 0.53 * this.mSpeed)
		}

		this.rot = new Vec2().angleTo(this.m)
	}
	render(ct) {
		const { size } = this
		ct.save()

		this.p.translate(ct)
		ct.rotate(this.rot)
		ct.drawImage(this.img, -size / 2, -size / 2)
		ct.restore()
		const ticker = gameState.ticker
		let leftP = this.p.copy().addAngle(this.rot - PI05, size / 4)
		// .addAngle(this.rot, (ticker % 9) - 4)
		let rightP = this.p.copy().addAngle(this.rot + PI05, size / 4)
		// .addAngle(this.rot, ((ticker + 4) % 9) - 4)
		offCtx.fillStyle = "rgba(0,0,0,0.1)"
		offCtx.beginPath()
		if (ticker % 3 == 1) {
			leftP.arc(offCtx, 2)
		} else if (ticker % 3 == 0) {
			rightP.arc(offCtx, 2)
		}
		offCtx.fill()
		offCtx.closePath()
		if (this.hp < this.maxHp) {
			ct.fillStyle = "green"
			ct.fillRect(
				this.p.x - this.size * 0.6,
				this.p.y - this.size * 0.6,
				(this.hp / this.maxHp) * this.size * 0.6,
				7,
			)
		}

		lightCtx.shadowBlur = 25
		let rgr = lightCtx.createRadialGradient(
			this.p.x,
			this.p.y,
			0,
			this.p.x,
			this.p.y,
			50,
		)
		rgr.addColorStop(0, "rgba(255,0,0,0.5)")
		rgr.addColorStop(0.7, "rgba(255,0,0,0.05)")
		rgr.addColorStop(1, "rgba(255,0,0,0)")
		lightCtx.fillStyle = rgr
		lightCtx.beginPath()
		this.p.arc(lightCtx, 50)
		lightCtx.fill()
		lightCtx.closePath()
	}
}
class Enemy {
	constructor(p) {
		this.p = p
		this.rot = rndAng()
		this.m = new Vec2()
		this.mSpeed = 1
		this.size = rndInt(15, 25)
		this.damageAmount = 5
		this.hp = 40
		this.maxHp = 40
		this.initImg()
	}
	damage(amount) {
		this.hp -= amount

		audioHandle.playSound("dok")
	}
	initImg() {
		const { size } = this
		this.img = createCanvas(size, size)
		let ct = this.img.getContext("2d")
		ct.lineWidth = 0.5
		ct.strokeStyle = "rgb(150,10,10)"
		ct.beginPath()
		for (let i = 0; i < 100; i++) {
			let rot = (i / 100) * PI2 + rndFloat(-0.1, 0.1)
			new Vec2(size / 2, size / 2)
				.addAngle(rot, (rndFloat(0.3, 0.5) * size) / 2)
				.moveTo(ct)
			new Vec2(size / 2, size / 2)
				.addAngle(rot, (rndFloat(0.9, 1) * size) / 2)
				.lineTo(ct)
		}
		ct.closePath()
		ct.stroke()
	}

	update() {
		const { player } = gameState
		this.m.scaleToLength(MAX_SPEED)
		this.p.addVector(this.m)
		this.m.multiply(0.95)

		const mDis = this.p.distanceTo(player.p)
		const mDir = this.p.angleTo(player.p)
		if (mDis < this.size) {
			this.m.multiply(-1)
			player.damage(this.damageAmount)
			audioHandle.playSound("wet")
		}

		this.rot = new Vec2().angleTo(this.m)

		// const angDiff = compareAngles(this.rot, mDir)
		// if (Math.abs(angDiff) > 0.1) {
		// 	const turnDir = Math.sign(angDiff)
		// 	this.rot += angDiff * 0.5
		// }

		if (mDis > 30) {
			this.m.addAngle(mDir, 0.53 * this.mSpeed)
		} else {
			this.m.addAngle(mDir, -0.04)
		}
	}
	render(ct) {
		const { size } = this
		ct.save()

		this.p.translate(ct)
		ct.rotate(this.rot)
		ct.drawImage(this.img, -size / 2, -size / 2)
		// ct.fillStyle = "white"
		// ct.fillRect(-10, -10, 20, 20)
		// ct.strokeRect(-10, -10, 20, 20)
		ct.restore()
		const ticker = gameState.ticker
		let leftP = this.p.copy().addAngle(this.rot - PI05, size / 4)
		// .addAngle(this.rot, (ticker % 9) - 4)
		let rightP = this.p.copy().addAngle(this.rot + PI05, size / 4)
		// .addAngle(this.rot, ((ticker + 4) % 9) - 4)
		offCtx.fillStyle = "rgba(0,0,0,0.1)"
		offCtx.beginPath()
		if (ticker % 3 == 1) {
			leftP.arc(offCtx, 2)
		} else if (ticker % 3 == 0) {
			rightP.arc(offCtx, 2)
		}
		offCtx.fill()
		offCtx.closePath()
		if (this.hp < this.maxHp) {
			ct.fillStyle = "green"
			ct.fillRect(
				this.p.x - this.size * 0.6,
				this.p.y - this.size * 0.6,
				(this.hp / this.maxHp) * this.size * 0.6,
				7,
			)
		}

		lightCtx.shadowBlur = 25
		let rgr = lightCtx.createRadialGradient(
			this.p.x,
			this.p.y,
			0,
			this.p.x,
			this.p.y,
			50,
		)
		rgr.addColorStop(0, "rgba(255,0,0,.4)")
		rgr.addColorStop(0.7, "rgba(255,0,0,0.05)")
		rgr.addColorStop(1, "rgba(255,0,0,0)")
		lightCtx.fillStyle = rgr
		lightCtx.beginPath()
		this.p.arc(lightCtx, 50)
		lightCtx.fill()
		lightCtx.closePath()
	}
}

class Minion {
	constructor(p) {
		this.p = p
		this.rot = rndAng()
		this.m = new Vec2()
		this.mSpeed = 1.2
		this.size = rndInt(15, 25)
		this.hp = 30
		this.maxHp = 30
		this.damageAmount = 5
		this.initImg()
		this.level = 0
	}
	levelUp() {
		this.level++
		this.size = (1 + Math.log(2 + this.level)) * 20
		this.maxHp = (1 + Math.log(2 + this.level)) * 30
		this.hp = this.maxHp
		this.damageAmount = (1 + Math.log(2 + this.level)) * 5
	}
	initImg() {
		const { size } = this
		this.img = createCanvas(size, size)
		let ct = this.img.getContext("2d")
		ct.lineWidth = 0.5
		ct.strokeStyle = "white"
		ct.beginPath()
		for (let i = 0; i < 100; i++) {
			let rot = (i / 100) * PI2 + rndFloat(-0.1, 0.1)
			new Vec2(size / 2, size / 2)
				.addAngle(rot, (rndFloat(0.3, 0.5) * size) / 2)
				.moveTo(ct)
			new Vec2(size / 2, size / 2)
				.addAngle(rot, (rndFloat(0.9, 1) * size) / 2)
				.lineTo(ct)
		}
		ct.closePath()
		ct.stroke()
	}
	damage(amount) {
		this.hp -= amount
	}
	update() {
		const { player, enemies, minions } = gameState
		this.m.scaleToLength(MAX_SPEED)
		this.p.addVector(this.m)
		// this.p.addAngle(this.rot, this.mSpeed)
		// this.m.multiply(0.95)

		let mDis = this.p.distanceTo(player.p)
		let mDir = this.p.angleTo(player.p)

		let neighbors = []
		minions.forEach(m1 => {
			if (this != m1) {
				let dis = m1.p.distanceTo(this.p)
				if (dis < PERCEPTION_DIS) {
					neighbors.push(m1)
				}
			}
		})

		let averageP = new Vec2()
		let averageM = new Vec2()
		let averageSep = new Vec2()
		neighbors.forEach(m1 => {
			averageM.addVector(m1.m.copy().multiply(1 / neighbors.length))
			averageP.addVector(m1.p.copy().multiply(1 / neighbors.length))
			let dis = m1.p.distanceTo(this.p)
			if (dis < SEPERATION_DIS) {
				const difference = this.p.copy().addVector(m1.p.copy().multiply(-1))
				averageSep.addVector(difference.multiply(1 / neighbors.length))
			}
		})
		this.m.addVector(averageM.multiply(0.002))
		this.m.addAngle(this.p.angleTo(averageP), 0.01)
		this.m.addVector(averageSep.multiply(0.3))

		// if (mouseDown) {
		// 	this.m.addAngle(-PI05, 1)
		// }
		enemies.forEach(enemy => {
			let dis = enemy.p.distanceTo(this.p)
			let ang = enemy.p.angleTo(this.p)
			if (mouseDown && dis < PERCEPTION_DIS * 2) {
				mDis = dis
				mDir = this.p.angleTo(enemy.p)
			}
			if (dis < (enemy.size + this.size) / 2) {
				this.m.multiply(-0.2)
				this.m.addAngle(ang, 0.5)
				this.p.addAngle(ang, this.size * 0.5)
				enemy.p.addAngle(ang, -enemy.size * 0.5)
				enemy.m.multiply(0.2)
				enemy.m.addAngle(ang, -0.5)
				enemy.damage(this.damageAmount)
				this.damage(enemy.damageAmount)
				createParticles(Vec2.middleOf(this.p, enemy.p))
				if (enemy.hp < 0) {
					this.levelUp()
					createParticlesR(enemy.p)
				}
			}
		})

		// const closeEnemy = enemies.find(
		// 	enemy => enemy.p.distanceTo(this.p) < (this.size + enemy.size) * 0.5,
		// )
		// if (closeEnemy) {
		// }

		this.rot = new Vec2().angleTo(this.m)

		// const angDiff = compareAngles(this.rot, mDir)
		// if (Math.abs(angDiff) > 0.1) {
		// 	const turnDir = Math.sign(angDiff)
		// 	this.rot += angDiff * 0.5
		// }

		if (mDis > 30) {
			this.m.addAngle(mDir, 0.53 * this.mSpeed)
		} else {
			this.m.addAngle(mDir, -0.04)
		}
	}
	render(ct) {
		const { size } = this
		ct.save()

		this.p.translate(ct)
		ct.rotate(this.rot)
		ct.drawImage(this.img, -size / 2, -size / 2)
		// ct.fillStyle = "white"
		// ct.fillRect(-10, -10, 20, 20)
		// ct.strokeRect(-10, -10, 20, 20)
		ct.restore()

		const ticker = gameState.ticker
		let leftP = this.p.copy().addAngle(this.rot - PI05, size / 4)
		// .addAngle(this.rot, (ticker % 9) - 4)
		let rightP = this.p.copy().addAngle(this.rot + PI05, size / 4)
		// .addAngle(this.rot, ((ticker + 4) % 9) - 4)
		offCtx.fillStyle = "rgba(0,0,0,0.5)"
		offCtx.beginPath()
		if (ticker % 3 == 1) {
			leftP.arc(offCtx, 2)
		} else if (ticker % 3 == 0) {
			rightP.arc(offCtx, 2)
		}
		offCtx.fill()
		offCtx.closePath()

		lightCtx.shadowBlur = 25
		let rgr = lightCtx.createRadialGradient(
			this.p.x,
			this.p.y,
			0,
			this.p.x,
			this.p.y,
			150,
		)
		rgr.addColorStop(0, "rgba(255,255,255,1)")
		rgr.addColorStop(0.7, "rgba(255,255,255,0.2)")
		rgr.addColorStop(1, "rgba(255,255,255,0)")
		lightCtx.fillStyle = rgr
		lightCtx.beginPath()
		this.p.arc(lightCtx, 150)
		lightCtx.fill()
		lightCtx.closePath()
	}
}
let particles = []
function createParticles(p) {
	for (let i = 0; i < 10; i++) {
		let rot = (i / 10) * PI2 + rndFloat(-0.2, 0.2)
		particles.push({
			p: p.copy(),
			rot: rot,
			speed: rndFloat(1, 5),
			rad: rndFloat(1, 4),
			life: rndInt(25, 35),
		})
	}
}
function renderParticles() {
	particles = particles.slice(0, 100).filter(p => p.life > 0)
	particles.forEach(particle => {
		ctx.fillStyle = "white"
		particle.life--
		particle.p.addAngle(particle.rot, particle.speed)
		ctx.beginPath()
		particle.p.arc(ctx, particle.rad)
		ctx.fill()
		ctx.closePath()
	})
}
let particlesR = []
function createParticlesR(p) {
	for (let i = 0; i < 20; i++) {
		let rot = (i / 10) * PI2 + rndFloat(-0.2, 0.2)
		particlesR.push({
			p: p.copy(),
			rot: rot,
			speed: rndFloat(4, 5),
			rad: rndFloat(4, 6),
			life: rndInt(25, 45),
		})
	}
}
function renderParticlesR() {
	particlesR = particlesR.slice(0, 100).filter(p => p.life > 0)
	particlesR.forEach(particle => {
		ctx.fillStyle = "rgb(150,10,10)"
		particle.life--
		particle.p.addAngle(particle.rot, particle.speed)
		ctx.beginPath()
		particle.p.arc(ctx, particle.rad)
		ctx.fill()
		ctx.closePath()
	})
}
function init() {
	gameState.player = new Player()
	gameState.enemies = []
	gameState.pentagrams = []
	gameState.minions = []
	gameState.ended = false
	gameState.enemiesKilled = 0
	gameState.minionsSummoned = 0
	gameState.mostMinions = 0

	renderGround()

	// for (let i = 0; i < 20; i++) {
	// 	gameState.minions.push(new Minion(Vec2.random()))
	// }
	// for (let i = 0; i < 5; i++) {
	// 	gameState.enemies.push(new Enemy(Vec2.random()))
	// }

	audioHandle.playSound("bgMusic")
	// gameState.path = []
	// for (let i = 0; i < 6; i++) {
	// 	addPath(i)
	// }
	tick()
}

function tick() {
	if (gameState.ended) {
		canvas.style.opacity = 0
		endScreen.style.display = "flex"
		window.setTimeout(() => {
			endScreen.style.opacity = 1
		}, 0)
		window.setTimeout(() => {
			canvas.style.display = "none"
		}, 500)
		audioHandle.stopSound("bgMusic")
		audioHandle.stopSound("oooh")
		fillStats()
		ctx.clearRect(0, 0, width, height)
		canvasTexture.needsUpdate = true
		return
	}

	update()

	render(ctx)
	window.requestAnimationFrame(tick)
}

function update() {
	const { pentagrams, player, minions, enemies, ticker, path } = gameState
	if (pentagrams.length < 3 && ticker % (300 * (pentagrams.length || 1)) == 0) {
		pentagrams.push(new Pentagram(new Vec2(rndFloat(100, width - 100), -50)))
	}
	if (enemies.length < 4 && (ticker - 325) % 550 == 0) {
		enemies.push(new Enemy(new Vec2(rndFloat(100, width - 100), -10)))
		if (ticker > 3500) {
			enemies.push(new Enemy(new Vec2(rndFloat(100, width - 100), -10)))
		}
	}
	if (ticker > 3999 && ticker % 2000 == 0) {
		enemies.push(new StrongEnemy(new Vec2(rndFloat(100, width - 100), -10)))
		if (ticker > 10000) {
			enemies.push(new StrongEnemy(new Vec2(rndFloat(100, width - 100), -10)))
		}
	}

	if (ticker > 15000 && enemies.length < 5) {
		enemies.push(new StrongEnemy(new Vec2(rndFloat(100, width - 100), -10)))
		enemies.push(new StrongEnemy(new Vec2(rndFloat(100, width - 100), -10)))
		enemies.push(new StrongEnemy(new Vec2(rndFloat(100, width - 100), -10)))
	}

	if (ticker > 25000 && enemies.length < 10) {
		enemies.push(new Enemy(new Vec2(rndFloat(100, width - 100), -10)))

		enemies.push(new Enemy(new Vec2(rndFloat(100, width - 100), -10)))

		enemies.push(new Enemy(new Vec2(rndFloat(100, width - 100), -10)))

		enemies.push(new StrongEnemy(new Vec2(rndFloat(100, width - 100), -10)))
		enemies.push(new StrongEnemy(new Vec2(rndFloat(100, width - 100), -10)))
		enemies.push(new StrongEnemy(new Vec2(rndFloat(100, width - 100), -10)))
	}
	player.update()

	gameState.minions = gameState.minions.filter(minion => {
		if (minion.hp > 0) {
			return true
		} else {
			createParticles(minion.p)
			return false
		}
	})
	gameState.enemies = gameState.enemies.filter(enemy => {
		if (enemy.hp < 0) {
			gameState.enemiesKilled++
			audioHandle.playSound("die")
			return false
		} else {
			return true
		}
	})

	gameState.minions.forEach(minion => minion.update())
	gameState.enemies.forEach(enemy => enemy.update())
	gameState.pentagrams.forEach(pentagram => {
		pentagram.p._y += DOWNSPEED
	})
	const touchedPentagram = pentagrams.find(
		pentagram => pentagram.p.distanceTo(player.p) < pentagram.rad,
	)

	if (touchedPentagram) {
		touchedPentagram.loaded++
		player.isLoading = true
		if (!touchedPentagram.playingSound) {
			touchedPentagram.playingSound = true
			audioHandle.playSound("oooh")
		}
		if (touchedPentagram.loaded >= 100) {
			audioHandle.playSound("waaa2")
			touchedPentagram.playingSound = false
			let ind = pentagrams.indexOf(touchedPentagram)
			pentagrams.splice(ind, 1)
			gameState.minions.push(
				new Minion(player.p.copy().addAngle(rndAng(), rndInt(40, 100))),
			)
			gameState.minionsSummoned++
			if (gameState.minions.length > gameState.mostMinions) {
				gameState.mostMinions = gameState.minions.length
			}
		}
	} else {
		player.isLoading = false
		audioHandle.stopSound("oooh")
		gameState.pentagrams.forEach(p => (p.playingSound = false))
	}

	gameState.pentagrams = gameState.pentagrams.filter(
		pentagram => pentagram.p.y < height + 50,
	)

	// path.forEach(path => path.p.addAngle(PI05, DOWNSPEED))

	// if (path[0].y > height) {
	// 	path.splice(0, 1)
	// 	addPath()
	// }

	gameState.ticker++
}

let tileSize = 36
function renderGround() {
	let ct = groundCtx
	ct.clearRect(0, 0, width, height + 100)
	let ht = height + 100
	ct.fillStyle = "rgba(250,250,250,0.3)"
	ct.strokeStyle = "black"
	ct.lineWidth = 1
	let rowAmnt = ht / tileSize + 1
	for (let i = 0; i < rowAmnt; i++) {
		let y = (ht * i) / rowAmnt

		renderGroundRow(y)
	}
}

function renderGroundRow(y) {
	let ct = groundCtx
	let colAmnt = width / tileSize + 1
	for (let j = 0; j < colAmnt; j++) {
		if (rndFloat() < 0.02) {
			continue
		}
		let x = (width * j) / colAmnt
		ct.beginPath()
		ct.rect(
			x + rndFloat(-1),
			y + rndFloat(-1),
			tileSize + rndFloat(-2, 2),
			tileSize + rndFloat(-2, 2),
		)
		ct.fill()
		ct.stroke()
		ct.closePath()
	}
}

function render(ct) {
	ctx.clearRect(0, 0, width, height)
	lightCtx.clearRect(0, 0, width, height)
	ctx.fillStyle = "black"
	ctx.fillRect(0, 0, width, height)
	if (gameState.ticker % 18 == 0) {
		groundCtx2.clearRect(0, 0, width, height + 100)
		groundCtx2.drawImage(groundCanvas, 0, 0)
		groundCtx.clearRect(0, 0, width, height + 100)
		groundCtx.drawImage(groundCanvas2, 0, tileSize)
		renderGroundRow(0)
	}
	ctx.drawImage(groundCanvas, 0, -100 + (gameState.ticker % 18) * DOWNSPEED)
	ct.drawImage(offCanvas, 0, 0)
	offCtx2.clearRect(0, 0, width, height)
	offCtx2.drawImage(offCanvas, 0, DOWNSPEED)
	offCtx.clearRect(0, 0, width, height)
	offCtx.drawImage(offCanvas2, 0, 0)
	// ct.beginPath()
	// gameState.path.forEach((p, i) => {
	// 	i == 0 ? p.moveTo(ct) : p.lineTo(ct)
	// })

	// ct.stroke()
	// ct.closePath()

	gameState.path.forEach(path => path.render(ctx))
	gameState.pentagrams.forEach(pentagram => pentagram.render(ctx))

	gameState.enemies.forEach(enemy => enemy.render(ctx))
	gameState.minions.forEach(minion => minion.render(ctx))
	gameState.player.render(ct)

	renderParticles()
	renderParticlesR()

	lightTexture.needsUpdate = true
	canvasTexture.needsUpdate = true
	composer.render()
}

window.onload = () => {
	startButton.addEventListener("click", () => {
		startScreen.style.opacity = 0
		canvas.style.display = "block"
		window.setTimeout(() => {
			canvas.style.opacity = 1
		}, 0)
		window.setTimeout(() => {
			startScreen.style.display = "none"
			loadSounds(() => init())
		}, 500)
	})
	playAgainButton.addEventListener("click", () => {
		endScreen.style.opacity = 0
		canvas.style.display = "block"
		window.setTimeout(() => {
			canvas.style.opacity = 1
		}, 0)
		window.setTimeout(() => {
			endScreen.style.display = "none"
			init()
		}, 500)
	})

	backButton.addEventListener("click", () => {
		startScreen.style.display = "flex"
		infoScreen.style.display = "none"
		startScreen.style.opacity = 1
	})
	instructions.addEventListener("click", () => {
		startScreen.style.display = "none"
		infoScreen.style.display = "flex"
		infoScreen.style.opacity = 1
	})
}

function fillStats() {
	let killed = document.createElement("p")
	killed.innerHTML = "Enemies killed: " + gameState.enemiesKilled
	let spawned = document.createElement("p")
	spawned.innerHTML = "Minions summoned: " + gameState.minionsSummoned
	let most = document.createElement("p")
	most.innerHTML = "Most minions at once: " + gameState.mostMinions

	stats.innerHTML = ""
	stats.appendChild(killed)
	stats.appendChild(spawned)
	stats.appendChild(most)
}
