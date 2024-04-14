var bgGridX = 15
var bgGridY = 15
var bgLineWd = 1
var bgLineOffset = 4
;(function () {
	class BgLinePass extends THREE.Pass {
		constructor() {
			super()
			if (THREE.BgLineShader === undefined)
				console.error("THREE.BgLineShader relies on THREE.BgLineShader")
			const shader = THREE.BgLineShader
			this.uniforms = THREE.UniformsUtils.clone(shader.uniforms)
			this.material = new THREE.ShaderMaterial({
				uniforms: this.uniforms,
				vertexShader: shader.vertexShader,
				fragmentShader: shader.fragmentShader,
			})
			this.uniforms.lightTexture.value = lightTexture

			// this.uniforms.enemyTexture.value = enemyTexture
			// this.uniforms.lightTexture.value = lightTexture
			this.uniforms.resolution.value = new THREE.Vector2(width, height)

			this.fsQuad = new THREE.FullScreenQuad(this.material)
		}

		render(renderer, writeBuffer, readBuffer, deltaTime) {
			this.uniforms["tDiffuse"].value = readBuffer.texture

			this.uniforms["time"].value = gameState.ticker

			this.uniforms.playerPos.value = new THREE.Vector2(
				gameState.player.p.x,
				height - gameState.player.p.y,
			)
			if (this.renderToScreen) {
				renderer.setRenderTarget(null)
				this.fsQuad.render(renderer)
			} else {
				renderer.setRenderTarget(writeBuffer)
				if (this.clear) renderer.clear()
				this.fsQuad.render(renderer)
			}
		}
	}

	THREE.BgLinePass = BgLinePass
})()
