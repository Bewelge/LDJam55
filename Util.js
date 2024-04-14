const PI = Math.PI
const PI2 = Math.PI * 2
const PI05 = Math.PI * 0.5
class Vec2 {
	constructor(x = 0, y = 0) {
		this._x = x
		this._y = y
	}
	get x() {
		return this._x
	}
	get y() {
		return this._y
	}
	get length() {
		return this.distanceToOrigin()
	}
	addVector(vector) {
		this._x += vector.x
		this._y += vector.y
		return this
	}
	add(x, y) {
		this._x += x
		this._y += y
		return this
	}
	subtractVector(vector) {
		this._x -= vector.x
		this._y -= vector.y
		return this
	}
	addAngle(angle, dist) {
		this._x += Math.cos(angle) * dist
		this._y += Math.sin(angle) * dist
		return this
	}
	multiply(number) {
		this._x *= number
		this._y *= number
		return this
	}
	getMagnitude() {
		return Math.sqrt(this._x * this._x + this._y * this._y)
	}

	scaleToLength(newLength) {
		const currentMagnitude = this.getMagnitude()
		if (currentMagnitude === 0) {
			console.warn("Cannot scale a zero vector.")
			return this
		}
		const scaleFactor = newLength / currentMagnitude
		this._x *= scaleFactor
		this._y *= scaleFactor
		return this
	}
	floor() {
		this._x = Math.floor(this._x)
		this._y = Math.floor(this._y)
		return this
	}
	ceil() {
		this._x = Math.ceil(this._x)
		this._y = Math.ceil(this._y)
		return this
	}
	round() {
		this._x = Math.round(this._x)
		this._y = Math.round(this._y)
		return this
	}

	rotateAround(vec, ang) {
		let curAng = this.angleTo(vec)
		let dis = vec.distanceTo(this)
		let newP = vec.copy().addAngle(curAng + ang, -dis)

		this._x = newP.x
		this._y = newP.y
		return this
	}
	ceiling(num) {
		this._x = Math.min(num, this._x)
		this._y = Math.min(num, this._y)
		return this
	}
	bottom(num) {
		this._x = Math.max(num, this._x)
		this._y = Math.max(num, this._y)
		return this
	}
	peg(min, max) {
		this.ceiling(max)
		this.bottom(min)
		return this
	}
	distanceTo(vector) {
		return distancePoints(this, vector)
	}
	distanceToOrigin() {
		return distancePoints(this, Vec2.origin())
	}
	angleTo(vector) {
		return anglePoints(this, vector)
	}
	angleToOrigin() {
		return this.angleTo(Vec2.origin())
	}
	copy() {
		return new Vec2(this._x, this._y)
	}
	isInBound(marg = 0) {
		return !this.isOutOfBounds(marg)
	}
	vectorAmount() {
		return Math.abs(this._x) + Math.abs(this._y)
	}
	isOutOfBounds(marg = 0) {
		return (
			this._x < marg ||
			this._x > width - marg ||
			this._y < marg ||
			this._y > height - marg
		)
	}
	getPixelIndex() {
		return this._x * 4 + this._y * 4 * width
	}
	translate(ct) {
		ct.translate(this.x, this.y)
	}
	mirrorAcross(p0, p1) {
		let vx = p1.x - p0.x
		let vy = p1.y - p0.y
		let x = p0.x - this.x
		let y = p0.y - this.y
		let r = 1 / (vx * vx + vy * vy)
		this._x = this.x + 2 * (x - x * vx * vx * r - y * vx * vy * r)
		this._y = this.y + 2 * (y - y * vy * vy * r - x * vx * vy * r)

		return this
	}
	debug(ct, col = "red") {
		ct.save()
		ct.fillStyle = col
		ct.strokeStyle = col
		ct.globalCompositeOperation = "source-over"
		ct.beginPath()
		ct.arc(this.x, this.y, 2, 0, PI2)
		ct.stroke()
		ct.fill()
		ct.closePath()
		ct.restore()
		return this
	}

