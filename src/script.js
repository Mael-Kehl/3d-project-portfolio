import './style.css'
import * as THREE from 'three'
//import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
//import * as dat from 'dat.gui'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import {MTLLoader, OBJLoader} from 'three-obj-mtl-loader'
import gsap from 'gsap'

// Debug
//const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl');
const gltfLoader = new GLTFLoader();
const pointerClick = new THREE.Vector2();
const pointerMove = new THREE.Vector2();

// Scene

let camera, renderer, scene, raycasterClick, raycasterMove;
var sceneMeshes = [];
let video, videoImage, videoImageContext, videoTexture;
let right_screen;

function init(){
    camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
    camera.position.x = 0
    camera.position.y = 4
    camera.position.z = 8

    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
    })
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0xAAAAAA, 1.0);
    //Enable shadows
    renderer.shadowMap.enabled = true;

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

    //Scene skybox (background)

    let skybox = new THREE.CubeTextureLoader().load( [
        'px.jpg', 'nx.jpg',
		'py.jpg', 'ny.jpg',
		'pz.jpg', 'nz.jpg' 
    ]);

    scene.background = skybox;
    
    //Video mapped on right screen

    video = document.createElement('video');
	video.src = "text.mp4"
	video.load();
	video.loop=true;

	videoImage = document.createElement('canvas');
	videoImage.width = 1280;
	videoImage.height = 720;
	
	videoImageContext = videoImage.getContext('2d');
	videoImageContext.fillRect(0,0, videoImage.width, videoImage.height);
	
	videoTexture = new THREE.Texture(videoImage);

    /*
    // Point lumineux
    const light = new THREE.PointLight(0xFFFFFF, 1.8);
    light.position.set(3 , 37, 0);
    */

    
    //Directional light with helper
    /*
    const light = new THREE.DirectionalLight( 0xFFFFFF, 2.0 );
    light.position.set(5,10,0);
    const helper = new THREE.DirectionalLightHelper( light, 10, 0xff0000 );
    scene.add(light);
    scene.add( helper );
    */

    
    let spotLight = new THREE.SpotLight( 0xffffff, 2 );
    spotLight.position.set(5,10,0);
    spotLight.angle = 30 * Math.PI / 180;
	spotLight.exponent = 1.2;
    spotLight.penumbra = 1.0;
    spotLight.target.position.set(0,2,0);

    scene.add(spotLight);
    scene.add(spotLight.target)

    const spotLightHelper = new THREE.SpotLightHelper( spotLight );
    scene.add( spotLightHelper );
    
    right_screen = new THREE.Mesh(
        new THREE.PlaneGeometry(1.4, 0.7),
        new THREE.MeshBasicMaterial({map: videoTexture})
    )
    right_screen.position.set(-0.77, 4.64, -0.63);
    right_screen.rotation.y = 18 * Math.PI/180;
    right_screen.visible = false;
    scene.add(right_screen);
    
    /**
     * We are loading all the models we need part by part
     * Instead of using messy blender's id and names to differenciate them, 
     * We create the userData.id field that is way more simple to use
     * Each element is loaded IN the previous one, that way we can all animate them
     * simultaneously when they're all loaded 
    */
    gltfLoader.load('desk.gltf', (desk) => {
        
        addGLTFToMeshes(desk, 0);

        desk.scene.scale.set(0.1,0.1,0.1)
        desk.scene.position.y += 2;

        console.log(desk.scene.scale);

        scene.add(desk.scene);

        //Loading left screen's gltf model
        gltfLoader.load('screen1mesh.gltf', (leftscreen) => {

            addGLTFToMeshes(leftscreen, 1);

            leftscreen.scene.scale.set(0.1,0.1,0.1)
            leftscreen.scene.position.y += 2;
        
            scene.add(leftscreen.scene);

            //Loading right screen's gltf model
            gltfLoader.load('screen2mesh.gltf', (rightscreen) => {

                addGLTFToMeshes(rightscreen, 2);

                rightscreen.scene.scale.set(0.1,0.1,0.1)
                rightscreen.scene.position.y += 2;

                scene.add(rightscreen.scene)
                sceneMeshes.push(rightscreen.scene)

                //Loading the notebook
                gltfLoader.load('notebook.gltf', (notebook) => {

                    addGLTFToMeshes(notebook, 4);
        
                    notebook.scene.scale.set(0.1,0.1,0.1)
                    notebook.scene.position.y += 2;
                    notebook.scene.rotation.y = -90*Math.PI/180;
                    notebook.scene.position.x += 0.1;
        
                    scene.add(notebook.scene);
                    
                    gltfLoader.load('phone1.gltf', (phone) => {

                        addGLTFToMeshes(phone, 3);
            
                        phone.scene.scale.set(0.1,0.1,0.1)
                        phone.scene.position.y += 3.95;
                        phone.scene.rotation.y = -90*Math.PI/180;
                        phone.scene.rotation.z = 90*Math.PI/180;
                        phone.scene.position.x += 1.2;
            
                        scene.add(phone.scene);

                        gltfLoader.load('poe.gltf', (poe) => {

                            addGLTFToMeshes(poe, 5);
                
                            poe.scene.scale.set(0.4,0.4,0.4)
                            poe.scene.position.y += 3.95;
                            poe.scene.position.x += 2.4;
                            poe.scene.rotation.y -= 45 * Math.PI/180;

                
                            scene.add(poe.scene);
                                
                            //Animating the 6 elements at the same time
                            gsap.to(desk.scene.rotation, {y: 4.8, duration: 1})
                            gsap.to(leftscreen.scene.rotation, {y: 4.8, duration: 1})
                            gsap.to(rightscreen.scene.rotation, {y: 4.8, duration: 1})
                            gsap.to(notebook.scene.rotation, {y: 4.8, duration: 1})
                            gsap.to(phone.scene.rotation, {y: 4.8, duration: 1})
                            gsap.to(poe.scene.rotation, {y: 4.8, duration: 1})
                            

                        }) //Poe end
                    }) //Phone end 
                }) //Notebook end 
            }) //Right screen end 
        }) //Left screen end 
    }) //Desk end 

    let phoneMat = new THREE.MeshPhysicalMaterial({
		roughness: 0.1,
		metalness: 0.5, 
		reflectivity: 1,
		clearcoat: 1,
		clearcoatRoughness: 0,
	})

    /*
    let objLoader = new OBJLoader();    

	objLoader.load("phone1.obj", (phone) => {    
		phone.scale.set(0.1,0.1,0.1);
        
        phone.position.y += 3.95;
        phone.rotation.y = 90*Math.PI/180;
        phone.position.x += 1.2;
        phone.position.z += 0.2;
        

		phone.traverse(function(child){
			if (child instanceof THREE.Mesh){
                child.material = phoneMat;
			}
		})
        addObjToMeshes(phone, 3);

        scene.add(phone);

        gsap.to(phone.rotation, {y: 4.8, duration: 1})

	}); // End Obj Loader phone
    
    let poeobjLoader = new OBJLoader();
    let poemtlLoader = new MTLLoader();

    poemtlLoader.load("poe.mtl", (poeMat) => {
        poeMat.preload();
        poeobjLoader.setMaterials(poeMat);
        poeobjLoader.load("poe.obj", function(poe)
        {    
            poe.position.set(2.6 ,3.95, -0.6);
            poe.scale.set(0.4, 0.4, 0.4);

            addObjToMeshes(poe, 5);
            
            scene.add(poe);

            gsap.to(poe.rotation, {y: 4.8, duration: 1})
        }); //End MTL Loader poe
    }); //End MTL Loader poe

    const fontLoader = new THREE.FontLoader();
    fontLoader.load("inter_medium.json", function (font){
        const geometry = new THREE.TextGeometry("Hi \n I'm Maël, \n an IT Student", {
            font: font, 
            size: 1,
            height: 1 
        })

        const textMesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial(0xffffff))

        textMesh.scale.set(0.1,0.1,0.1);
        textMesh.position.set(-1.4, 4.8, -0.5);
        textMesh.rotation.y = 20 * Math.PI/180;
    
        scene.add(textMesh);
    });
    */
    console.log(sceneMeshes);

}


