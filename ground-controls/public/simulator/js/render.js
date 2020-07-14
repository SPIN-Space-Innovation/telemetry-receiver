const scene = new THREE.Scene()
scene.background = new THREE.Color(0x555555);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;

renderer.setSize( window.innerWidth, window.innerHeight );

document.body.appendChild( renderer.domElement );

const rocketDiameter = 9.7
const bodyLength = 150
const noseConeLength = 34
const finBottomBaseLength = 16
const finTopBaseLength = 8
const finHeight = 10.5

// Geometries
const rocketBodyGeometry = new THREE.CylinderGeometry(rocketDiameter, rocketDiameter, bodyLength, 20)
const noseConeGeometry = new THREE.ConeGeometry(rocketDiameter, noseConeLength, 20)
const finShape = new THREE.Shape()
finShape.moveTo(0,0)
finShape.lineTo(finBottomBaseLength, 0)
finShape.lineTo(finBottomBaseLength - finTopBaseLength/2, finHeight)
finShape.lineTo(finTopBaseLength/2, finHeight)
finShape.lineTo(0, 0)
let extrudeSettings = { depth: 1, bevelEnabled: false}
const finGeometry = new THREE.ExtrudeBufferGeometry(finShape, extrudeSettings); 

// Materials
const rocketBodyMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 })
const noseConeMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 })

// Objects
const rocketBody = new THREE.Mesh(rocketBodyGeometry, rocketBodyMaterial)
const noseCone = new THREE.Mesh(noseConeGeometry, noseConeMaterial)
const fin1 = new THREE.Mesh(finGeometry, noseConeMaterial)
const fin2 = new THREE.Mesh(finGeometry, noseConeMaterial)
const fin3 = new THREE.Mesh(finGeometry, noseConeMaterial)
const fin4 = new THREE.Mesh(finGeometry, noseConeMaterial)

// Initial Positions
noseCone.position.set(0, (bodyLength / 2 + noseConeLength / 2), 0)
rocketBody.position.set(0, 0, 0)

fin1.position.set(rocketDiameter/2 + finHeight/2 - 1, -bodyLength/2 + finBottomBaseLength, 0)
fin1.rotation.z = -Math.PI / 2

fin2.position.set(-rocketDiameter/2 - finHeight/2 + 1, -bodyLength/2, 0)
fin2.rotation.z = Math.PI / 2

fin3.position.set(0, -bodyLength/2, rocketDiameter)
fin3.rotation.y = Math.PI/2
fin3.rotation.x = Math.PI/2

fin4.position.set(0, -bodyLength/2 + finBottomBaseLength, -rocketDiameter)
fin4.rotation.y = Math.PI/2
fin4.rotation.x = -Math.PI/2

rocketBody.castShadow = true;
noseCone.castShadow = true
fin1.castShadow = true
fin2.castShadow = true
fin3.castShadow = true
fin4.castShadow = true

const rocket = new THREE.Group()
rocket.add(noseCone)
rocket.add(rocketBody)
rocket.add(fin1)
rocket.add(fin2)
rocket.add(fin3)
rocket.add(fin4)
scene.add(rocket)

// Camera and lights
const light = new THREE.SpotLight(0xffffff);
light.position.set( 0, 15, 200 );
scene.add( light );

camera.position.z = 200
camera.position.y = 15

function animate() {
	requestAnimationFrame(animate)
	renderer.render(scene, camera)
}
animate()

setRoll = (degrees) => {
  rocket.rotation.z = degrees * Math.PI / 180
}

setPitch = (degrees) => {
  rocket.rotation.x = degrees * Math.PI / 180
}

setYaw = (degrees) => {
  rocket.rotation.y = degrees * Math.PI / 180
}
