import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

document.addEventListener('DOMContentLoaded', () => {

    const score = localStorage.getItem('score');
    const time_score = localStorage.getItem('moves');
    const winner =  localStorage.getItem('winner');
    const initial_choice = localStorage.getItem('initialChoice');


    const msg = document.getElementById('final_message');
    console.log("messaggio",msg);
    const score_element = document.getElementById('score');
    const moves = document.getElementById("n_moves");
    const result = document.getElementById("winner");
    console.log("score",score);
    if (score) {
        score_element.innerText = `Score:${score}`;
    }
    if (time_score) {
        moves.innerText = `Move done:${time_score}`;
    }
    if (winner) {
        console.log("winner",winner);
        console.log("initial_choice",initial_choice);
        if (winner == 'X' && initial_choice == 0){
            msg.innerText = "CONGRATULATIONS YOU WON!";
            console.log("HAI VINTO");
        }
        else if (winner == 'X' && initial_choice == 1){
            msg.innerText = "SORRY, YOU CAN RETRY!";
            console.log("HAI PERSO");
        }
        else if (winner == 'O' && initial_choice == 0){
            msg.innerText = "SORRY, YOU CAN RETRY!";
            console.log("HAI PERSO");
        }
        else if (winner == 'O' && initial_choice == 1){
            msg.innerText = "CONGRATULATIONS YOU WON!";
            console.log("HAI VINTO");
        }
        else if (winner == 'Pair'){
            msg.innerText = "OH A DRAW!";
            console.log("HAI PAREGGIATO");
        }
        result.innerText = `Winner:${winner}`;
    }


    const restartButton = document.getElementById('restart_button');
    restartButton.addEventListener('click', () => {
        window.location.href = '/index.html'; // Redirect to the game page
    });

});