	static middle(w = width, h = height) {
		return new Vec2(w / 2, h / 2)
	}
	static middleOf(vec1, vec2, a = 0.5) {
		return new Vec2(
			vec1.x * (1 - a) + a * vec2.x,
			vec1.y * (1 - a) + a * vec2.y,
		)
	}
	static random(margin = 0, x = width, y = height) {
		return new Vec2(rndInt(margin, x - margin), rndInt(margin, y - margin))
	}
	static create(x, y) {
		return new Vec2(x, y)
	}
	static origin() {
		return new Vec2(0, 0)
	}
	moveTo(ct) {
		ct.moveTo(this.x, this.y)
		return this
	}
	lineTo(ct) {
		ct.lineTo(this.x, this.y)
		return this
	}
	arc(ct, rad) {
		ct.arc(this.x, this.y, rad, 0, PI2, false)
		return this
	}
	ellipse(ct, radX, radY, rot = 0) {
		ct.ellipse(this.x, this.y, radX, radY, rot, PI2, false)
		return this
	}
	fill(ct) {
		ct.fill()
		return this
	}
	stroke(ct) {
		ct.stroke()
		return this
	}
	strokefill(ct) {
		ct.stroke()
		ct.fill()
		return this
	}
	fillstroke(ct) {
		ct.fill()
		ct.stroke()
		return this
	}
	path(ct) {
		ct.beginPath()
		return this
	}
	close(ct) {
		ct.closePath()
		return this
	}
}

function anglePoints(point1, point2) {
	return Math.atan2(point2.y - point1.y, point2.x - point1.x)
}
function distancePoints(point1, point2) {
	return Math.sqrt(
		(point1.x - point2.x) * (point1.x - point2.x) +
			(point1.y - point2.y) * (point1.y - point2.y),
	)
}
function angle(x1, y1, x2, y2) {
	return Math.atan2(y2 - y1, x2 - x1)
}
function distance(x1, y1, x2, y2) {
	return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2))
}

function clamp(val, min = 0, max = 1) {
	return Math.min(max, Math.max(min, val))
}

function compareAngles(ang0, ang1) {
	let diff = ((ang1 - ang0 + PI) % PI2) - PI
	return diff < -PI ? diff + PI2 : diff
}

function createCanvas(width, height) {
	width = width || 50
	height = height || 50
	const cnv = document.createElement("canvas")
	cnv.width = width
	cnv.height = height
	return cnv
}

function rndFloat(min = 0, max = 1) {
	return min + (max - min) * Math.random()
}
function rndInt(min = 0, max = 1) {
	return Math.floor(min + (max - min) * Math.random() + 0.5)
}
function rndAng() {
	return rndFloat(0, Math.PI * 2)
}
function rndSign() {
	let num = rndFloat(-1, 1)
	while (num == 0) {
		num = rndFloat(-1, 1)
	}
	return Math.sign(num)
}
function rndArr(list) {
	return list[rndInt(0, list.length - 1)]
}

function peg(val, min = 0, max = 1) {
	return Math.min(max, Math.max(min, val))
}

function strokeLines(ct, ps) {
	ct.beginPath()
	drawLines(ct, ps)
	ct.stroke()
	ct.closePath()
}
function fillLines(ct, ps) {
	ct.beginPath()
	drawLines(ct, ps)
	ct.stroke()
	ct.closePath()
}
function strokefillLines(ct, ps) {
	ct.beginPath()
	drawLines(ct, ps)
	ct.fill()
	ct.stroke()
	ct.closePath()
}

window.addEventListener("keydown", e => {
	switch (e.code) {
		case "KeyS":
			let a = document.createElement("a")
			a.href = (hasWebGl ? renderer.domElement : cnv).toDataURL()
			a.download = document.title + " by Bewelge"
			a.click()
			break
	}
})

/**
 *
 * FROM https://stackoverflow.com/questions/7054272/how-to-draw-smooth-curve-through-n-points-using-javascript-html5-canvas
 */

