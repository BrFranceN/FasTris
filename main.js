// import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import {Mesh, MeshNormalMaterial, Vector3} from 'three'; //controlla se poi li usi
import TWEEN from '@tweenjs/tween.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

// import * as dat from 'lil-gui'
import { AmbientLight, DirectionalLight } from 'three'
import MainCharacter from './src/MainCharacter';
import { update } from 'three/examples/jsm/libs/tween.module.js';
import SpecialObject from './src/SpecialObject';
import { mx_bits_to_01 } from 'three/examples/jsm/nodes/materialx/lib/mx_noise.js';
import { depth } from 'three/examples/jsm/nodes/Nodes.js';
// import { GUI } from 'dat.gui'

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


// Loader textures
const textureLoader = new THREE.TextureLoader();


const choice = localStorage.getItem('choice');

//X AND O
let meshxo = [];

//Special effects params
let special_effect = false;
let salire = true; // for box animation
let interval;
let isRunning=false;


let n_moves = 0; // number of moves effectuated

// time of one effect
const effect_time = 10;

//score of the game
let score = 0; 
let time_score = 0;
let player_choice = choice;
let special_objects = [];

//TEXT 
let textMesh;
let font;
let text;
let text_command;
let text_command2;
const fontLoader = new FontLoader();
fontLoader.load('public/font/helvetiker_regular.typeface.json', function(loadedFont) {
	text = "Score:" + score;
	text_command = "W";
	text_command2 = "A S D";
	font = loadedFont;
	createText(text);
	createText(text_command,false,-2,1.5,6,0,Math.PI/2);
	createText(text_command2,false,-2,0,7,0,Math.PI/2);
});

const initial_position = {
	init_x: 0,
	init_y: 0,
	init_z: 0
}

//Parameters of square in the ring tris
const squareSize = 1; 
const squareGeometry = new THREE.PlaneGeometry(squareSize, squareSize);
const squareMaterial = new THREE.MeshBasicMaterial({ color: 'red', side: THREE.DoubleSide, wireframe:true });

const grid_size = {
	x: 11,
	y: 11,
};

const tris_array = [48,49,50,
	59,60,61,
	70,71,72];
	
	
	let info_grid = createInfo(grid_size.x, grid_size.y,tris_array);
	// console.log(info_grid);
	
	//Where tris is positioned 
	const dim_character = 1;
	
	//DEBUG
// const gui = new dat.GUI()


// DEFINE SHAPE X AND O

// Define an O shape 
const innerRadius = 0.5;
const outerRadius = 1;
const segments = 32; // higher segments more polygonal, "smoother" ring
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


//SCENE
const scene = new THREE.Scene()
scene.background = new THREE.Color(0x39c09f)
scene.fog = new THREE.Fog(0x39c09f,20,35);
// scene.background = new THREE.Color(0x000000)




//BOXES
// const block_txt = textureLoader.load('/textures/block.jpg');
// const block_bmp = textureLoader.load('/textures/block_bump.jpg');
// const material = new THREE.MeshStandardMaterial({
//   map: block_txt,
//   bumpMap:block_bmp, 
//   bumpScale: 0.05,  
// });
const material = new THREE.MeshStandardMaterial({ color: 0x1d5846, wireframe:false });
const geometry = new THREE.BoxGeometry(dim_character, dim_character, dim_character);
const mesh1 = new THREE.Mesh(geometry, material);
const mesh2 = new THREE.Mesh(geometry, material);
const mesh3 = new THREE.Mesh(geometry, material);
const mesh4 = new THREE.Mesh(geometry, material);
mesh1.position.set(-1, 3, -1);
mesh2.position.set(grid_size.x, 3, grid_size.y);
mesh3.position.set(-1, 0, grid_size.x );
mesh4.position.set(grid_size.x, 0,-1 );

mesh1.castShadow = true;
mesh1.receiveShadow = true;
mesh2.castShadow = true;
mesh2.receiveShadow = true;
mesh3.castShadow = true;
mesh3.receiveShadow = true;
mesh4.castShadow = true;
mesh4.receiveShadow = true;
scene.add(mesh1);		
// scene.add(mesh2);
scene.add(mesh3);
scene.add(mesh4);

