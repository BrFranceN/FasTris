// import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import {Mesh, MeshNormalMaterial, Vector3} from 'three'; //controlla se poi li usi
import TWEEN from '@tweenjs/tween.js';

// import * as dat from 'lil-gui'
import { AmbientLight, DirectionalLight } from 'three'
import MainCharacter from './src/MainCharacter';
import { update } from 'three/examples/jsm/libs/tween.module.js';
import SpecialObject from './src/SpecialObject';
import { mx_bits_to_01 } from 'three/examples/jsm/nodes/materialx/lib/mx_noise.js';
// import { GUI } from 'dat.gui'
// import MainCharacter from './src/MainCharacter'; // per ora non funziona


//MAP
// 0 -> empty cell
// 1 -> special object cell
// 2 -> tris empty cell
// 3 -> tris X cell
// 4 -> tris O cell

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

const tris_array = [34,35,36,
					44,45,46,
					54,55,56];


let info_grid = createInfo(grid_size.x, grid_size.y,tris_array);
console.log(info_grid);

//Where tris is positioned 
const dim_character = 1;

//DEBUG
// const gui = new dat.GUI()


// DEFINE SHAPE X AND O

// Define an O shape 
const innerRadius = 0.5;
const outerRadius = 1;
const segments = 32;
const geometry_o = new THREE.RingGeometry(innerRadius, outerRadius, segments);

// Create a material
const material_o = new THREE.MeshBasicMaterial({ color: 0xbd3335, side: THREE.DoubleSide });

// Create the mesh
const mesh_o = new THREE.Mesh(geometry_o, material_o);
mesh_o.rotation.x+=Math.PI/2;	
mesh_o.scale.set(0.5,0.5,0.5);


// Define the shape of an "X"
const createXShape = () => {
    const xGroup = new THREE.Group();

    const geometry = new THREE.BoxGeometry(0.2, 2, 0.2);
    const material = new THREE.MeshBasicMaterial({ color: 0x3351bd });

    const bar1 = new THREE.Mesh(geometry, material);
    bar1.rotation.z = Math.PI / 4;

    const bar2 = new THREE.Mesh(geometry, material);
    bar2.rotation.z = -Math.PI / 4;

    xGroup.add(bar1);
    xGroup.add(bar2);

    return xGroup;
};

// Create the "X" shape
const mesh_x = createXShape();

// Scale the X shape (2 times larger in all dimensions)
mesh_x.rotation.x += Math.PI/2;
mesh_x.scale.set(0.5, 0.5, 0.5);

// Add the "X" shape to the scene
//SCENE
const scene = new THREE.Scene()
scene.background = new THREE.Color('black')
// scene.background = new THREE.Color(0x000000)


// scene.add(mesh_o);
// scene.add(mesh_x);

//BOXES
// const material = new THREE.MeshNormalMaterial()
const material = new THREE.MeshStandardMaterial({ color: 'coral', wireframe:false });
const geometry = new THREE.BoxGeometry(dim_character, dim_character, dim_character);
const mesh1 = new THREE.Mesh(geometry, material);
const mesh2 = new THREE.Mesh(geometry, material);
const mesh3 = new THREE.Mesh(geometry, material);
const mesh4 = new THREE.Mesh(geometry, material);
mesh1.position.set(-2, 0, -2);
mesh2.position.set(10, 0, 10);
mesh3.position.set(-1, 0, 10 );
mesh4.position.set(10, 0,-1 );
scene.add(mesh1);	
scene.add(mesh2);
scene.add(mesh3);
scene.add(mesh4);


//PLANE
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xff7438, wireframe:true});
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
// mesh.position.x = grid_size.x / 2 ;
// mesh.position.z = grid_size.y / 2 ;







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
	TWEEN.update();
	controls.update()

	mesh1.rotation.y +=0.1;
	mesh2.rotation.y +=0.1;
	mesh3.rotation.y +=0.1;
	mesh4.rotation.y +=0.1;

	renderer.render(scene, camera)

	requestAnimationFrame(tic)
}

