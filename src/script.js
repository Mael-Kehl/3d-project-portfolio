import './style.css'
import * as THREE from 'three'
//import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
//import * as dat from 'dat.gui'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import gsap from 'gsap'

// Debug
//const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl');
const gltfLoader = new GLTFLoader();
const pointerClick = new THREE.Vector2();
let INTERSECTED;
const pointerMove = new THREE.Vector2();

// Scene

let camera, renderer, scene, raycasterClick, raycasterMove;
var sceneMeshes = [];

function init(){
    camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
    camera.position.x = 0
    camera.position.y = 4
    camera.position.z = 8

    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
    })
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    raycasterClick = new THREE.Raycaster();
    raycasterMove = new THREE.Raycaster();


    document.addEventListener( 'mousedown', onDocumentMouseDown );
    document.addEventListener( 'mousemove', onPointerMove );


    fillScene();
}

function fillScene(){
    //Instanciation de la scene
    scene = new THREE.Scene();

    //Camera 
    scene.add(camera)

    // Point lumineux
    const light = new THREE.PointLight(0xFFFFFF, 1.8);
    light.position.set(3 , 37, 0);
    /*
    const light2 = new THREE.DirectionalLight(0xFFFFFF, 1.0);
    light2.position.set(-500, 250, -200);
    */
    scene.add(light)

    //Chargements des modèles gltf
    gltfLoader.load('deskmesh.gltf', (desk) => {

        /**
         * Vérifie si "child" est un Mesh, si c'est le cas, 
         * on lui attribue un id de 0 dans le userData
         * userData permet de rajouter des champs à notre objets pour le manipuler
         * On lui donne la possibilité d'intéragir avec des ombres
         * on l'ajoute au tableau sceneMeshes regroupant tous les Mesh de la scene
         */
        desk.scene.traverse(function (child) {
            if (child.isMesh) {
                let m = child;
                m.userData.id = 0;
                m.receiveShadow = true;
                m.castShadow = true;
                sceneMeshes.push(m);
            }
        })

        desk.scene.scale.set(0.1,0.1,0.1)
        desk.scene.position.y += 2;

        scene.add(desk.scene);

        //Loading left screen's gltf model
        gltfLoader.load('screen1mesh.gltf', (leftscreen) => {

            leftscreen.scene.traverse(function (child) {
                if (child.isMesh) {
                    let m = child;
                    m.userData.id = 1;
                    m.receiveShadow = true;
                    m.castShadow = true;
                    sceneMeshes.push(m);
                }
            })

            leftscreen.scene.scale.set(0.1,0.1,0.1)
            leftscreen.scene.position.y += 2;
        
            scene.add(leftscreen.scene);
            sceneMeshes.push(leftscreen.scene);
            
            //Loading right screen's gltf model
            gltfLoader.load('screen2mesh.gltf', (rightscreen) => {

                rightscreen.scene.traverse(function (child){
                    if (child.isMesh) {
                        let m = child;
                        m.userData.id = 2;
                        m.receiveShadow = true;
                        m.castShadow = true;
                        sceneMeshes.push(m);
                    }
                });
                rightscreen.scene.scale.set(0.1,0.1,0.1)
                rightscreen.scene.position.y += 2;

                scene.add(rightscreen.scene)
                sceneMeshes.push(rightscreen.scene)
            
                //Animating the 3 elements at the same time
                gsap.to(desk.scene.rotation, {y: 4.8, duration: 1})
                gsap.to(leftscreen.scene.rotation, {y: 4.8, duration: 1})
                gsap.to(rightscreen.scene.rotation, {y: 4.8, duration: 1})
            })
        })
    })
    console.log(sceneMeshes);
}