function getCurvePoints(
	pts,
	tension = 0.5,
	isClosed = true,
	numOfSegments = 20,
) {
	// use input value if provided, or use a default value

	var _pts = [],
		res = [], // clone array
		x,
		y, // our x,y coords
		t1x,
		t2x,
		t1y,
		t2y, // tension vectors
		c1,
		c2,
		c3,
		c4, // cardinal points
		st,
		t,
		i // steps based on num. of segments

	// clone array so we don't change the original
	//
	_pts = pts.slice(0)

	// The algorithm require a previous and next point to the actual point array.
	// Check if we will draw closed or open curve.
	// If closed, copy end points to beginning and first points to end
	// If open, duplicate first points to beginning, end points to end
	if (isClosed) {
		_pts.unshift(pts[pts.length - 1])
		// _pts.unshift(pts[pts.length - 2])
		_pts.unshift(pts[pts.length - 1])
		// _pts.unshift(pts[pts.length - 2])
		_pts.push(pts[0])
		// _pts.push(pts[1])
	} else {
		// _pts.unshift(pts[1]) //copy 1. point and insert at beginning
		_pts.unshift(pts[0])
		// _pts.push(pts[pts.length - 2]) //copy last point and append
		_pts.push(pts[pts.length - 1])
	}

	// ok, lets start..

	// 1. loop goes through point array
	// 2. loop goes through each segment between the 2 pts + 1e point before and after
	for (i = 1; i < _pts.length - 2; i++) {
		for (t = 0; t <= numOfSegments; t++) {
			// calc tension vectors
			t1x = (_pts[i + 1].x - _pts[i - 1].x) * tension
			t2x = (_pts[i + 2].x - _pts[i].x) * tension

			t1y = (_pts[i + 1].y - _pts[i - 1].y) * tension
			t2y = (_pts[i + 2].y - _pts[i].y) * tension

			// calc step
			st = t / numOfSegments

			// calc cardinals
			c1 = 2 * Math.pow(st, 3) - 3 * Math.pow(st, 2) + 1
			c2 = -(2 * Math.pow(st, 3)) + 3 * Math.pow(st, 2)
			c3 = Math.pow(st, 3) - 2 * Math.pow(st, 2) + st
			c4 = Math.pow(st, 3) - Math.pow(st, 2)

			// calc x and y cords with common control vectors
			x = c1 * _pts[i].x + c2 * _pts[i + 1].x + c3 * t1x + c4 * t2x
			y = c1 * _pts[i].y + c2 * _pts[i + 1].y + c3 * t1y + c4 * t2y

			//store points in array
			res.push(new Vec2(x, y))
		}
	}

	return res
}
function drawLines(ctx, pts) {
	if (pts.length) {
		pts[0].moveTo(ctx)
		try {
			for (i = 1; i < pts.length; i++) pts[i].lineTo(ctx)
		} catch (e) {
			console.log(e)
		}
	}
}
/**
 * END FROM https://stackoverflow.com/questions/7054272/how-to-draw-smooth-curve-through-n-points-using-javascript-html5-canvas
 *
 **/

function drawCrappyLines(
	ctx,
	pts,
	penStateChangeChance = 0.09,
	decrease = 0.015,
) {
	if (pts.length) {
		let isDown = false
		let rnd = rndFloat()
		let lastP = pts[0].copy()
		let lastInd = 0
		for (let i = 0; i < pts.length - 1; i++) {
			let p0 = pts[i]
			let p1 = pts[i + 1]
			let dis = Math.ceil(p0.distanceTo(p1))
			for (let j = 0; j < dis; j += 1) {
				if (
					(i == 0 && j == 0) ||
					rnd < penStateChangeChance * (isDown ? 1 : 1.2)
				) {
					rnd = rndFloat()
					let p = Vec2.middleOf(p0, p1, j / dis)
					if (isDown) {
						p.lineTo(ctx)
					} else {
						if (i > 0 && j > 0 && lastP.distanceTo(p) < 5 && j == lastInd) {
							p.lineTo(ctx)
							// ctx.stroke()
						} else {
							p.moveTo(ctx)
						}
					}
					lastP = p.copy()
					lastInd = i
					isDown = !isDown
				} else {
					rnd -= decrease
				}
			}
			if (isDown) {
				p1.lineTo(ctx)
			}
		}
	}
}

