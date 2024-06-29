import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {EventDispatcher, Vector3} from 'three'; 
import TWEEN from '@tweenjs/tween.js';




export default class MainCharacter extends EventDispatcher {

    //Parameters
    UP = new Vector3(0,0,0.05);
    DOWN = new Vector3(0,0,-0.05);
    RIGHT = new Vector3(-0.05,0,0);
    LEFT = new Vector3(0.05,0,0);
    original_UP = new Vector3(0,0,0.05);
    original_DOWN = new Vector3(0,0,-0.05);
    original_RIGHT = new Vector3(-0.05,0,0);
    original_LEFT = new Vector3(0.05,0,0);
    leftRotation = 0;
    lleg;
    rleg;
    luleg;
    ruleg;
    lshoulder;
    rshoudler;
    // original_UP = new Vector3(0,0,-1);
    // original_DOWN = new Vector3(0,0,1);
    // original_RIGHT = new Vector3(1,0,0);
    // original_LEFT = new Vector3(-1,0,0);


    direction =  this.UP;
    special_objects = [];
    timer = -1;
    special_effect = -1;
    time_score = 0;
        

    constructor(url,grid_size,initial_position) {
        super();
        this.url = url;
        this.model = null;
        this.internal_index = null;
        this.internal_index_floor = null;
        this.internal_index_upper = null;
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
        // 0 floor 1 upper
        this.internal_index_upper = this.getIndexByCoord(0);
        this.internal_index_floor = this.getIndexByCoord(1);
        console.log("sto qua", this.internal_index);
        this.modelLoaded = true;


        this.luleg = this.findBoneByName("mixamorigLeftUpLeg_047");
        this.ruleg = this.findBoneByName("mixamorigRightUpLeg_052");
        this.lleg = this.findBoneByName('mixamorigLeftLeg_048');
        this.rleg = this.findBoneByName('mixamorigRightLeg_053');
        this.lshoulder = this.findBoneByName("mixamorigLeftShoulder_07");
        this.rshoudler = this.findBoneByName("mixamorigRightShoulder_027");


        
        this.model.castShadow = true;
        this.model.receiveShadow = true;
        console.log('Model loaded:', this.model);

        // Traverse and log all node names
        this.model.traverse((node) => {
            console.log(node.name);
        });



        }, undefined, (error) => {
        console.error(error);
        });
    }

    updatePosition(grid_size){
       
        this.model.position.add(this.direction);
        // this.internal_index = this.getIndexByCoord();
        this.internal_index_floor = this.getIndexByCoord(0);
        this.internal_index_upper = this.getIndexByCoord(1);

      

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
        
        let rotation_angle = 0
        let go_back = false;
        switch (keyCode) {
            case 'ArrowUp':
            case 'KeyW':
                this.direction = this.UP;
                this.checkEffect();
                this.updateTime();
                rotation_angle = 0
                break
            case 'ArrowDown':
            case 'KeyS':
                this.direction = this.DOWN;
                this.checkEffect();
                this.updateTime();
                rotation_angle = 0;
                go_back = true;
                break
            case 'ArrowLeft':
            case 'KeyA':
                rotation_angle = Math.PI / 2;
                // this.direction = this.LEFT;
                this.checkEffect();
                this.updateTime();
                this.leftRotation += 1
                break
            case 'ArrowRight':
            case 'KeyD':
                // this.direction = this.RIGHT;
                rotation_angle = -Math.PI / 2;
                this.leftRotation -= 1;
                this.checkEffect();
                this.updateTime();
                break
            default:
                return
            }

            this.model.rotation.y += rotation_angle;

            let current_orientation = Math.abs(this.leftRotation) % 4

            if (this.leftRotation > 0){
                switch(current_orientation) {
                    case 0 : 
                        this.direction = this.UP;
                        break;
                    case 1 : 
                        this.direction = this.LEFT;
                        break;
                    case 2 : 
                        this.direction = this.DOWN;
                        break;
                    case 3 : 
                        this.direction = this.RIGHT;
                        break;
                }
            }else{
                switch(current_orientation) {
                    case 0 : 
                        this.direction = this.UP;
                        break;
                    case 1 : 
                        this.direction = this.RIGHT;
                        break;
                    case 2 : 
                        this.direction = this.DOWN;
                        break;
                    case 3 : 
                        this.direction = this.LEFT;
                        break;
                }
            }
            // }
    }

    getIndexByCoord(type=0){
        if (type == 0){
            let z_coordinate = Math.floor(this.model.position.z);
            let x_coordinate = Math.floor(this.model.position.x);
            console.log("sto qua nella funzione type floor x",x_coordinate);
            console.log("sto qua nella funzione type floor z",z_coordinate);
            return z_coordinate * this.grid_size.x + x_coordinate;
        }else{
            let z_coordinate = Math.ceil(this.model.position.z);
            let x_coordinate = Math.ceil(this.model.position.x);
            console.log("sto qua nella funzione type upper x:",x_coordinate);
            console.log("sto qua nella funzione type upper z:",z_coordinate);
            return z_coordinate * this.grid_size.x + x_coordinate;
        }
    }

    getInteralIndex(type=0){
        if (type == 0){
            return this.internal_index_floor;
        }else{
            return this.internal_index_upper;
        }
    }


    originalControl(){
        this.UP = this.original_UP;
        this.DOWN = this.original_DOWN;
        this.LEFT = this.original_LEFT;
        this.RIGHT = this.original_RIGHT;
    }
    
    
    skipControl(){

        this.UP = new Vector3(0,0,0.20);
        this.DOWN = new Vector3(0,0,-0.20);
        this.RIGHT = new Vector3(-0.20,0,0);
        this.LEFT = new Vector3(0.20,0,0);
        this.timer=3;
    }

    check_collision(check_index){
        // console.log("sto confrontando",this.internal_index);
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

    animateLegs() {

        const leftUpLeg = this.findBoneByName("mixamorigLeftUpLeg_047");
        const rightUpLeg = this.findBoneByName("mixamorigRightUpLeg_052");
        

        const initialRotation = {
            leftUpLeg: { x: leftUpLeg.rotation.x, y: leftUpLeg.rotation.y, z: leftUpLeg.rotation.z },
            rightUpLeg: { x: rightUpLeg.rotation.x, y: rightUpLeg.rotation.y, z: rightUpLeg.rotation.z },
        };

        const targetRotationRight = {
            leftUpLeg: { x: initialRotation.leftUpLeg.x + Math.PI / 6, y: initialRotation.leftUpLeg.y, z: initialRotation.leftUpLeg.z },
            rightUpLeg: { x: initialRotation.rightUpLeg.x - Math.PI / 6, y: initialRotation.rightUpLeg.y, z: initialRotation.rightUpLeg.z },
        };

        const targetRotationBack = {
            leftUpLeg: { x: targetRotationRight.leftUpLeg.x - Math.PI / 6, y: targetRotationRight.leftUpLeg.y, z: targetRotationRight.leftUpLeg.z },
            rightUpLeg: { x: targetRotationRight.rightUpLeg.x + Math.PI / 6, y: targetRotationRight.rightUpLeg.y, z: targetRotationRight.rightUpLeg.z },
        };


        const tweenBackward = new TWEEN.Tween(targetRotationRight)
        .to(targetRotationBack, 400)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(() => {
            leftUpLeg.rotation.set(targetRotationRight.leftUpLeg.x, targetRotationRight.leftUpLeg.y, targetRotationRight.leftUpLeg.z);
            rightUpLeg.rotation.set(targetRotationRight.rightUpLeg.x, targetRotationRight.rightUpLeg.y, targetRotationRight.rightUpLeg.z);
        });



        const tweenForwardLeft = new TWEEN.Tween({ rotation: 0  })
        .to({ rotation: Math.PI / 6 }, 400)
        .onUpdate(({ rotation }) => {
            if (leftUpLeg) leftUpLeg.rotation.x = -rotation;
            if (rightUpLeg) rightUpLeg.rotation.x = rotation;
        });


        //piede destro in avanti
        const tweenForwardRight = new TWEEN.Tween({ rotation: 0  })
        .to({ rotation: Math.PI / 6 }, 400)
        .onUpdate(({ rotation }) => {
            if (leftUpLeg) leftUpLeg.rotation.x = rotation;
            if (rightUpLeg) rightUpLeg.rotation.x = -rotation;
        });

            tweenForwardRight.chain(tweenBackward);
            tweenBackward.chain(tweenForwardLeft);
            tweenForwardLeft.chain(tweenForwardRight);
            tweenForwardRight.start();
   
            
    }


    setArm(){

        const rightArm = this.findBoneByName("mixamorigRightArm_028");
        const leftArm = this.findBoneByName("mixamorigLeftArm_08");

        const setArm = new TWEEN.Tween({ rotation: 0})
        .to({rotation:Math.PI * 0.2 }, 400)
        .onUpdate(({ rotation }) => {
            if (rightArm) rightArm.rotation.x= rotation;
            if (leftArm) leftArm.rotation.x =  rotation;
        });

        setArm.start();

    }




    animateArms() {
        const rightShoulder = this.findBoneByName("mixamorigRightShoulder_027");
        const leftShoulder = this.findBoneByName("mixamorigLeftShoulder_07");
    
        const initialRotation = {
            leftShoulder: { x: leftShoulder.rotation.x, y: leftShoulder.rotation.y, z: leftShoulder.rotation.z },
            rightShoulder: { x: rightShoulder.rotation.x, y: rightShoulder.rotation.y, z: rightShoulder.rotation.z },
        };
    
        const targetRotationForward = {
            leftShoulder: { x: initialRotation.leftShoulder.x + Math.PI * 0.2, y: initialRotation.leftShoulder.y, z: initialRotation.leftShoulder.z },
            rightShoulder: { x: initialRotation.rightShoulder.x - Math.PI * 0.2, y: initialRotation.rightShoulder.y, z: initialRotation.rightShoulder.z },
        };
    
        const targetRotationBackward = {
            leftShoulder: { x: initialRotation.leftShoulder.x - Math.PI * 0.2, y: initialRotation.leftShoulder.y, z: initialRotation.leftShoulder.z },
            rightShoulder: { x: initialRotation.rightShoulder.x + Math.PI * 0.2, y: initialRotation.rightShoulder.y, z: initialRotation.rightShoulder.z },
        };
    
        const tweenForward = new TWEEN.Tween(initialRotation)
            .to(targetRotationForward, 400)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(() => {
                leftShoulder.rotation.set(initialRotation.leftShoulder.x, initialRotation.leftShoulder.y, initialRotation.leftShoulder.z);
                rightShoulder.rotation.set(initialRotation.rightShoulder.x, initialRotation.rightShoulder.y, initialRotation.rightShoulder.z);
            });
    
        const tweenBackward = new TWEEN.Tween(targetRotationForward)
            .to(targetRotationBackward, 400)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(() => {
                leftShoulder.rotation.set(targetRotationForward.leftShoulder.x, targetRotationForward.leftShoulder.y, targetRotationForward.leftShoulder.z);
                rightShoulder.rotation.set(targetRotationForward.rightShoulder.x, targetRotationForward.rightShoulder.y, targetRotationForward.rightShoulder.z);
            });
    
        const tweenReturn = new TWEEN.Tween(targetRotationBackward)
            .to(initialRotation, 400)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(() => {
                leftShoulder.rotation.set(targetRotationBackward.leftShoulder.x, targetRotationBackward.leftShoulder.y, targetRotationBackward.leftShoulder.z);
                rightShoulder.rotation.set(targetRotationBackward.rightShoulder.x, targetRotationBackward.rightShoulder.y, targetRotationBackward.rightShoulder.z);
            });
    
        //creo il lopp
        tweenForward.chain(tweenBackward);
        tweenBackward.chain(tweenReturn);
        tweenReturn.chain(tweenForward);
    
        tweenForward.start();
    }


    goodbye(){
        const rightShoulder = this.findBoneByName("mixamorigRightShoulder_027");
        const leftShoulder = this.findBoneByName("mixamorigLeftShoulder_07");


        const initialRotation = {
            leftShoulder: { x: leftShoulder.rotation.x, y: leftShoulder.rotation.y, z: leftShoulder.rotation.z },
            rightShoulder: { x: rightShoulder.rotation.x, y: rightShoulder.rotation.y, z: rightShoulder.rotation.z },
        };
    
        const targetRotationForward = {
            leftShoulder: { x: initialRotation.leftShoulder.x + Math.PI * 0.2, y: initialRotation.leftShoulder.y, z: initialRotation.leftShoulder.z },
            rightShoulder: { x: initialRotation.rightShoulder.x - Math.PI * 0.4, y: initialRotation.rightShoulder.y, z: initialRotation.rightShoulder.z },
        };

        const tweenForward = new TWEEN.Tween(initialRotation)
        .to(targetRotationForward, 1200)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(() => {
            leftShoulder.rotation.set(initialRotation.leftShoulder.x, initialRotation.leftShoulder.y, initialRotation.leftShoulder.z);
            rightShoulder.rotation.set(initialRotation.rightShoulder.x, initialRotation.rightShoulder.y, initialRotation.rightShoulder.z);
        });

        // const tweenBye = new TWEEN.Tween(targetRotationForward)
        // .to(targetRotationBye, 1200)
        // .easing(TWEEN.Easing.Quadratic.InOut)
        // .onUpdate(() => {
        //     leftShoulder.rotation.set(initialRotation.leftShoulder.x, initialRotation.leftShoulder.y, initialRotation.leftShoulder.z);
        //     rightShoulder.rotation.set(initialRotation.rightShoulder.x, initialRotation.rightShoulder.y, initialRotation.rightShoulder.z);
        // });


        console.log("angle test",initialRotation.rightShoulder.z);
        const tweenBye = new TWEEN.Tween({ rotation: initialRotation.rightShoulder.z})
        .to({rotation: Math.PI * 0.40  }, 1200)
        .onUpdate(({ rotation }) => {
            if (rightShoulder) rightShoulder.rotation.z =  rotation;
        });

        const tweenByeReverse = new TWEEN.Tween({ rotation: Math.PI * 0.40})
        .to({rotation: Math.PI * 0.6  }, 1200)
        .onUpdate(({ rotation }) => {
            if (rightShoulder) rightShoulder.rotation.z =  rotation;
        });


        // tweenBye.start();
        tweenForward.chain(tweenBye);
        tweenBye.chain(tweenByeReverse);
        tweenByeReverse.chain(tweenBye);
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
    getTimeScore(){
        console.log("time score get:",this.time_score);
        return this.time_score;
    }

    setStateEffect(number_effect){
        console.log("sto settando l'effetto", number_effect);
        this.special_effect = number_effect;
        this.timer = 3;
    }


    updateTime(){
        this.time_score +=1;
    }

    reset(){
        this.direction = this.original_UP;
        this.model.position.set(this.initial_position.init_x, this.initial_position.init_y,this.initial_position.init_z);
        this.time_score = 0;
        this.special_effect = -1;
        this.timer = -1;
        this.originalControl();
        this.internal_index = this.getIndexByCoord(); 
        this.internal_index_floor = this.getIndexByCoord(0); 
        this.internal_index_upper = this.getIndexByCoord(1); 
    }














}