//PLANE
// const terrain_Texture = textureLoader.load('textures/terrain.jpg');
// const terrain_BumpMap = textureLoader.load('textures/terrain_bump.jpg'); 
// const terrainMaterial = new THREE.MeshStandardMaterial({
//   map: terrain_Texture,
//   bumpMap:terrain_BumpMap, 
//   bumpScale: 0.05,  
// });
const terrainMaterial = new THREE.MeshStandardMaterial({ color: 0x56f854});
const terrainGeometry = new THREE.PlaneGeometry(50, 50,50,50);
const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
terrain.rotateX(-Math.PI * 0.5); //because is vertical originally
terrain.position.setY(-1.5);
terrain.receiveShadow = true;
scene.add(terrain);

//PLANE TRIS
//change color ring?
const planeMaterial = new THREE.MeshStandardMaterial({ color: 'black', wireframe:true});
// to create a  x columns 
const planeGeometry = new THREE.PlaneGeometry(grid_size.x, grid_size.y,grid_size.x,grid_size.y);
planeGeometry.rotateX(-Math.PI * 0.5); //because is vertical originally
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
// move the ground in such way to have a more readable grid (with the 0,0,0 at the bottom left)
plane.position.x = grid_size.x / 2  - (dim_character/2);
plane.position.z = grid_size.y / 2 - (dim_character/2);  
// plane.position.setY(-1);
scene.add(plane);
plane.receiveShadow = true;




//PLANES TRIS ZONE
// const [x_tris, z_tris] = getCoordByIndex(tris_array[0],grid_size);
for (let i=0; i<tris_array.length; i++){
	const [x,z] = getCoordByIndex(tris_array[i],grid_size);
	addSquare(x,z,squareMaterial,squareGeometry);
}

const model_path = '3d_models/tyrone_mixamo/scene.gltf';
const loader = new MainCharacter(model_path,grid_size,initial_position);

// add the model to the scene when it is loaded -> tyhanks to this the life is better
const check_model_loaded = setInterval(() => {
  if (loader.modelLoaded) {
    scene.add(loader.model);
    clearInterval(check_model_loaded);
  }
}, 200);




//Camera
const fov = 60; 
// const fov = 10;//DEBUG
let camera = new THREE.PerspectiveCamera(fov, sizes.width / sizes.height, 0.1);
// camera.position.set(14, 6, 14);
camera.position.set(grid_size.x/2, 5, grid_size.y/2);
// camera.lookAt(new THREE.Vector3(0, 2.5, 0))
// camera.lookAt(new THREE.Vector3(3, 2.5, 3));

//Show the axes of coordinates system
const axesHelper = new THREE.AxesHelper(3)
// scene.add(axesHelper)

// Renderer
const renderer = new THREE.WebGLRenderer({
	antialias: window.devicePixelRatio < 2,
	logarithmicDepthBuffer: true,
})
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.5;
renderer.shadowMap.enabled = true; // ombre
renderer.shadowMap.type = THREE.VSMShadowMap;
// renderer.outputEncoding = THREE.sRGBEncoding;
document.body.appendChild(renderer.domElement)
handleResize()

// OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
// controls.target.set(grid_size.x/2,0,grid_size.y/2); // guardare verso
controls.target.set(0,0,0); // guardare verso DEBUG


// Lights
const ambientLight = new AmbientLight(0xffffff, 1.5);
const directionalLight = new DirectionalLight(0xffffff, 3.5);
directionalLight.position.set(14, 20, 14);
directionalLight.target.position.set(grid_size.x,0,grid_size.y);
directionalLight.shadow.mapSize.set(1024,1024);
directionalLight.shadow.radius = 6;
directionalLight.shadow.camera.top = 30;
directionalLight.shadow.camera.bottom = -30;
directionalLight.shadow.camera.left = -30;
directionalLight.shadow.camera.right = 30;
directionalLight.castShadow = true;
scene.add(ambientLight, directionalLight)



//Frame loop
function tic() {
	TWEEN.update();
	controls.update()
	mesh1.rotation.x +=0.1;
	mesh2.rotation.x +=0.1;
	mesh3.rotation.x +=0.1;
	mesh4.rotation.x +=0.1;

	// modify position of balls
	
	for (let i=0; i<special_objects.length; i++){

		special_objects[i].mesh.rotation.y+=0.1;

	}
	
	if (salire){
		mesh1.position.y-=0.03;
		mesh2.position.y-=0.03;
		mesh3.position.y+=0.03;
		mesh4.position.y+=0.03;
		if (mesh3.position.y > 3){
			salire = false;
		}
	}else{
		mesh1.position.y+=0.03;
		mesh2.position.y+=0.03;
		mesh3.position.y-=0.03;
		mesh4.position.y-=0.03;
		if (mesh3.position.y <= 0){
			salire = true;
		}
	}
	renderer.render(scene, camera)

	requestAnimationFrame(tic)
}

