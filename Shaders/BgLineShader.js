;(function () {
	const BgLineShader = {
		//         const bgGridX = rndInt(5, 10)
		// const bgGridY = rndInt(5, 5 + 50 * rndFloat())
		// const bgLineWd = 4
		// const bgLineOffset = 0
		uniforms: {
			tDiffuse: {
				value: null,
			},

			playerTexture: {
				value: null,
			},
			lightTexture: {
				value: null,
			},

			time: {
				value: 0.0,
			},

			gridRes: {
				value: new THREE.Vector2(0, 0),
			},
			playerPos: {
				value: new THREE.Vector2(0, 0),
			},
			playerDir: {
				value: new THREE.Vector2(0, 0),
			},
			lineWd: {
				value: 0,
			},
			lineOffset: {
				value: 0,
			},
			resolution: {
				value: new THREE.Vector2(0, 0),
			},
		},
		vertexShader: `

		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,
		fragmentShader: `

		#include <common>

		// control parameter
		uniform float time;
        uniform sampler2D tDiffuse; 
        uniform sampler2D lightTexture; 
        
        uniform vec2 playerPos;
        uniform vec2 playerDir;
        uniform vec2 resolution;
        uniform vec2 gridRes;
      
        uniform float lineWd;
        uniform float lineOffset;  
		 

		varying vec2 vUv;

		//	Simplex 3D Noise 
//	by Ian McEwan, Ashima Arts
//
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

float snoise(vec3 v){ 
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

// First corner
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;

// Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  //  x0 = x0 - 0. + 0.0 * C 
  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1. + 3.0 * C.xxx;

// Permutations
  i = mod(i, 289.0 ); 
  vec4 p = permute( permute( permute( 
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

// Gradients
// ( N*N points uniformly over a square, mapped onto an octahedron.)
  float n_ = 1.0/7.0; // N=7
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);  //  mod(p,N*N)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

//Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

// Mix final noise value
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                dot(p2,x2), dot(p3,x3) ) );
}

        //FROM https://stackoverflow.com/questions/5149544/can-i-generate-a-random-number-inside-a-pixel-shader
        float random( vec2 p )
        {
            vec2 K1 = vec2(
                23.14069263277926, // e^pi (Gelfond's constant)
                 2.665144142690225 // 2^sqrt(2) (Gelfondâ€“Schneider constant)
            );
            return fract( cos( dot(p,K1) ) * 12345.6789 );
        }
        //END FROM https://stackoverflow.com/questions/5149544/can-i-generate-a-random-number-inside-a-pixel-shader


        bool isOnLine(vec2 pos) {
            return (mod(pos.x ,gridRes.x) < lineWd || mod(pos.y ,gridRes.y) < lineWd);
        }
        // bool isOnLine(vec2 pos) {
        //   return abs(sin(pos.x * 0.01)-pos.y*0.1) < 0.1 ;
        // }

        float minmax(float a, float b) {
            return mix(a,b,step(a,b));
        }

         float luma(vec3 color) {
          return dot(color, vec3(0.299, 0.587, 0.114));
        }
        
        float luma(vec4 color) {
          return dot(color.rgb, vec3(0.299, 0.587, 0.114));
        }
         
        float dither4x4(vec2 position, float brightness) {
          int x = int(mod(position.x, 4.0));
          int y = int(mod(position.y, 4.0));
          int index = x + y * 4;
          float limit = 0.0;
        
          if (x < 8) {
            if (index == 0) limit = 0.0625;
            if (index == 1) limit = 0.5625;
            if (index == 2) limit = 0.1875;
            if (index == 3) limit = 0.6875;
            if (index == 4) limit = 0.8125;
            if (index == 5) limit = 0.3125;
            if (index == 6) limit = 0.9375;
            if (index == 7) limit = 0.4375;
            if (index == 8) limit = 0.25;
            if (index == 9) limit = 0.75;
            if (index == 10) limit = 0.125;
            if (index == 11) limit = 0.625;
            if (index == 12) limit = 1.0;
            if (index == 13) limit = 0.5;
            if (index == 14) limit = 0.875;
            if (index == 15) limit = 0.375;
          }
        
          return brightness < limit ? 0.0 : 1.0;
        }
        
        vec3 dither4x4(vec2 position, vec3 color) {
          return color * dither4x4(position, luma(color));
        }
        
        vec4 dither4x4(vec2 position, vec4 color) {
          return vec4(color.rgb * dither4x4(position, luma(color)), 1.0);
        }

		void main() {
      float interval = 10.;
      float lightTime = 2.;
      float timeMod = mod(time,interval);
      vec2 uv = vUv;
      
 
			vec4 cTextureScreen = texture2D( tDiffuse, uv );
			vec4 light = texture2D( lightTexture, uv );
      
      vec4 col = cTextureScreen;
      vec2 pos = uv * resolution.xy;
      col.xyz += snoise(vec3(pos,1.))  * .05;
           

            
      
    
      col*=light.a;
      col.r += light.a * (light.r-light.g);
      // if (light.a > 0.) {
        // col.xyz  = mix(col.xyz,light.rgb,light.a);
      // }
      
 
 
 
			gl_FragColor = col ;

		}`,
	}
	THREE.BgLineShader = BgLineShader
})()
