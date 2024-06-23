import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {EventDispatcher, Vector3} from 'three'; 
import TWEEN from '@tweenjs/tween.js';



// TODO: FIX CORRECT DIRECTIONS
// const original_UP = new Vector3(0,0,-1);
// const original_DOWN = new Vector3(0,0,1);
// const original_RIGHT = new Vector3(1,0,0);
// const original_LEFT = new Vector3(-1,0,0);


export default class MainCharacter extends EventDispatcher {

    //Parameters
    UP = new Vector3(0,0,-1);
    DOWN = new Vector3(0,0,1);
    RIGHT = new Vector3(1,0,0);
    LEFT = new Vector3(-1,0,0);

    original_UP = new Vector3(0,0,-1);
    original_DOWN = new Vector3(0,0,1);
    original_RIGHT = new Vector3(1,0,0);
    original_LEFT = new Vector3(-1,0,0);
    

    direction =  this.UP;
    special_objects = [];
    timer = -1;
    special_effect = -1;
        

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

        // Traverse and log all node names
        // this.model.traverse((node) => {
        //     console.log(node.name);
        // });



        }, undefined, (error) => {
        console.error(error);
        });
    }

    updatePosition(grid_size){
        //check collision before update
        //says also if is in a cell where there is 
        this.model.position.add(this.direction);
        this.internal_index = this.getIndexByCoord();

        // ANIMAZIONE WALK
        this.createWalkAnimation();

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
                this.direction = this.UP;
                this.checkEffect();
                break
            case 'ArrowDown':
            case 'KeyS':
                this.direction = this.DOWN;
                this.checkEffect();
                break
            case 'ArrowLeft':
            case 'KeyA':
                this.direction = this.LEFT;
                this.checkEffect();
                break
            case 'ArrowRight':
            case 'KeyD':
                this.direction = this.RIGHT;
                this.checkEffect();
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


    originalControl(){
        this.UP = this.original_UP;
        this.DOWN = this.original_DOWN;
        this.LEFT = this.original_LEFT;
        this.RIGHT = this.original_RIGHT;
        console.log("ciao",this.UP);
        console.log("ciao",this.DOWN);
        console.log("ciao",this.LEFT);
        console.log("ciao",this.RIGHT);

    }
    
    
    skipControl(){
        this.UP = new Vector3(0,0,-2);
        this.DOWN = new Vector3(0,0,2);
        this.RIGHT = new Vector3(2,0,0);
        this.LEFT = new Vector3(-2,0,0);
        this.timer=10;
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

    checkEffect(){
        if (this.special_effect!=-1){
            console.log("effetto attivo",this.special_effect);
            console.log("tempo rimanente",this.timer);
            this.timer-=1;
            if (this.timer == 0){
                console.log("tempo scaduto");
                if (this.special_effect == 0){
                    console.log("skip controll disattivato");
                    this.originalControl();
                }
        
                this.special_effect = -1;
            }
        }
    }




    createWalkAnimation() {

        const leftUpLeg = this.findBoneByName("mixamorigLeftUpLeg_047");
        const leftLeg = this.findBoneByName("mixamorigLeftLeg_048");
        const rightUpLeg = this.findBoneByName("mixamorigRightUpLeg_052");
        const rightLeg = this.findBoneByName("mixamorigRightLeg_053");

        const initialRotation = {
            leftUpLeg: { x: leftUpLeg.rotation.x, y: leftUpLeg.rotation.y, z: leftUpLeg.rotation.z },
            rightUpLeg: { x: rightUpLeg.rotation.x, y: rightUpLeg.rotation.y, z: rightUpLeg.rotation.z },
        };

        const targetRotation = {
            leftUpLeg: { x: initialRotation.leftUpLeg.x + Math.PI / 6, y: initialRotation.leftUpLeg.y, z: initialRotation.leftUpLeg.z },
            rightUpLeg: { x: initialRotation.rightUpLeg.x - Math.PI / 6, y: initialRotation.rightUpLeg.y, z: initialRotation.rightUpLeg.z },
        };

        const tweenForward = new TWEEN.Tween(initialRotation)
            .to(targetRotation, 800)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(() => {
                leftUpLeg.rotation.set(initialRotation.leftUpLeg.x, initialRotation.leftUpLeg.y, initialRotation.leftUpLeg.z);
                rightUpLeg.rotation.set(initialRotation.rightUpLeg.x, initialRotation.rightUpLeg.y, initialRotation.rightUpLeg.z);
            });

        const tweenBackward = new TWEEN.Tween(targetRotation)
            .to(initialRotation, 800)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(() => {
                leftUpLeg.rotation.set(targetRotation.leftUpLeg.x, targetRotation.leftUpLeg.y, targetRotation.leftUpLeg.z);
                rightUpLeg.rotation.set(targetRotation.rightUpLeg.x, targetRotation.rightUpLeg.y, targetRotation.rightUpLeg.z);
            });

        tweenForward.chain(tweenBackward);
        tweenBackward.chain(tweenForward);

        tweenForward.start();
    }


    findBoneByName(name) {
        let bone = null;
        this.model.traverse(function (child) {
            if (child.isBone && child.name === name) {
                bone = child;
            }
        });
        return bone;
    }

    resetEffect(number_effect){
        console.log("timer attuale",this.timer);
        console.log("reset",number_effect);

        if(this.timer >=0){
            console.log("timer",this.timer);
            this.timer-=1;
        }
        if (number_effect == 1){
            console.log("original control");
            this.originalControl();
        }
    }


    getTimer(){
        console.log('timer rimanente',this.timer);
        return this.timer;
    }
    getStateEffect(){
        return this.special_effect;
    }

    setStateEffect(number_effect){
        console.log("sto settando l'effetto", number_effect);
        this.special_effect = number_effect;
        this.timer = 10;
    }


    tele














}