import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import {MeshSurfaceSampler} from 'three/examples/jsm/math/MeshSurfaceSampler'

import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader' 
import GUI from 'lil-gui'
import gsap from 'gsap'
import fragmentShader from './shaders/fragment.glsl'
import vertexShader from './shaders/vertexParticles.glsl'
 

import head from './fire_head_mask.glb'
import matcap1 from './t.png'
import matcap3 from './t.png'


import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer'
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass'
import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass'
import {GlitchPass} from 'three/examples/jsm/postprocessing/GlitchPass'

const colors = require('nice-color-palettes')

let random = colors[Math.floor(Math.random() * 100)]
 
export default class Sketch {
	constructor(options) {
		
		this.scene = new THREE.Scene()
		
		this.container = options.dom
		
		this.width = this.container.offsetWidth
		this.height = this.container.offsetHeight
		
		
		// // for renderer { antialias: true }
		this.renderer = new THREE.WebGLRenderer({ antialias: true })
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
		this.renderTarget = new THREE.WebGLRenderTarget(this.width, this.height)
		this.renderer.setSize(this.width ,this.height )
		this.renderer.setClearColor(0x0000000, 1)
		// this.renderer.useLegacyLights = true
		// this.renderer.outputEncoding = THREE.sRGBEncoding
 

		 
		this.renderer.setSize( window.innerWidth, window.innerHeight )

		this.container.appendChild(this.renderer.domElement)
 


		this.camera = new THREE.PerspectiveCamera( 70,
			 this.width / this.height,
			 0.01,
			 10
		)
 
		this.camera.position.set(0, 0, 2) 
		this.controls = new OrbitControls(this.camera, this.renderer.domElement)
		this.time = 0


		this.dracoLoader = new DRACOLoader()
		this.dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/')
		this.gltf = new GLTFLoader()
		this.gltf.setDRACOLoader(this.dracoLoader)

		this.isPlaying = true


		this.matcapMaterial = new THREE.MeshMatcapMaterial({
			matcap: new THREE.TextureLoader().load(matcap1)
		})

		this.gltf.load(head, (gltf) => {
			this.model = gltf.scene.children[0].children[0].children[0].children[0].children[0]
 
			this.model.geometry.rotateX(-Math.PI / 2)
			this.model.geometry.rotateY(-Math.PI * 2)
			// this.scene.add(this.model)
		 

			 
			this.obsidiangeometry = this.model.geometry.clone()

			this.addObjects()		 
			this.resize()
			this.render()
			this.setupResize()
	 
			this.model.material = this.material

			// let points = new THREE.Points(this.model.geometry, this.material)



			let sampler = new MeshSurfaceSampler(this.model)
				.setWeightAttribute('uv')
				.build()

			const geometry = new THREE.BufferGeometry()

			let number = 10000
		 
			let pointPos = new Float32Array(number * 3)
			let colors = new Float32Array(number * 3)
			let sizes = new Float32Array(number)
			let normals = new Float32Array(number * 3)



			for (let i = 0; i < number; i++) {
				let _position = new THREE.Vector3()
				let _normal = new THREE.Vector3()
				sampler.sample(_position, _normal)
				let randomColor = new THREE.Color(random[Math.floor(Math.random() * 5)])
				
		 
				pointPos.set([_position.x, _position.y, _position.z], i * 3)
				colors.set([randomColor.r, randomColor.g, randomColor.b], i * 3)
				normals.set([_normal.x, randomColor.y, _normal.z], i * 3)
				
				sizes.set([Math.random()], i )

				
			}
			geometry.setAttribute('colors', new THREE.BufferAttribute(colors, 3))
			geometry.setAttribute('sizes', new THREE.BufferAttribute(sizes, 1))
			geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3))

			geometry.setAttribute('position', new THREE.BufferAttribute(pointPos, 3))
			let points = new THREE.Points(geometry, this.material)
			let obsid = new THREE.Mesh(this.obsidiangeometry, this.matcapMaterial)
			this.scene.add(points)
			this.scene.add(obsid)

 
		})
 

 
	}

	settings() {
		let that = this
		this.settings = {
			progress: 0
		}
		this.gui = new GUI()
		this.gui.add(this.settings, 'progress', 0, 1, 0.01)
	}

	setupResize() {
		window.addEventListener('resize', this.resize.bind(this))
	}

	resize() {
		this.width = this.container.offsetWidth
		this.height = this.container.offsetHeight
		this.renderer.setSize(this.width, this.height)
		this.camera.aspect = this.width / this.height


		this.imageAspect = 853/1280
		let a1, a2
		if(this.height / this.width > this.imageAspect) {
			a1 = (this.width / this.height) * this.imageAspect
			a2 = 1
		} else {
			a1 = 1
			a2 = (this.height / this.width) / this.imageAspect
		} 


		this.material.uniforms.resolution.value.x = this.width
		this.material.uniforms.resolution.value.y = this.height
		this.material.uniforms.resolution.value.z = a1
		this.material.uniforms.resolution.value.w = a2

		this.camera.updateProjectionMatrix()



	}


	addObjects() {
		let that = this
		this.material = new THREE.ShaderMaterial({
			extensions: {
				derivatives: '#extension GL_OES_standard_derivatives : enable'
			},
			side: THREE.DoubleSide,
			uniforms: {
				time: {value: 0},
				resolution: {value: new THREE.Vector4()}
			},
			transparent: true,
			vertexShader,
			fragmentShader,
			// blending: THREE.AdditiveBlending,
			// depthTest: false,
			depthWrite: false
		})
		
		this.geometry = new THREE.PlaneGeometry(1,1,1,1)
		// this.plane = new THREE.Mesh(this.geometry, this.material)
 
		// this.scene.add(this.plane)
 
	}



	addLights() {
		const light1 = new THREE.AmbientLight(0xeeeeee, 0.5)
		this.scene.add(light1)
	
	
		const light2 = new THREE.DirectionalLight(0xeeeeee, 0.5)
		light2.position.set(0.5,0,0.866)
		this.scene.add(light2)
	}

	stop() {
		this.isPlaying = false
	}

	play() {
		if(!this.isPlaying) {
			this.isPlaying = true
			this.render()
		}
	}

	render() {
		if(!this.isPlaying) return
		this.time += 0.05
		this.material.uniforms.time.value = this.time
		 
		//this.renderer.setRenderTarget(this.renderTarget)
		this.renderer.render(this.scene, this.camera)
		//this.renderer.setRenderTarget(null)
 
		requestAnimationFrame(this.render.bind(this))
	}
 
}
new Sketch({
	dom: document.getElementById('container')
})
 