/**
 * Checks is an element is a mesh, if so we add it to sceneMeshes
 * we assign it a new id given in parameter
 * This id is given in userData, this allows us to control it easily
 * @param {Object that we check} element 
 * @param {Object userData id} id 
 */
function addGLTFToMeshes(element, id){
    element.scene.traverse(function (child) {
        if (child.isMesh) {
            let m = child;
            m.userData.id = id;
            m.receiveShadow = true;
            m.castShadow = true;
            sceneMeshes.push(m);
        }
    })
}

/**
 * Checks is an element is a mesh, if so we add it to sceneMeshes
 * we assign it a new id given in parameter
 * This id is given in userData, this allows us to control it easily
 * @param {Object that we check} element 
 * @param {Object userData id} id 
 */
 function addToMeshes(element, id){
    element.traverse(function (child) {
        if (child.isMesh) {
            let m = child;
            m.userData.id = id;
            m.receiveShadow = true;
            m.castShadow = true;
            sceneMeshes.push(m);
        }
    })
}

/**
 * Everytime that the pointer moves, we check if it's on a object
 * @param {Pointer moving event} event 
 */
function onPointerMove( event ) {

    //Pointer x coordinates
    pointerMove.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    //Pointer y coordinates
    pointerMove.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    
    // Checks if a mesh is hovered by the pointer
    const intersectsMove = raycasterMove.intersectObjects( sceneMeshes );

    /**
     * If an object is hovered, we check its id, stored on the userData
     * if it's an interactive mesh, we move it a little bit to significate that we can click it
     * When if the pointer isn't on the mesh anymore, we reset it's position
     */
    if (intersectsMove.length > 0) {
        
        /** Left screen hover effect */
        if ( intersectsMove[0].object.userData.id == 1 ){
            hoverZtranslate(1, 0.05);
            gsap.to(right_screen.position, {y: 4.69, duration: 0.5})
        } 
        else{
            hoverZtranslate(1, 0.0);
            gsap.to(right_screen.position, {y: 4.64, duration: 0.5})

        }
        /** Right screen hover effect */
        if ( intersectsMove[0].object.userData.id == 2 ) hoverZtranslate(2, 0.05);
        else hoverZtranslate(2, 0.0);
        
        /** Phone hover effect */
        if ( intersectsMove[0].object.userData.id == 3 ) hoverZtranslate(3, 0.4);
        else hoverZtranslate(3, 0.0);

        /** Notebook hover effect */
        if ( intersectsMove[0].object.userData.id == 4 ) hoverZtranslate(4, 0.05);
        else hoverZtranslate(4, 0.0);

        /** Droid hover effect */
        if ( intersectsMove[0].object.userData.id == 5 ) hoverZtranslate(5, 0.05);
        else hoverZtranslate(5, 0.0);

    }
}