function onPointerMove( event ) {

    pointerMove.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    pointerMove.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    
    const intersectsMove = raycasterMove.intersectObjects( sceneMeshes );


    if (intersectsMove.length > 0) {

        if (intersectsMove[0].object.userData.id == 1) {
            sceneMeshes.forEach(mesh => {
                if (mesh.userData.id == 1) {
                    gsap.to(mesh.position, {z:0.05, duration: 0.5})
                }
            });
        }
        else{
            sceneMeshes.forEach(mesh => {
                if (mesh.userData.id == 1) {
                    gsap.to(mesh.position, {z:0.0, duration: 0.5})
                }
            });
        }
        if(intersectsMove[0].object.userData.id == 2){
            sceneMeshes.forEach(mesh => {
                if (mesh.userData.id == 2) {
                    gsap.to(mesh.position, {z:0.05, duration: 0.5})
                }
            });
        }
        else{
            sceneMeshes.forEach(mesh => {
                if (mesh.userData.id == 2) {
                    gsap.to(mesh.position, {z:0.0, duration: 0.5})
                }
            });
        }

    }


}
let zoomedScreenLeft = false;
let zoomedScreenRight = false;

function onDocumentMouseDown( event ) {
    pointerClick.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    pointerClick.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    // Debug : console.log(pointer.x, pointer.y)

    raycasterClick.setFromCamera(pointerClick, camera);

    const intersects = raycasterClick.intersectObjects( sceneMeshes );

    //.set(1.02, 1.02, 1.02);

    if (intersects.length > 0) {
        if (intersects[0].object.userData.id == 0) {
            console.log("Bureau")
        }
        //If we clicked on the left screen
        else if (intersects[0].object.userData.id == 1) {
            
            //If it isn't zoomed, then we zoom in
            if (!zoomedScreenLeft) {
                gsap.to(camera.position, {z: -0.15,y: 4.63,x:-0.5, duration: 1});
                gsap.to(camera.rotation, {x: 0, y:0.3, duration: 1});
                zoomedScreenLeft = true;
            }
            //If we already zoomed in, we zoom out
            else{
                gsap.to(camera.rotation, {x: -0.5, y:0, duration: 1});
                gsap.to(camera.position, {z: 2,y: 5,x:0, duration: 1});
                zoomedScreenLeft = false;
            }
            console.log("gauche")
        }
        else if (intersects[0].object.userData.id == 2) {
            console.log("droite")
            if (!zoomedScreenRight) {
                gsap.to(camera.position, {z: -0.25,y: 4.63,x:0.65, duration: 1});
                gsap.to(camera.rotation, {x: 0, y:-0.15, duration: 1});
                zoomedScreenRight = true;
            }
            //If we already zoomed in, we zoom out
            else{
                gsap.to(camera.rotation, {x: -0.5, y:0, duration: 1});
                gsap.to(camera.position, {z: 2,y: 5,x:0, duration: 1});
                zoomedScreenRight = false;
            }
        }

        //Debug : console.log(intersects)
    }
}

const nextbutton = document.getElementById("next");
const backbutton = document.getElementById("back");
const intro = document.querySelector(".intro-container");

let count = 0

nextbutton.addEventListener('click', (e) => {

    switch (count) {
        case 0: //On s'approche du bureau
        {
            gsap.to(camera.position, {z: 2,y: 5, duration: 1});
            gsap.to(camera.rotation, {x: -0.5, duration: 1});
            backbutton.style.display = "block";
            nextbutton.innerHTML = "Continue"
            break;
        }  
        case 1:
        {
            break;
        }  
        case 2: //Zoom sur l'écran de droite
        {
            break;
        }  
            
    
        default:
            break;
    }
    count++;
})

backbutton.addEventListener('click', (e) => {
    switch (count) {
        case 1: //On s'approche du bureau
        {
            gsap.to(camera.rotation, {x: 0, duration: 1});
            gsap.to(camera.position, {z: 8,y: 4, duration: 1});
            backbutton.style.display = "none";
            nextbutton.innerHTML = "Start"
            break;
        }
            
        case 2: //Zoom sur l'écran de gauche
        {
            break;
        }
        case 3: //Zoom sur l'écran de droite
        {
            break;
        }
    
        default:
            break;
    }
    count--;
})


/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})


const clock = new THREE.Clock()

//Animating the scene
const animate = () =>
{
    render();
    window.requestAnimationFrame(animate)
}

//render of the scene
function render(){

    raycasterMove.setFromCamera( pointerMove, camera );
    var intersects = raycasterClick.intersectObjects(scene.children, true); 

    renderer.render(scene, camera);
}


init();
animate()