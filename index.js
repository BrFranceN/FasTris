import * as THREE from 'three';


function selectChoice(choice) {
    if (choice == 'X'){
        selectedChoice = 0;
    }else if(choice == 'O'){
        selectedChoice = 1;
    }

    document.getElementById('play_button').disabled = false;
    document.querySelectorAll('.choice').forEach(el => el.style.pointerEvents = 'none');
}



let selectedChoice = null;




// Creat X
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

const canvasX = document.getElementById('canvas_x');
const rendererX = new THREE.WebGLRenderer({ canvas: canvasX, alpha: true });
rendererX.setSize(100, 100);
const sceneX = new THREE.Scene();
const cameraX = new THREE.PerspectiveCamera(30, 1, 0.1, 1000);
cameraX.position.z = 5;
sceneX.add(mesh_x);
rendererX.render(sceneX, cameraX);

// Create a renderer for O
const canvasO = document.getElementById('canvas_o');
const rendererO = new THREE.WebGLRenderer({ canvas: canvasO, alpha: true });
rendererO.setSize(100, 100);
const sceneO = new THREE.Scene();
const cameraO = new THREE.PerspectiveCamera(30, 1, 0.1, 1000);
cameraO.position.z = 5;

// Create O
const innerRadius = 0.8;
const outerRadius = 1;
const segments = 32;
const geometry_o = new THREE.RingGeometry(innerRadius, outerRadius, segments);

// Create a material
const material_o = new THREE.MeshBasicMaterial({ color: 0xbd3335, side: THREE.DoubleSide });

// Create the mesh
const mesh_o = new THREE.Mesh(geometry_o, material_o);




sceneO.add(mesh_o);
rendererO.render(sceneO, cameraO);

// Add event listeners to choices
document.getElementById('choice_x').addEventListener('click', () => {
    selectChoice('X');
});

document.getElementById('choice_o').addEventListener('click', () => {
    selectChoice('O');
});


document.getElementById('play_button').addEventListener('click', () => {
    if (selectedChoice!==null) {
        console.log("selezionato",selectedChoice);
        localStorage.setItem('choice', selectedChoice);
        window.location.href = "index_game.html";
    }
    else{
        alert("select X or O!");
        console.log("non selezionato",selectedChoice);
    }
});