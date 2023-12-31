uniform float time;
varying vec2 vUv;
varying vec3 vPosition;
uniform sampler2D texture1;
float PI = 3.1415926;
varying vec3 vNormal;
attribute vec3 colors;
attribute float sizes;
varying float vNoise;
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
    dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
varying vec3 vColor;
void main () {
	float noise = snoise(vPosition.xy * 15. + vec2(time / 10.));
	vNoise = noise;
	vUv = uv;
		vNormal = normal;
	vColor = colors;
	vPosition = position ;
	float offset = 0.1 * (0.5 + 0.5 * sin(position.y * 10. + time));
	vec3 newpos =  position + 0.1 * 0.01 + 0.1 * noise * 0.1;
	vec4 mvPosition = modelViewMatrix * vec4(newpos, 1.);
	gl_PointSize = (1. + sizes * 2.) * ( 1. / -mvPosition.z);
	gl_Position = projectionMatrix * mvPosition;
}