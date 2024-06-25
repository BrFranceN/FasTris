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
    time_score = 0;
        

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

        //abiliti le ombre sia a riceverle che ad emanarle
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
        //check collision before update
        //says also if is in a cell where there is 
        this.model.position.add(this.direction);
        this.internal_index = this.getIndexByCoord();

        // ANIMAZIONE WALK
        // this.createWalkAnimation();

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
                this.updateTime();
                break
            case 'ArrowDown':
            case 'KeyS':
                this.direction = this.DOWN;
                this.checkEffect();
                this.updateTime();
                break
            case 'ArrowLeft':
            case 'KeyA':
                this.direction = this.LEFT;
                this.checkEffect();
                this.updateTime();
                break
            case 'ArrowRight':
            case 'KeyD':
                this.direction = this.RIGHT;
                this.checkEffect();
                this.updateTime();
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
        this.timer=3;
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


    turnBody(){
        const body = this.findBoneByName("mixamorigHips_01");

        const initialRotation = {
            body: { x: body.rotation.x, y: body.rotation.y, z: body.rotation.z }
        };

        const targetRotation = {
            body: { x: body.rotation.x, y: body.rotation.y += Math.PI*-0.5 , z: body.rotation.z }
       };



        const tweenForward = new TWEEN.Tween(initialRotation)
        .to(targetRotation, 800)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(() => {
            // initial state
            body.rotation.set(initialRotation.body.x, initialRotation.body.y, initialRotation.body.z);
        });

        tweenForward.start();
        



    }


    // provo a ruotare la testa
    turnHead(){

        // const head = this.findBoneByName("mixamorigSpine_02");
        // const head = this.findBoneByName("mixamorigSpine1_03");
        // const head = this.findBoneByName("mixamorigSpine2_04"); //busto
        const leftShoulder  = this.findBoneByName("mixamorigLeftShoulder_07");
        const rightShoulder  = this.findBoneByName("mixamorig:RightShoulder_027");
       
       
        // mixamorigLeftArm_08
        // mixamorigLeftShoulder_07
        // mixamorigLeftForeArm_09

        const initialRotation = {
            leftShoulder: { x: leftShoulder.rotation.x, 
                            y: leftShoulder.rotation.y, 
                            z: leftShoulder.rotation.z }
        };

        const targetRotation = {
            leftShoulder: { x: leftShoulder.rotation.x += Math.PI * 0.5,
                                y: leftShoulder.rotation.y  , 
                                z: leftShoulder.rotation.z }
       };

    
        const tweenForward = new TWEEN.Tween(initialRotation)
        .to(targetRotation, 800)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(() => {
            // initial state
            leftShoulder.rotation.set(
                initialRotation.leftShoulder.x, 
                initialRotation.leftShoulder.y, 
                initialRotation.leftShoulder.z);
        });

        tweenForward.start();
        



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


        //prova
        // const tweenBackward = new TWEEN.Tween()

        const tweenBackward = new TWEEN.Tween(targetRotationRight)
            .to(targetRotationBack, 800)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(() => {
                leftUpLeg.rotation.set(targetRotationRight.leftUpLeg.x, targetRotationRight.leftUpLeg.y, targetRotationRight.leftUpLeg.z);
                rightUpLeg.rotation.set(targetRotationRight.rightUpLeg.x, targetRotationRight.rightUpLeg.y, targetRotationRight.rightUpLeg.z);
            });


        // const tweenBack = new TWEEN.Tween({ rotation: Math.PI / 6 })
        // .to({rotation:0 }, 800)
        // .onUpdate(({ rotation }) => {
        //     if (leftUpLeg) leftUpLeg.rotation.x = rotation;
        //     if (rightUpLeg) rightUpLeg.rotation.x = rotation;
        // });


        const tweenForwardLeft = new TWEEN.Tween({ rotation: 0  })
            .to({ rotation: Math.PI / 6 }, 800)
            .onUpdate(({ rotation }) => {
                if (leftUpLeg) leftUpLeg.rotation.x = -rotation;
                if (rightUpLeg) rightUpLeg.rotation.x = rotation;
            });


        //piede destro in avanti
        const tweenForwardRight = new TWEEN.Tween({ rotation: 0  })
            .to({ rotation: Math.PI / 6 }, 800)
            .onUpdate(({ rotation }) => {
                if (leftUpLeg) leftUpLeg.rotation.x = rotation;
                if (rightUpLeg) rightUpLeg.rotation.x = -rotation;
            });

            // tweenForwardRight.chain(tweenBackward);
            // tweenBackward.chain(tweenForwardLeft);
            // tweenForwardLeft.chain(tweenForwardRight);

            tweenForwardRight.chain(tweenBackward);
            tweenBackward.chain(tweenForwardLeft);
            tweenForwardLeft.chain(tweenForwardRight);
        
            tweenForwardRight.start();
        
            // tweenForwardRight.start();
            // tweenBackward.start();
            // tweenForwardLeft.start();   
            // tweenBackward.start();
            
    }


    setArm(){

        const rightArm = this.findBoneByName("mixamorigRightArm_028");
        const leftArm = this.findBoneByName("mixamorigLeftArm_08");

        const setArm = new TWEEN.Tween({ rotation: 0})
        .to({rotation:Math.PI * 0.2 }, 800)
        .onUpdate(({ rotation }) => {
            if (rightArm) rightArm.rotation.x= rotation;
            if (leftArm) leftArm.rotation.x =  rotation;
        });

        setArm.start();

    }



    animateArms(){
        const rightArm = this.findBoneByName("mixamorigRightArm_028");
        const leftArm = this.findBoneByName("mixamorigLeftArm_08");
        
        const rightShoulder = this.findBoneByName("mixamorigRightShoulder_027");
        const leftShoulder = this.findBoneByName("mixamorigLeftShoulder_07");


        const initialRotation = {
            leftShoulder: { x: leftShoulder.rotation.x, y: leftShoulder.rotation.y, z: leftShoulder.rotation.z },
            rightShoulder: { x: rightShoulder.rotation.x, y: rightShoulder.rotation.y, z: rightShoulder.rotation.z },
        };

        const targetRotationRight = {
            leftShoulder: { x: initialRotation.leftShoulder.x + Math.PI * 0.5 , y: initialRotation.leftShoulder.y, z: initialRotation.leftShoulder.z },
            rightUpLeg: { x: initialRotation.leftShoulder.x - Math.PI * 0.5, y: initialRotation.leftShoulder.y, z: initialRotation.leftShoulder.z },
        };

        const targetRotationBack = {
            leftShoulder: { x: initialRotation.leftShoulder.x - Math.PI * 0.5 , y: initialRotation.leftShoulder.y, z: initialRotation.leftShoulder.z },
            rightUpLeg: { x: initialRotation.leftShoulder.x + Math.PI * 0.5, y: initialRotation.leftShoulder.y, z: initialRotation.leftShoulder.z },
        }



        const tweenForwardRight = new TWEEN.Tween(initialRotation)
            .to(targetRotationRight, 800)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(() => {
                if (rightShoulder) rightShoulder.rotation.x = initialRotation.rightShoulder.x;
                if (leftShoulder) leftShoulder.rotation.x =initialRotation.leftShoulder.x;
            });


        const tweenBackwardRight= new TWEEN.Tween(targetRotationRight)
            .to(targetRotationBack, 800)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(() => {
                if (rightShoulder) rightShoulder.rotation.x = targetRotationRight.rightShoulder.x;
                if (leftShoulder) leftShoulder.rotation.x = targetRotationRight.leftShoulder.x;
            });



 

        // const shoulderForward = new TWEEN.Tween({ rotation: 0})
        //     .to({rotation:Math.PI}, 800)
        //     .onUpdate(({ rotation }) => {
        //         if (rightShoulder) rightShoulder.rotation.x= rotation * 0.3 ;
        //         if (leftShoulder) leftShoulder.rotation.x = rotation;
        //     });

        // const shoulderBack= new TWEEN.Tween({ rotation: Math.PI})
        //     .to({rotation:0}, 800)
        //     .onUpdate(({ rotation }) => {
        //         if (rightShoulder) rightShoulder.rotation.x= rotation;
        //         if (leftShoulder) leftShoulder.rotation.x = rotation;
        //     });


        // shoulderForward.start();
        // shoulderBack.start();
        tweenForwardRight.start();
        tweenBackwardRight.start();

        // shoulderForward.chain(setArm);
        // setArm.start();



    }

    animateArms2() {
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
            .to(targetRotationForward, 800)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(() => {
                leftShoulder.rotation.set(initialRotation.leftShoulder.x, initialRotation.leftShoulder.y, initialRotation.leftShoulder.z);
                rightShoulder.rotation.set(initialRotation.rightShoulder.x, initialRotation.rightShoulder.y, initialRotation.rightShoulder.z);
            });
    
        const tweenBackward = new TWEEN.Tween(targetRotationForward)
            .to(targetRotationBackward, 800)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(() => {
                leftShoulder.rotation.set(targetRotationForward.leftShoulder.x, targetRotationForward.leftShoulder.y, targetRotationForward.leftShoulder.z);
                rightShoulder.rotation.set(targetRotationForward.rightShoulder.x, targetRotationForward.rightShoulder.y, targetRotationForward.rightShoulder.z);
            });
    
        const tweenReturn = new TWEEN.Tween(targetRotationBackward)
            .to(initialRotation, 800)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(() => {
                leftShoulder.rotation.set(targetRotationBackward.leftShoulder.x, targetRotationBackward.leftShoulder.y, targetRotationBackward.leftShoulder.z);
                rightShoulder.rotation.set(targetRotationBackward.rightShoulder.x, targetRotationBackward.rightShoulder.y, targetRotationBackward.rightShoulder.z);
            });
    
        // Chaining the tweens to create a continuous loop
        tweenForward.chain(tweenBackward);
        tweenBackward.chain(tweenReturn);
        tweenReturn.chain(tweenForward);
    
        // Start the animation
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
    }














}