/**
 * Translates an object on z axis (vertical)
 * @param {id of the object} id 
 * @param {value to translate} z 
 */
function hoverZtranslate(id, z){
    sceneMeshes.forEach(mesh => {
        if (mesh.userData.id == id) {
            gsap.to(mesh.position, {z:z, duration: 0.5})
        }
    });
}

let zoomedScreenLeft = false;
let zoomedScreenRight = false;
let zoomedDroid = false;

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
                hoverZtranslate(1 , 0.0);
                gsap.to(right_screen.position, {y: 4.64, duration: 0.5})
                right_screen.visible = true;
	            video.play();
                zoomedScreenLeft = true;
            }
            //If we already zoomed in, we zoom out
            else{
                gsap.to(camera.rotation, {x: -0.5, y:0, duration: 1});
                gsap.to(camera.position, {z: 2,y: 5,x:0, duration: 1});
                zoomedScreenLeft = false;
            }
        }
        else if (intersects[0].object.userData.id == 2) {
            if (!zoomedScreenRight) {

                // puting the object back to its initial position
                hoverZtranslate(2 , 0.0);
                gsap.to(camera.position, {z: -0.25,y: 4.63,x:0.65, duration: 1});
                gsap.to(camera.rotation, {x: 0, y:-0.15, duration: 1});
                
                zoomedScreenRight = true;
            }
            //If we already zoomed in, we zoom out
            else {

                gsap.to(camera.rotation, {x: -0.5, y:0, duration: 1});
                gsap.to(camera.position, {z: 2,y: 5,x:0, duration: 1});
                zoomedScreenRight = false;
            }
        }
        else if (intersects[0].object.userData.id == 4){
            download();
        }
        else if (intersects[0].object.userData.id == 5){
            if (!zoomedDroid) {
                hoverZtranslate(5 , 0.0);
                gsap.to(camera.position, {z: 0,y: 4.6,x:2, duration: 1});
                gsap.to(camera.rotation, {y: -0.4, x:0, duration: 1});

                zoomedDroid = true;
            }
            else {
                gsap.to(camera.position, {z: 2,y: 5,x:0, duration: 1});
                gsap.to(camera.rotation, {y: 0, x:-0.5, duration: 1});

                zoomedDroid = false;
            }
        }

        //Debug : console.log(intersects)
    }
}

/**
 * Download myh resume with a confirm alert 
 */
function download() {
    if (confirm ('Download my Resume ?')) {
        location.href = 'resume.pdf';
    }
    return false;
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
            nextbutton.textContent = "Continue"
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
            nextbutton.textContent = "Start"
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


/** Sizes */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

/** 
 * Everytime the window is resized, we adjust 
 */
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
    if( video.readyState === video.HAVE_ENOUGH_DATA)
	{
		videoImageContext.drawImage(video, 0,0);
		if (videoTexture) {
			videoTexture.needsUpdate = true;
		}
	}
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