import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {Vector3} from 'three'; 


// TODO: FIX CORRECT DIRECTIONS
const UP = new Vector3(0,0,-1);
const DOWN = new Vector3(0,0,1);
const RIGHT = new Vector3(-1,0,0);
const LEFT = new Vector3(1,0,0);


export default class MainCharacter {

    //Parameters

    internal_index;

    direction =  UP;
        

    constructor(url) {
        this.url = url;
        this.model = null;
        this.modelLoaded = false;
        this.loadModel();
    
    }

    loadModel() {
        const modelLoader = new GLTFLoader();
        modelLoader.load(this.url, (gltf) => {
        this.model = gltf.scene;
        this.model.scale.set(40, 40, 40); // Adjust the scaling as needed
        this.model.position.set(0, 0, 0); // Adjust the position as needed
        this.modelLoaded = true;
        console.log('Model loaded:', this.model);
        }, undefined, (error) => {
        console.error(error);
        });
    }

    updatePosition(grid_size){
        this.model.position.add(this.direction);
        if (this.model.position.z < 0){
        this.model.position.z = grid_size.y - 1;
        }
        else if (this.model.position.z > grid_size.y - 1 ){
        this.model.position.z = 0;
        }
        if (this.model.position.x < 0){
        this.model.position.x = grid_size.x - 1;
        }
        else if (this.model.position.x > grid_size.x - 1 ){
        this.model.position.x = 0;
        }
    }

    // setPosition(position){

    // }
    

    setDirection(keyCode){
        switch (keyCode) {
            case 'ArrowUp':
            case 'KeyW':
                this.direction = UP
                break
            case 'ArrowDown':
            case 'KeyS':
                this.direction = DOWN
                break
            case 'ArrowLeft':
            case 'KeyA':
                this.direction = LEFT
                break
            case 'ArrowRight':
            case 'KeyD':
                this.direction = RIGHT
                break
            default:
                return
            }
    }

}