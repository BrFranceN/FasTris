import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

document.addEventListener('DOMContentLoaded', () => {
    const resultsModelContainer = document.getElementById('results_screen');

    // Check if the container exists
    if (!resultsModelContainer) {
        console.error('Results model container not found!');
        return;
    }

    const score = localStorage.getItem('score');
    const time_score = localStorage.getItem('score');

    const score_element = document.getElementById('final_score');
    console.log("score",score);
    if (score) {
        score_element.innerText = `Score:${score}`;
    }

    // Create a new scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x39c09f); // Set background color

    // Create a camera
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.z = 10;

    // Create a renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(400, 400);
    resultsModelContainer.appendChild(renderer.domElement);

    // Add OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Load the GLTF model
    const loader = new GLTFLoader();
    loader.load('public/3d_models/tyrone_mixamo/scene.gltf', (gltf) => {
        const model = gltf.scene;
        console.log("Model loaded:", model); // Log the model
        model.scale.set(300, 300, 300); // Adjust scale if necessary
        model.position.set(0, 0, 0); // Adjust position if necessary
        scene.add(model);
    }, undefined, (error) => {
        console.error('Error loading GLTF model:', error);
    });

    // Add a light
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5).normalize();
    scene.add(light);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }

    animate();
});

