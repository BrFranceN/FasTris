import {Mesh,MeshNormalMaterial,MeshStandardMaterial,SphereGeometry, TorusGeometry,MeshPhysicalMaterial} from "three";

// const geometry = new SphereGeometry(0.3,10,10);
const radius = 0.4;
const tube = 0.08;
const radialSegments = 16;
const tubularSegments = 16;
const geometry = new TorusGeometry(radius, tube, radialSegments, tubularSegments);

// const material = new MeshStandardMaterial({ color: 0xe0dd12, wireframe:false });


// Crea un materiale fisico con il colore giallo e le proprietà riflettenti
const material = new MeshPhysicalMaterial({
    color: 0xffff00, // Colore giallo
    metalness: 0.5,  // Proprietà metallica
    roughness: 0.1,  // Superficie liscia
    clearcoat: 1.0,  // Strato di vernice trasparente
    clearcoatRoughness: 0.1 // Levigatezza dello strato di vernice
});

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