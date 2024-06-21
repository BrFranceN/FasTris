// import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import {Mesh, MeshNormalMaterial, Vector3} from 'three'; //controlla se poi li usi

// import * as dat from 'lil-gui'
import { AmbientLight, DirectionalLight } from 'three'
import MainCharacter from './src/MainCharacter';
import { update } from 'three/examples/jsm/libs/tween.module.js';
import SpecialObject from './src/SpecialObject';
// import MainCharacter from './src/MainCharacter'; // per ora non funziona


//PARAMETERS 
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
};

const limit_special_object = 5;
let special_objects = [];

const initial_position = {
	init_x: 0,
	init_y: 0,
	init_z: 0
}


const grid_size = {
	x: 10,
	y: 10,
};

let info_grid = createInfo(grid_size.x, grid_size.y);
console.log(info_grid);

//Where tris is positioned 
const tris_array = [34,35,36,44,45,46,54,55,56];

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
const loader = new MainCharacter(model_path,grid_size,initial_position);

// Add the model to the scene when it is loaded
const check_model_loaded = setInterval(() => {
  if (loader.modelLoaded) {
    scene.add(loader.model);
    clearInterval(check_model_loaded);
  }
}, 100);

//actual direction of character
// let direction = RIGHT;
mesh.position.x = grid_size.x / 2 ;
mesh.position.z = grid_size.y / 2 ;







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
// window.addEventListener('click',function(){
// 	
// 	console.log("running ? : ", isRunning);
// })

// PHASE GAME
let isRunning = false;
window.addEventListener('keyup',function(e){
	loader.setDirection(e.code);



	if(e.code == 'KeyG'){
		if (!isRunning){
			start_game();
			console.log('Partenza gioco:',isRunning);
		}
	}
	else if(e.code == 'KeyP'){
		if (isRunning){
			stop_game();
			console.log('Gioco fermo!:',isRunning);
		}
	}
	
})



function start_game(){
	if(!isRunning){ //if the game is not already started
		isRunning = setInterval( () => {
			loader.updatePosition(grid_size);
		});
		loader.addEventListener('updated', () => {
			const character_ind = loader.getInteralIndex();
			//special object detection
			const so_found_index = special_objects.findIndex(element => element.getCellIndex() == character_ind);
			console.log(so_found_index);
			if (so_found_index >=0){
				const cell_index = special_objects[so_found_index].getCellIndex();

				//TODO GESTIRE GLI EFFETTI DEGLI SPECIAL OBJECT
				info_grid[cell_index] = 0;
				console.log("array of so",special_objects);
				console.log("remove a special object from scene");
				scene.remove(special_objects[so_found_index].mesh);
				special_objects.splice(so_found_index,1);
			}
			add_special_object(grid_size,loader);
		},400)
	}
}


function stop_game(){
	clearInterval(isRunning);
}


// function reset_game(){

// }



function add_special_object(grid_size,loader){
	let collision;
	
	
	if (countObjectType(info_grid,1) < 5){
		
			let random_index
			do{
				random_index = Math.floor(Math.random() * grid_size.x *grid_size.y);
				collision = loader.check_collision(random_index);
				console.log("collision:", collision);
			}while(loader.check_collision(random_index) || info_grid[random_index]==1);
			
			//I want generate an object in a cell != character cell
			const special_object = new SpecialObject(random_index);
			info_grid[random_index] = 1;
			
			// console.log("n_so", countObjectType(info_grid,1));

			
		
		
		
		
			//generate a random number [0, grid_size - 1]
			special_object.mesh.position.x = random_index % grid_size.x;
			special_object.mesh.position.z = Math.floor(random_index / grid_size.y);
			// console.log("so -> ",special_object.getCellIndex())
			
			
			special_objects.push(special_object);
			scene.add(special_object.mesh);
		}
		
		
		//TEST : OK
		// const [x_test,z_test] = getCoordByIndex(random_index,grid_size);
		// console.log("random index =", random_index );
		// console.log("x =", special_object.mesh.position.x );
		// console.log("z =", special_object.mesh.position.z );
		// console.log("x_test =", x_test);
		// console.log("z_test =", z_test );
		// let index_test = getIndexByCoord(special_object.mesh.position.z, special_object.mesh.position.x, grid_size);
		// console.log(random_index, index_test);
		
	

}







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



function getIndexByCoord(z_coordinate,x_coordinate,grid_size){
	return z_coordinate * grid_size.x + x_coordinate;
}


function getCoordByIndex(index,grid_size){
	let coordinate_x = index % grid_size.x;
	let coordinate_z = Math.floor(index / grid_size.y );
	return [coordinate_x,coordinate_z];
}





function createInfo(x, y) {
    const totalElements = x * y;
    const dictionary = {};
    for (let i = 0; i < totalElements; i++) {
        dictionary[i] = 0;
    }
    return dictionary;
}


function countObjectType(dictionary,type){
	let count = 0;
	for (const key in dictionary){
		if (dictionary[key]==type){
			count++;
		}
	}
	return count;
}



//Remove an object
// function removeEntity(object) {
//     var selectedObject = scene.getObjectByName(object.name);
//     scene.remove( selectedObject );
//     animate();
// }









