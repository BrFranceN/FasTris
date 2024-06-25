import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

document.addEventListener('DOMContentLoaded', () => {

    const score = localStorage.getItem('score');
    const time_score = localStorage.getItem('moves');
    const winner =  localStorage.getItem('winner');


    const score_element = document.getElementById('score');
    const moves = document.getElementById("n_moves");
    const result = document.getElementById("winner");
    console.log("score",score);
    if (score) {
        score_element.innerText = `Score:${score}`;
    }
    if (time_score) {
        moves.innerText = `time score:${time_score}`;
    }
    if (winner) {
        result.innerText = `winner:${winner}`;
    }


    const restartButton = document.getElementById('restart_button');
    restartButton.addEventListener('click', () => {
        window.location.href = '/index.html'; // Redirect to the game page
    });

});

