import {Mesh,MeshNormalMaterial,SphereGeometry } from "three";

const geometry = new SphereGeometry(0.3,10,10);
const material = new MeshNormalMaterial();

export default class SpecialObject{

    internal_index;
    constructor(internal_index){
        this.mesh = new Mesh(geometry,material);
        this.internal_index = internal_index;
        // this.internal_index = internal_index;
    }

    getCellIndex(){
        return this.internal_index;
    }

}