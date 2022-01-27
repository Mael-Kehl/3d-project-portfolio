import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import gsap from 'gsap'

// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

//GLTF Loader

const gltfLoader = new GLTFLoader();

//Gsap timeline

let tl = gsap.timeline();

//Desk

const nextbutton = document.getElementById("next");
const backbutton = document.getElementById("back");
const intro = document.querySelector(".intro-container");

gltfLoader.load('desk.gltf', (gltf) => {
    gltf.scene.scale.set(0.1,0.1,0.1)
    gltf.scene.position.y += 2;

    scene.add(gltf.scene);

    tl.to(gltf.scene.rotation, {y: 4.8, duration: 1})
})



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
        case 1: //Zoom sur l'écran de gauche
        {
            gsap.to(camera.position, {z: -0.15,y: 4.63,x:-0.5, duration: 1});
            gsap.to(camera.rotation, {x: 0, y:0.3, duration: 1});
            setTimeout(() => {
                intro.style.display = "block";
                fade();
                setTimeout(()=>{
                    type();
                }, 1000);
            }, 1100);  
            break;
        }  
        case 2: //Zoom sur l'écran de droite
        {
            gsap.to(camera.position, {z: -0.25,y: 4.63,x:0.65, duration: 1});
            gsap.to(camera.rotation, {x: 0, y:-0.15, duration: 1});
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
            gsap.to(camera.rotation, {x: -0.5, y:0, duration: 1});
            gsap.to(camera.position, {z: 2,y: 5,x:0, duration: 1});
            intro.style.display = "none";
            break;
        }
        case 3: //Zoom sur l'écran de droite
        {
            gsap.to(camera.position, {z: -0.15,y: 4.63,x:-0.5, duration: 1});
            gsap.to(camera.rotation, {x: 0, y:0.3, duration: 1});
            break;
        }
    
        default:
            break;
    }
    count--;
    console.log("genial")
})




// Lights

const ambientLight = new THREE.AmbientLight(0xffffff, 1)
ambientLight.position.x = 2
ambientLight.position.y = 3
ambientLight.position.z = 4
scene.add(ambientLight)

const light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
light.position.set(200, 400, 500);
const light2 = new THREE.DirectionalLight(0xFFFFFF, 1.0);
light2.position.set(-500, 250, -200);

scene.add(light)
scene.add(light2)


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

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 0
camera.position.y = 4
camera.position.z = 8
scene.add(camera)

// Controls
// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */

const clock = new THREE.Clock()

const tick = () =>
{

    const elapsedTime = clock.getElapsedTime()

    // Update objects

    // Update Orbital Controls
    // controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()