requestAnimationFrame(tic)





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

	else if(e.code == 'Space' && isRunning){
		const character_ind = loader.getInteralIndex();		
		const tris_found_index = tris_array.findIndex(tris_index => tris_index == character_ind);
		if (tris_found_index >=0){
			const cell_index = tris_array[tris_found_index];

			const cell_tris_state = info_grid[cell_index];

			//You done the move
			if (cell_tris_state == 2){
				info_grid[cell_index] = 3;
			}

			let visualize = visualize_tris();
			//FORSE QUI POSSO GESTIRE LA SCELTA DI X oppure O da parte del player
			update_visual_tris(visualize,mesh_x,mesh_o);
			
			//Now Your opponent done the move
			opponent_action();
			
			visualize = visualize_tris();
			update_visual_tris(visualize,mesh_x,mesh_o);

			//Check win condition!

			console.log("info attivo?",info_grid);
			console.log("info attivo?",visualize);

			let winner = checkWin(visualize);
			if (winner) {
				console.log(`The winner is: ${winner}`);
			} else {
				console.log('No winner yet.');
			}
		}
	}



})



function start_game(){
	if(!isRunning){ //if the game is not already started
		isRunning = setInterval( () => {
			loader.updatePosition(grid_size);
			loader.addEventListener('updated', () => {
				const character_ind = loader.getInteralIndex();
				//SPECIAL OBJECT DETECTION
				const so_found_index = special_objects.findIndex(element => element.getCellIndex() == character_ind);
				if (so_found_index >=0){
					const cell_index = special_objects[so_found_index].getCellIndex();
					
					//TODO GESTIRE GLI EFFETTI DEGLI SPECIAL OBJECT
					// loader.modify_control();
					
					info_grid[cell_index] = 0;
					console.log("array of so",special_objects);
					console.log("remove a special object from scene");
					scene.remove(special_objects[so_found_index].mesh);
					special_objects.splice(so_found_index,1);
				}
		});
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
			}while(loader.check_collision(random_index) || info_grid[random_index]!=0);
			
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





function createInfo(x, y,tris_info) {
    const totalElements = x * y;
    const dictionary = {};
    for (let i = 0; i < totalElements; i++) {
		if (tris_info.includes(i)){
			dictionary[i] = 2;
		}
		else{
			dictionary[i] = 0;
		}
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



//OPPONENT LOGIC 
function opponent_action() {
    const available_cell = tris_available_cells();
    
    //Logic of chosen cell (easy mod: random)
    const choosen_index = available_cell[Math.floor(Math.random() * available_cell.length)];
    
    if (choosen_index !== undefined) {
        info_grid[choosen_index] = 4;
	}
}

function tris_available_cells() {
    let available = [];
    tris_array.forEach(function(value) {
        if (info_grid[value] == 2) {
            available.push(value);
        }
    });
    return available;
}

function visualize_tris(){
	let visualize = [
		[info_grid[tris_array[0]],info_grid[tris_array[1]], info_grid[tris_array[2]]],
		[info_grid[tris_array[3]],info_grid[tris_array[4]], info_grid[tris_array[5]]],
		[info_grid[tris_array[6]],info_grid[tris_array[7]], info_grid[tris_array[8]]]
	];

    for (let i = 0; i < visualize.length; i++) {
        for (let j = 0; j < visualize[i].length; j++) {
            if (visualize[i][j] == 2) {
                visualize[i][j] = ' ';
            } else if (visualize[i][j] == 3) {
                visualize[i][j] = 'X';
            } else if (visualize[i][j] == 4) {
                visualize[i][j] = 'O';
            }
        }
    }

    return visualize;
}

function checkWin(visualize) {
    // Check rows
    for (let i = 0; i < 3; i++) {
        if (visualize[i][0] === visualize[i][1] && visualize[i][1] === visualize[i][2] && visualize[i][0] !== ' ') {
            return visualize[i][0]; // Return 'X' or 'O'
        }
    }

    // Check columns
    for (let i = 0; i < 3; i++) {
        if (visualize[0][i] === visualize[1][i] && visualize[1][i] === visualize[2][i] && visualize[0][i] !== ' ') {
            return visualize[0][i]; // Return 'X' or 'O'
        }
    }

    // Check diagonals
    if (visualize[0][0] === visualize[1][1] && visualize[1][1] === visualize[2][2] && visualize[0][0] !== ' ') {
        return visualize[0][0]; // Return 'X' or 'O'
    }
    if (visualize[0][2] === visualize[1][1] && visualize[1][1] === visualize[2][0] && visualize[0][2] !== ' ') {
        return visualize[0][2]; // Return 'X' or 'O'
    }

    // No winner
    return null;
}

// function update_visual_tris(visualize,mesh_x_original,mesh_o_original){	
// 	const mesh_x = mesh_x_original.clone();
// 	const mesh_o = mesh_o_original.clone();


// 	let index_init = 0;

// 	for (let i = 0; i < visualize.length; i++) {
//         for (let j = 0; j < visualize[i].length; j++) {
// 			if (visualize[i][j] == 'X') {
// 				const index_cell_x = tris_array[index_init + j];
// 				const [x_x,z_x] = getCoordByIndex(index_cell_x,grid_size);
// 				console.log("info X",[x_x,z_x]);
// 				mesh_x.position.set(x_x,0,z_x);
// 				scene.add(mesh_x);
//             } else if (visualize[i][j] == 'O') {
// 				visualize[i][j] = 'O';
// 				const index_cell_o = tris_array[index_init + j];
// 				const [x_o,z_o] = getCoordByIndex(index_cell_o,grid_size);
// 				console.log("info O",[x_o,z_o]);
// 				mesh_o.position.set(x_o,0,z_o);
// 				scene.add(mesh_o);
//             }
// 		}
// 		index_init += 3;
//     }
// }

function update_visual_tris(visualize, mesh_x_original, mesh_o_original) {	
    const addedMeshes = {}; // To keep track of added meshes

    let index_init = 0;

    for (let i = 0; i < visualize.length; i++) {
        for (let j = 0; j < visualize[i].length; j++) {
            const index = index_init + j;
            const cellValue = visualize[i][j];
            const index_cell = tris_array[index];
            const [x, z] = getCoordByIndex(index_cell, grid_size);

            if (cellValue === 'X' && !addedMeshes[`X_${index_cell}`]) {
                const mesh_x = mesh_x_original.clone();
                mesh_x.position.set(x, 0, z);
                mesh_x.name = `X_${index_cell}`;
                scene.add(mesh_x);
                addedMeshes[`X_${index_cell}`] = mesh_x;
                console.log("Added X at position:", [x, z]);

            } else if (cellValue === 'O' && !addedMeshes[`O_${index_cell}`]) {
                const mesh_o = mesh_o_original.clone();
                mesh_o.position.set(x, 0, z);
                mesh_o.name = `O_${index_cell}`;
                scene.add(mesh_o);
                addedMeshes[`O_${index_cell}`] = mesh_o;
                console.log("Added O at position:", [x, z]);
            }
        }
        index_init += 3;
    }
}





//TEST GUI
// let guiControls = new function(){
// 	mesh.position.x += 0.01;
// 	mesh.position.y += 0.01;
// 	mesh.position.z += 0.01;
// }
// let datGUI = new GUI();
// datGUI.add(guiControls,'mesh.position.x',0,1);
// datGUI.add(guiControls,'mesh.position.y',0,1);
// datGUI.add(guiControls,'mesh.position.z',0,1);







//LOGIC OF TRIS 









