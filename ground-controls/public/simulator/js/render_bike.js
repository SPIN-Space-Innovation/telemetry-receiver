const scene = new THREE.Scene()
scene.background = new THREE.Color(0xbbbbbb)
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

const renderer = new THREE.WebGLRenderer()
renderer.shadowMap.enabled = true

renderer.setSize(window.innerWidth, window.innerHeight)

document.body.appendChild(renderer.domElement)

let geometry = new THREE.PlaneGeometry(2000, 2000, 32 )
let material = new THREE.MeshBasicMaterial({color: 0x333333})
let plane = new THREE.Mesh(geometry, material)
plane.rotateX(- Math.PI / 2)
scene.add(plane)

moto = null
let loader = new THREE.GLTFLoader()
loader.load(
  '/models/motorcycle.gltf',
  (object) => {
    moto = object.scene
    scene.add(moto)
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total * 100) + '% loaded')
  },
  (error) => {
    console.log( 'An error happened' )
  }
)

const light = new THREE.SpotLight(0xffffff, 4)
light.position.set( 0, 180, 50 )
scene.add(light)

camera.position.z = 160
camera.position.y = 180
camera.rotation.x = -40 * Math.PI/180
camera.position.x = 0

function animate() {
	requestAnimationFrame(animate)
	renderer.render(scene, camera)
}
animate()

maxAngle = 0
setRoll = (degrees) => {
  moto.rotation.z = degrees * Math.PI / 180

  currentAngle = Math.abs(parseFloat(degrees))
  if (currentAngle > maxAngle) {
    maxAngle = currentAngle
  }
  document.getElementsByTagName('pre')[0].innerHTML = `Max Angle: ${maxAngle.toFixed(0)}&#176; \nCurrent Angle: ${currentAngle.toFixed(0)}&#176;`
}

setPitch = (degrees) => {
  moto.rotation.x = degrees * Math.PI / 180
}

setYaw = (degrees) => {
  moto.rotation.y = degrees * Math.PI / 180
}