class Line {
	constructor(pts) {
		this.pts = pts
		this.distances = pts.map((pt, i) =>
			i < pts.length - 1 ? pt.distanceTo(pts[i + 1]) : 0,
		)
		this._length = this.distances.reduce((prev, curr) => prev + curr, 0)
	}
	get length() {
		return this._length
	}
	getPosAt(rat) {
		if (rat < 0) {
			let firstLength = this.distances[0]
			let firstAng = this.pts[0].angleTo(this.pts[1])

			return this.pts[0].copy().addAngle(firstAng, -firstLength)
		}
		let lengthAt = this.length * rat
		let curLength = 0
		let lastP = this.pts[0]
		for (let i = 1; i < this.pts.length; i++) {
			let thisPt = this.pts[i]
			let dis = this.distances[i - 1]
			if (curLength + dis >= lengthAt) {
				return Vec2.middleOf(
					lastP,
					thisPt,
					(dis - (curLength + dis - lengthAt)) / dis,
				)
			}
			curLength += dis
			lastP = thisPt
		}
		// return lastP

		console.log(this.pts, lastP, curLength, lengthAt, this.length, rat)
	}
	getAngleAt(rat) {
		if (rat > 0.9999) {
			rat = 0.99989
		}
		let p0 = this.getPosAt(rat)
		let p1 = this.getPosAt(rat + 0.0001)
		try {
			return p0.angleTo(p1)
		} catch (error) {
			console.log(error)
		}
	}

	getPoints(num = 10) {
		return Array(num + 1)
			.fill(0)
			.map((_, i) => this.getPosAt(i / num))
	}
}

function prop(obj, key, def) {
	if (!obj.hasOwnProperty(key)) {
		return def
	}
	return obj[key]
}

function ns(p, off, res) {
	return noise.simplex2(p.x * res + off.x, p.y * res + off.y)
}

function lastArr(arr) {
	return arr[arr.length - 1]
}

function alongLine(ps, step, func) {
	for (let i = 0; i < ps.length - 1; i++) {
		let p0 = ps[i]
		let p1 = ps[i + 1]
		let dis = p0.distanceTo(p1)
		let amnt = Math.ceil(dis / step)
		for (let j = 0; j < amnt; j++) {
			let ang = p0.angleTo(p1)
			let rat = j / amnt
			let p = Vec2.middleOf(p0, p1, rat)
			func({ p, ang, rat: i / ps.length + (1 / ps.length) * rat }, j, amnt)
		}
	}
}

function getDistribution(totalW, edgeMargin, elW) {
	let effectiveW = totalW - edgeMargin * 2
	let amnt = Math.floor(effectiveW / (elW + 5))
	let innerMarg = (effectiveW - amnt * elW) / (amnt + 1)
	let parts = []
	for (let i = 0; i < amnt; i++) {
		let start = edgeMargin + innerMarg + i * (elW + innerMarg)
		let end = start + elW
		parts.push({ start, end })
		if (end > totalW) {
			console.log(parts, totalW, elW, edgeMargin, innerMarg)
		}
	}

	return parts
}
function drawIsometricCylinderBase(
	ctx,
	p,
	r,
	startAng = 0,
	endAng = PI2,
	counterClockwise = false,
) {
	const radiusX = r * Math.cos(bottomLeftAng - PI)
	const radiusY = r * Math.sin(Math.abs(bottomRightAng))

	ctx.ellipse(p.x, p.y, radiusX, radiusY, 0, startAng, endAng, counterClockwise)
}
