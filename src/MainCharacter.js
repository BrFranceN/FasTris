import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {EventDispatcher, Vector3} from 'three'; 


// TODO: FIX CORRECT DIRECTIONS
const UP = new Vector3(0,0,-1);
const DOWN = new Vector3(0,0,1);
const RIGHT = new Vector3(1,0,0);
const LEFT = new Vector3(-1,0,0);


export default class MainCharacter extends EventDispatcher {

    //Parameters
    

    direction =  UP;
    special_objects = [];
        

    constructor(url,grid_size,initial_position) {
        super();
        this.url = url;
        this.model = null;
        this.internal_index = null;
        this.modelLoaded = false;
        this.initial_position = initial_position;
        this.grid_size = grid_size;
        // this.tris_array = tris_array;
        this.loadModel();
    }

    loadModel() {
        const modelLoader = new GLTFLoader();
        modelLoader.load(this.url, (gltf) => {
        this.model = gltf.scene;
        this.model.scale.set(40, 40, 40); 
        let x_i = this.initial_position.init_x;
        let y_i = this.initial_position.init_y;
        let z_i = this.initial_position.init_z;
        this.model.position.set(x_i, y_i, z_i);
        this.internal_index = this.getIndexByCoord(); //set the initial index given by intial position of the body
        console.log("sto qua", this.internal_index);
        this.modelLoaded = true;
        console.log('Model loaded:', this.model);
        }, undefined, (error) => {
        console.error(error);
        });
    }

    updatePosition(grid_size){
        //check collision before update
        //says also if is in a cell where there is 
        this.model.position.add(this.direction);
        this.internal_index = this.getIndexByCoord();

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
        super.dispatchEvent({type:'updated'});
    }



    

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

    getIndexByCoord(){
        let z_coordinate = this.model.position.z;
        let x_coordinate = this.model.position.x;
        return z_coordinate * this.grid_size.x + x_coordinate;
    }

    getInteralIndex(){
        return this.internal_index;
    }


 

    check_collision(check_index){
        console.log("sto confrontando",this.internal_index);
        if (check_index == this.internal_index){
            return true;
        }
        else{
            return false;
        }
    }




}