requestAnimationFrame(tic)





// PHASE GAME
window.addEventListener('keyup',function(e){
	loader.setDirection(e.code);

	//TEST ANIMAZIONE DA CANCELLARE
	if(e.code == 'KeyT'){
		// loader.setArm();
		// loader.animateLegs();
		// loader.animateArms();
		// loader.goodbye(); // ONLY FOR PRESENTATION
		//console.log("debug animation:");
		console.log("floor ---->",loader.getIndexByCoord(0));
		console.log("ceil ---->",loader.getIndexByCoord(1));
		console.log("position x", loader.model.position.x);
		console.log("position z", loader.model.position.z);
	}

	if(e.code == 'KeyG'){
		if (!isRunning){
			start_game();
			loader.setArm();
			loader.animateLegs();
			loader.animateArms();
			animateCamera();
			// isRunning = true; DEBUG
			// console.log('Partenza gioco:',isRunning);
		}
	}
	else if(e.code == 'KeyP'){
		if (isRunning){
			stop_game();
			isRunning=false;
			// console.log('Gioco fermo!:',isRunning);
		}
	}
	else if(e.code == 'Space' && isRunning){
		// const character_ind = loader.getInteralIndex();		
		const character_ind_floor = loader.getInteralIndex(0);		
		const character_ind_upper = loader.getInteralIndex(1);		
		const tris_found_index = tris_array.findIndex(tris_index => (tris_index == character_ind_floor) || (tris_index == character_ind_upper));
		if (tris_found_index >=0){
			const cell_index = tris_array[tris_found_index];

			const cell_tris_state = info_grid[cell_index];
			let move_done = false;
			// console.log("cell_tris_state",cell_tris_state);
			// console.log("cell_index",cell_index);
			//You done the move)
			if (cell_tris_state == 2){

				if (player_choice == 0){
					info_grid[cell_index] = 3;
				}else{
					info_grid[cell_index] = 4;
				}
				move_done = true;
			}
			
			//Now Your opponent done the move
			if (move_done){
				opponent_action();
			}
			
			
			
			let visualize = visualize_tris();
			let full = checkFullGrid(visualize);
			let winner = checkWin(visualize);

			if (winner == null){
				if (full){
					winner = 'Pair';
				}
			}



			//FORSE QUI POSSO GESTIRE LA SCELTA DI X oppure O da parte del player
			// nel caso il player scelga X basta rimanerlo uguale
			update_visual_tris(visualize,mesh_x,mesh_o);
			
			
			visualize = visualize_tris();
			update_visual_tris(visualize,mesh_x,mesh_o);

			//Check win condition!

			if (winner) {
				time_score = loader.getTimeScore();
				//console.log(`The winner is: ${winner}`);
				localStorage.setItem('score', score);
				localStorage.setItem('moves',time_score);
				localStorage.setItem('winner',winner);
				localStorage.setItem('initialChoice',player_choice);
				window.location.href = "results.html";
			} else {
				//console.log('No winner yet.');
			}
		}
	}
	// need to check or not if isRunning?
	else if(e.code == "KeyR"){
		loader.reset();
		reset_game();
	}

})



