uniform float time;
uniform float progress;
uniform sampler2D texture1;
uniform vec4 resolution;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vColor;
varying float vNoise;

varying vec3 vPosition;
float PI = 3.1415926;

 
void main() {
	 
	float dist = length(gl_PointCoord - vec2(0.5));
	float disc = smoothstep(0.5, 0.45, dist);
	gl_FragColor = vec4(vColor, disc * 0.5 * vNoise);
	if(disc < 0.001) discard;
}