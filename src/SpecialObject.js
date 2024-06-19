import {Mesh,MeshNormalMaterial,SphereGeometry } from "three";

const geometry = new SphereGeometry(0.3,10,10);
const material = new MeshNormalMaterial();

export default class SpecialObject{

    constructor(){
        this.mesh = new Mesh(geometry,material);
    }

}