function start_game(){
	if(!isRunning){ //if the game is not already started
		interval = setInterval( () => {
			// console.log("floor index char",loader.getIndexByCoord(0));
			// console.log("upper index char",loader.getIndexByCoord(1));
			loader.updatePosition(grid_size);
			loader.addEventListener('updated', () => {

				// const character_ind = loader.getInteralIndex(); legacy code
				const character_ind_floor = loader.getInteralIndex(0);		
				const character_ind_upper = loader.getInteralIndex(1);
				
				
				//SPECIAL OBJECT COLLISION DETECTION
				// in teoria non dovrebbero essere 2

				// console.log("floor -> character_ind_floor",character_ind_floor);
				// console.log("upper -> character_ind_upper",character_ind_upper);
				// special_objects.forEach(element => console.log(element.getCellIndex()))

				const so_found_index = special_objects.findIndex(element => (
					( (element.getCellIndex() == character_ind_floor) || (element.getCellIndex() == character_ind_upper))))
				
				// console.log("so found index is:",so_found_index);
											
				if (so_found_index >=0){
					const cell_index = special_objects[so_found_index].getCellIndex();
					//TODO GESTIRE GLI EFFETTI DEGLI SPECIAL OBJECT
					let index_effect;


					// random choice
					let probability_choice = Math.random();
					if (probability_choice >= 0.7){
						index_effect = 1;
					}else if (probability_choice <0.7 && probability_choice >= 0.3){
						index_effect = 0;
					}else{
						index_effect = 2;
					}

					//console.log("effetto -> ",index_effect);
					special_effect = loader.getStateEffect();
					// Controllo se non c'e' gia' un effetto settato!
					if (special_effect==-1){
						special_effect = index_effect;
						if (index_effect == 0){
							//speed up effect
							// console.log("attivazione effetto 1");
							loader.skipControl();
							loader.setStateEffect(special_effect);
						}else if (index_effect == 1){
							//teleporter effect
							// console.log("attivazione effetto 2");
							let indx = Math.floor(Math.random() * (grid_size.x*grid_size.y));
							//console.log("indice ",indx);
							let [random_x,random_z] = getCoordByIndex(indx,grid_size);
							//console.log("x and z", random_x,random_z);
							//console.log()
							loader.model.position.set(random_x,0,random_z);
						}else if (index_effect == 2){
							if(player_choice == 0){
								player_choice = 1;
							}else{
								player_choice = 0;
							}
						}
					}
					
					info_grid[cell_index] = 0;
					// console.log("array of so",special_objects);
					//console.log("remove a special object from scene");
					scene.remove(special_objects[so_found_index].mesh);
					special_objects.splice(so_found_index,1);
					//Add score
					score+=100;
					updateScore(score);
				}

		});
			add_special_object(grid_size,loader);
		},100);
		isRunning=true;
	}
}


function stop_game(){
	// Magari qui mostrare la scritta vittoria?
	clearInterval(interval);
}


function reset_game(){
	stop_game();
	isRunning=false;
	//reset the info of the grid
	info_grid = createInfo(grid_size.x, grid_size.y,tris_array);
	// console.log("info grid: ", info_grid);

	//remove all objects from the scene
	for (let i = 0; i < special_objects.length; i++) {
		//console.log("sto rimuovendo", special_objects[i]);
		scene.remove(special_objects[i].mesh);
	}
	
	special_objects = [];
	removeMeshxo();


	score = 0;
	updateScore(score);

	start_game();
	isRunning = true;

	



}


