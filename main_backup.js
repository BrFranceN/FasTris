// import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import {Mesh, MeshNormalMaterial, Vector3} from 'three'; //controlla se poi li usi

// import * as dat from 'lil-gui'
import { AmbientLight, DirectionalLight } from 'three'
import MainCharacter from './src/MainCharacter';
import { update } from 'three/examples/jsm/libs/tween.module.js';
// import MainCharacter from './src/MainCharacter'; // per ora non funziona

//PARAMETERS 
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
};

const grid_size = {
	x: 10,
	y: 10,
};

const dim_character = 1;

//DEBUG
// const gui = new dat.GUI()

//SCENE
const scene = new THREE.Scene()
scene.background = new THREE.Color('black')
// scene.background = new THREE.Color(0x000000)





//BOX
// const material = new THREE.MeshNormalMaterial()
const material = new THREE.MeshStandardMaterial({ color: 'coral', wireframe:false });
const geometry = new THREE.BoxGeometry(dim_character, dim_character, dim_character);
const mesh = new THREE.Mesh(geometry, material);
mesh.position.y += 0.5;
scene.add(mesh); 


//PLANE
const planeMaterial = new THREE.MeshStandardMaterial({ color: 'lightgray', wireframe:true});
// to create a  x columns 
const planeGeometry = new THREE.PlaneGeometry(grid_size.x, grid_size.y,grid_size.x,grid_size.y);
planeGeometry.rotateX(-Math.PI * 0.5); //because is vertical originally
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
// move the ground in such way to have a more readable grid (with the 0,0,0 at the bottom left)
plane.position.x = grid_size.x / 2  - (dim_character/2);
plane.position.z = grid_size.y / 2 - (dim_character/2);  
scene.add(plane);


const model_path = '3d_models/tyrone_mixamo/scene.gltf';
const loader = new MainCharacter(model_path);

// Add the model to the scene when it is loaded
const check_model_loaded = setInterval(() => {
  if (loader.modelLoaded) {
    scene.add(loader.model);
    clearInterval(check_model_loaded);
  }
}, 100);

//actual direction of character
let direction = RIGHT;
mesh.position.x = grid_size.x / 2 ;
mesh.position.z = grid_size.y / 2 ;


//PER ORA NON FUNZIONA MA QUANDO CI SARA' IL MODELLO FUNZIONANTE FORSE SI
// console.log("model exist?", model);
// model.position.x = grid_size.x / 2;
// model.position.y = grid_size.y / 2;





//Camera
const fov = 60
const camera = new THREE.PerspectiveCamera(fov, sizes.width / sizes.height, 0.1)
// camera.position.set(4, 4, 4);
camera.position.set(grid_size.x/2 + 2, 10 ,grid_size.y/2 + 2);
camera.lookAt(new THREE.Vector3(0, 2.5, 0))

//Show the axes of coordinates system
const axesHelper = new THREE.AxesHelper(3)
scene.add(axesHelper)

// Renderer
const renderer = new THREE.WebGLRenderer({
	antialias: window.devicePixelRatio < 2,
	logarithmicDepthBuffer: true,
})
document.body.appendChild(renderer.domElement)
handleResize()

// OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(grid_size.x/2,2,grid_size.y/2);


// Lights
const ambientLight = new AmbientLight(0xffffff, 1.5)
const directionalLight = new DirectionalLight(0xffffff, 4.5)
directionalLight.position.set(3, 10, 7)
scene.add(ambientLight, directionalLight)

//Clock three js
// const clock = new THREE.Clock()

//Grid
const grid = new THREE.Vector2(grid_size.x, grid_size.y);

//Frame loop
function tic() {
	// const deltaTime = clock.getDelta() // tempo trascorso dal frame precedente

	// const time = clock.getElapsedTime() //tempo totale trascorso dall'inizio

	controls.update()

	renderer.render(scene, camera)

	requestAnimationFrame(tic)
}

requestAnimationFrame(tic)






// Move block
window.addEventListener('click',function(){
	!isRunning ? start_game(mesh,direction): stop_game();
	console.log("running ? : ", isRunning);
})

window.addEventListener('keyup',function(e){
	console.log(e);
	setDirection(e);

})

// PHASE GAME
let isRunning = false;

function start_game(mesh,direction){
	if(!isRunning){ //if the game is not already started
		isRunning = setInterval( () => {
			update_position(mesh,direction);
		},400)
	}

}


function stop_game(){
	clearInterval(isRunning);

}


// function reset_game(){

// }





// Resize of the windows
window.addEventListener('resize', handleResize)

function handleResize() {
	sizes.width = window.innerWidth
	sizes.height = window.innerHeight

	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();

	renderer.setSize(sizes.width, sizes.height);

	const pixelRatio = Math.min(window.devicePixelRatio, 2);
	renderer.setPixelRatio(pixelRatio);
}


function setDirection(keyCode){
	switch (keyCode) {
		case 'ArrowUp':
		case 'KeyW':
			direction = UP
			break
		case 'ArrowDown':
		case 'KeyS':
			direction = DOWN
			break
		case 'ArrowLeft':
		case 'KeyA':
			direction = LEFT
			break
		case 'ArrowRight':
		case 'KeyD':
			direction = RIGHT
			break
		default:
			return
		}
}



// function that moves the body
function update_position(body,direction){
	body.position.add(direction);
	if (body.position.z < 0){
		body.position.z = grid_size.y - 1;
	}
	else if (body.position.z > grid_size.y - 1 ){
		body.position.z = 0;
	}
	if (body.position.x < 0){
		body.position.x = grid_size.x - 1;
	}
	else if (body.position.x > grid_size.x - 1 ){
		body.position.x = 0;
	}
}







//TODO TODAY 
//LOADING MODEL = OK	
//UNDERSTAND THE ANIMATIONS? 
	//
	//https://www.youtube.com/watch?v=4PAq3aaL8BE (chain animation)
//MOVE THE BLOCK = 