function add_special_object(grid_size,loader){
	let collision;
	
	
	if (countObjectType(info_grid,1) < 5){
		
			let random_index
			do{
				random_index = Math.floor(Math.random() * grid_size.x *grid_size.y);
				collision = loader.check_collision(random_index);
				// //console.log("collision:", collision);
			}while(loader.check_collision(random_index) || info_grid[random_index]!=0);
			
			//I want generate an object in a cell != character cell
			const special_object = new SpecialObject(random_index);
			special_object.mesh.position.setY(0.5);
			special_object.mesh.castShadow = true;
			special_object.mesh.receiveShadow = true;
			info_grid[random_index] = 1;
			
			// //console.log("n_so", countObjectType(info_grid,1));

			
		
		
		
		
			//generate a random number [0, grid_size - 1]
			special_object.mesh.position.x = random_index % grid_size.x;
			special_object.mesh.position.z = Math.floor(random_index / grid_size.y);
			// //console.log("so -> ",special_object.getCellIndex())
			
			
			special_objects.push(special_object);
			scene.add(special_object.mesh);  
		}
		
		
		//TEST : OK
		// const [x_test,z_test] = getCoordByIndex(random_index,grid_size);
		// //console.log("random index =", random_index );
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
		if (player_choice == 0){
			info_grid[choosen_index] = 4;
		}else{
			info_grid[choosen_index] = 3;
		}
	}

	n_moves +=1;
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

	//console.log("visualize",visualize);
    for (let i = 0; i < 3; i++) {
        if (visualize[i][0] === visualize[i][1] && visualize[i][1] === visualize[i][2] && visualize[i][0] !== ' ') {
			//console.log("righe")
            return visualize[i][0]; // Return 'X' or 'O'
        }
    }

    // Check columns
    for (let i = 0; i < 3; i++) {
        if (visualize[0][i] === visualize[1][i] && visualize[1][i] === visualize[2][i] && visualize[0][i] !== ' ') {
			//console.log("colonne")
            return visualize[0][i]; // Return 'X' or 'O'
        }
    }

    // Check diagonals
    if (visualize[0][0] === visualize[1][1] && visualize[1][1] === visualize[2][2] && visualize[0][0] !== ' ') {
		//console.log("diagonale principale");
        return visualize[0][0]; // Return 'X' or 'O'
    }
    if (visualize[0][2] === visualize[1][1] && visualize[1][1] === visualize[2][0] && visualize[0][2] !== ' ') {
		//console.log("diagonale secondaria");
        return visualize[0][2]; // Return 'X' or 'O'
    }


    // No winner
    return null;
}



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
				meshxo.push(mesh_x);
                scene.add(mesh_x);
                addedMeshes[`X_${index_cell}`] = mesh_x;
                // console.log("Added X at position:", [x, z]);

            } else if (cellValue === 'O' && !addedMeshes[`O_${index_cell}`]) {
                const mesh_o = mesh_o_original.clone();
                mesh_o.position.set(x, 0, z);
                mesh_o.name = `O_${index_cell}`;
				meshxo.push(mesh_o);
                scene.add(mesh_o);
                addedMeshes[`O_${index_cell}`] = mesh_o;
                // console.log("Added O at position:", [x, z]);
            }
        }
        index_init += 3;
    }
}

// add a colorated square on principal plane 
function addSquare(x, z,squareMaterial,squareGeometry) {
    const square = new THREE.Mesh(squareGeometry, squareMaterial);
    square.rotation.x = -Math.PI / 2; // Rotate to lay flat
    square.position.set(x, 0.01, z); // Slightly above the ground to avoid z-fighting
	// scene.scale.set(0,0,0);
    scene.add(square);
    return square;
}


// create and add text
function createText(text,global=true,x=3,y=0,z=-2.5,x_r=0,y_r=0,z_r=0) {
	// console.log("creazione testo",font);
    const options = {
        font: font,
        size: 1,
        depth: 0.2,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.02,
        bevelOffset: 0,
        bevelSegments: 5
    };
	let material_text = new THREE.MeshStandardMaterial({ color: 0x1d5846 });
	let geometry_text = new TextGeometry(text, options);
	if (global == true){
		textMesh = new Mesh(geometry_text, material_text);
		textMesh.position.set(x, y, z);
		textMesh.rotation.set(x_r,y_r,z_r);
		scene.add(textMesh);
	}else{
		let mesh = new Mesh(geometry_text, material_text);
		mesh.position.set(x, y, z);
		mesh.rotation.set(x_r,y_r,z_r); 
		scene.add(mesh);
	}
}



// update the score																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																													
function updateScore(score) {
    let newText = "Score:" + score;


    if (textMesh) {
        scene.remove(textMesh);
    }
    createText(newText); 
}


function checkFullGrid(visualize){
	let full = true;
	for (let i = 0; i < visualize.length; i++) {
        for (let j = 0; j < visualize[i].length; j++) {
            if (visualize[i][j] == ' '){
				//console.log("ancora spaziooooooo!");
				full = false;
			}
    	}
	}

	return full;
}

function removeMeshxo(){
	for (let i =0; i < meshxo.length; i++){
		scene.remove(meshxo[i]);
	}

	meshxo = [];
}


function animateCamera() {
	const targetPosition = { x: 14, y: 5, z: 14 }; 
	const initialPosition = { x: grid_size/2, y: 5, z: grid_size/2 }; 

	
	new TWEEN.Tween(initialPosition)
	  .to(targetPosition, 2000) // Durata dell'animazione in millisecondi
	  .easing(TWEEN.Easing.Quadratic.InOut)
	  .onUpdate(() => {
		camera.position.set(initialPosition.x, initialPosition.y, initialPosition.z);
		camera.lookAt(new THREE.Vector3(3, 2.5, 3));

	  })
	  .start();
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












