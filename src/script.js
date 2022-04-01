import './style.css'
import * as THREE from 'three'
//import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import gsap from 'gsap'


// Recovering elements from DOM
const canvas = document.querySelector('canvas.webgl');
const startButton = document.getElementById("next");
const backButton = document.getElementById("back");
const hoverGuide = document.getElementById("hover-guide");


// Loaders
const gltfLoader = new GLTFLoader();
const fontLoader = new THREE.FontLoader();

//Creating vectors used with raycaster
const pointerClick = new THREE.Vector2();
const pointerMove = new THREE.Vector2();

//All objects' intial positions, scales and rotations
const initCameraPos  = new THREE.Vector3( 0, 5, 2 ); 
const initCameraRota = new THREE.Vector3( -0.5, 0, 0 );

const gltfBasicPos = new THREE.Vector3(0,2,0);
const plantPos = new THREE.Vector3(-2.2, 3.75,-0.5);
const notebookPos = new THREE.Vector3(0.1, 2, 0);
const phonePos = new THREE.Vector3(1.2, 3.95, 0);
const textResPos = new THREE.Vector3(-2.2, 4.1, 0.1);
const textSWPos = new THREE.Vector3(2.7, 4.7, - 1.4);
const gltfScale = 0.1;

//Ids of elements 
const leftScreenID = 1;
const rightScreenID = 2;
const phoneID = 3;
const notebookID = 4;
const pilotID = 5;
const plantID = 6;

//Leaf animations duration
let leaf1Duration = 5;
let leaf2Duration = 10;
let leaf3Duration = 15;

//Screen textures positions
const screenLeftPos = new THREE.Vector3(-0.77, 4.635, -0.65);
const screenRightPos = new THREE.Vector3(0.775, 4.635, -0.78);
const screenContHovPosY = 4.69;
//Screen PlaneGeometry dimensions
const screenDim = new THREE.Vector2(1.4, 0.75);

//Positions when the camera is zooming 
const camZoomScreenLPos = new THREE.Vector3(-0.5, 4.63, -0.15);
const camZoomScreenLRot = new THREE.Vector3(0, 0.3, 0);
const camZoomScreenRPos = new THREE.Vector3(0.65, 4.63, -0.25);
const camZoomScreenRRot = new THREE.Vector3(0, -0.15, 0);
const camZoomPhonePos = new THREE.Vector3(1.25, 10.12, 0.3);
const phoneZoomPosY = 60;
const camZoomPilotPos = new THREE.Vector3(2.2, 4.4, -0.1);
const camZoomPilotRotY = -0.4;
const leavesRota = 10*Math.PI/180;
const textScale = new THREE.Vector3(0.07, 0.07, 0.02);
const textRotY = 35*Math.PI/180;

//texture loading
const contactTex = new THREE.TextureLoader().load('contact.png'); 
const textMaterial = new THREE.MeshBasicMaterial({color: 0x00A2FF});

//Dimensions of video textures
const videosDimX = 1280, videosDimY = 720;
// Scene
let camera, renderer, scene, raycasterClick, raycasterMove, text_resume, text_SW;
//All meshes in the scene
var sceneMeshes = [];
//All variables needed to load the left screen videoTexture
let video1, video1Image, video1ImageContext, video1Texture;
//All variables needed to load the right screen videoTexture
let video2, video2Image, video2ImageContext, video2Texture;

//element of the scene that (modified in animate())
let left_screen_content, right_screen_content, dirLight, dirLight2;
let factor;

let zoomedScreenLeft = false ,zoomedScreenRight = false, zoomedPilot = false, zoomedPhone = false, plantDancing = false;


function init(){
    camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
    camera.position.set(0,4,8);

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
    factor = 0;
    
    //We call the function onDocumentMouseDown at every click (mousedown) event
    document.addEventListener( 'mousedown', onDocumentMouseDown );
    //We call the function onPointerMove at every movement of the mouse
    document.addEventListener( 'mousemove', onPointerMove );

    fillScene();
}

function fillScene(){
    //Instanciating the scene
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
    
    //Lights
    dirLight = new THREE.DirectionalLight(0xffffff, 2.2);

    //Shadow settings
    dirLight.castShadow = true;
	dirLight.shadow.mapSize.width = 2048;
	dirLight.shadow.mapSize.height = 2048;
	dirLight.shadow.camera.near = 0.5;
	dirLight.shadow.camera.far = 500;
    dirLight.shadow.radius = 8.0;
    dirLight.position.set(5 ,10 ,0);

    scene.add(dirLight);

    dirLight2 = new THREE.DirectionalLight(0xffffff, 0.1);
    dirLight2.position.set(5 ,10 , 5);
    
    scene.add(dirLight2);

    //Video mapped on left screen
    createVideo1Texture();

    left_screen_content = new THREE.Mesh(
        new THREE.PlaneGeometry(screenDim.x, screenDim.y),
        new THREE.MeshBasicMaterial({map: video1Texture})
    )
    left_screen_content.position.set(screenLeftPos.x, screenLeftPos.y, screenLeftPos.z);
    left_screen_content.rotation.y = 18 * Math.PI/180;
    left_screen_content.visible = false;
    scene.add(left_screen_content);

    createVideo2Texture();

    right_screen_content = new THREE.Mesh(
        new THREE.PlaneGeometry(screenDim.x, screenDim.y),
        new THREE.MeshBasicMaterial({map: video2Texture})
    )
    right_screen_content.position.set(screenRightPos.x, screenRightPos.y, screenRightPos.z);
    right_screen_content.rotation.y = -8 * Math.PI/180;
    right_screen_content.visible = false;
    scene.add(right_screen_content);
    
    loadModels();

    console.log(sceneMeshes);

    fontLoader.load("inter_medium.json", function (font){
        const geometry1 = new THREE.TextGeometry("resume download", {
            font: font, 
            size: 1,
            height: 1 
        })
        
        text_resume = new THREE.Mesh(geometry1, textMaterial)
        text_resume.scale.set(textScale.x , textScale.y , textScale.z );
        text_resume.position.set(textResPos.x, textResPos.y, textResPos.z);
        text_resume.rotation.y = textRotY;
    
        scene.add(text_resume);
        text_resume.visible = false;

        const geometry2 = new THREE.TextGeometry("I've been an avid \nStar Wars fan  \nsince I was a kid. \nTherefore, my projects \nwill take you to \nanother dimension. ", {
            font: font, 
            size: 1,
            height: 1 
        })
        text_SW = new THREE.Mesh(geometry2, textMaterial)
        text_SW.scale.set(textScale.x , textScale.y , textScale.z );
        text_SW.position.set( textSWPos.x, textSWPos.y, textSWPos.z );
        text_SW.rotation.y = - textRotY;
    
        scene.add(text_SW);
        text_SW.visible = false;
    });
}

function createVideo1Texture(){
    video1 = document.createElement('video');
	video1.src = "text.mp4"
	video1.load();
	video1.loop=true;

	video1Image = document.createElement('canvas');
	video1Image.width = videosDimX;
	video1Image.height = videosDimY;
	
	video1ImageContext = video1Image.getContext('2d');
	video1ImageContext.fillRect(0,0, video1Image.width, video1Image.height);
	
	video1Texture = new THREE.Texture(video1Image);
}

function createVideo2Texture(){
    video2 = document.createElement('video');
	video2.src = "projects.mp4"
	video2.load();
	video2.loop=true;

	video2Image = document.createElement('canvas');
	video2Image.width = videosDimX;
	video2Image.height = 720;
	
	video2ImageContext = video2Image.getContext('2d');
	video2ImageContext.fillRect(0,0, video2Image.width, video2Image.height);
	
	video2Texture = new THREE.Texture(video2Image);
}

/**
 * We are loading all the models we need part by part
 * Instead of using messy blender's id and names to differenciate them, 
 * We create the userData.id field that is way more simple to use
 * Each element is loaded IN the previous one, that way we can all animate them
 * simultaneously when they're all loaded 
*/
function loadModels(){
        gltfLoader.load('desk.gltf', (desk) => {

        addGLTFToMeshes(desk, 0);
        desk.scene.scale.set(gltfScale, gltfScale, gltfScale);
        desk.scene.position.set(gltfBasicPos.x, gltfBasicPos.y, gltfBasicPos.z);
        scene.add(desk.scene);

        //Loading left screen's gltf model
        gltfLoader.load('screen1mesh.gltf', (leftscreen) => {

            addGLTFToMeshes(leftscreen, 1);
            leftscreen.scene.scale.set(gltfScale,gltfScale,gltfScale);
            leftscreen.scene.position.set(gltfBasicPos.x, gltfBasicPos.y, gltfBasicPos.z);
            scene.add(leftscreen.scene);

            //Loading right screen's gltf model
            gltfLoader.load('screen2mesh.gltf', (rightscreen) => {

                addGLTFToMeshes(rightscreen, 2);
                rightscreen.scene.scale.set(gltfScale,gltfScale,gltfScale);
                rightscreen.scene.position.set(gltfBasicPos.x, gltfBasicPos.y, gltfBasicPos.z);
                scene.add(rightscreen.scene);

                //Loading the notebook
                gltfLoader.load('notebook.gltf', (notebook) => {

                    addGLTFToMeshes(notebook, 4);
                    notebook.scene.scale.set(gltfScale,gltfScale,gltfScale);
                    notebook.scene.position.set(notebookPos.x, notebookPos.y, notebookPos.z);
                    notebook.scene.rotation.y = -90*Math.PI/180;
                    
                    scene.add(notebook.scene);
                    
                    gltfLoader.load('phone.gltf', (phone) => {

                        addGLTFToMeshes(phone, 3);
                        phone.scene.scale.set(gltfScale,gltfScale,gltfScale);
                        phone.scene.position.set(phonePos.x, phonePos.y, phonePos.z);
                        phone.scene.rotation.y = 90*Math.PI/180;
                        scene.add(phone.scene);

                        gltfLoader.load('poedesk.gltf', (poe) => {

                            addGLTFToMeshes(poe, 5);
                            poe.scene.scale.set(gltfScale,gltfScale,gltfScale);
                            poe.scene.position.set(gltfBasicPos.x, gltfBasicPos.y, gltfBasicPos.z);
                            poe.scene.rotation.y = 180 * Math.PI/180;
                            scene.add(poe.scene);
                                
                            gltfLoader.load('plant3.gltf', (plant) => {

                                addGLTFToMeshes(plant, 6);
                                plant.scene.scale.set(gltfScale*2, gltfScale*2, gltfScale*2);
                                plant.scene.position.set(plantPos.x, plantPos.y, plantPos.z);
                                scene.add(plant.scene);

                                //Animating the 6 elements at the same time
                                //Smooth rotation
                                gsap.to(desk.scene.rotation, {y: 4.8, duration: 1})
                                gsap.to(leftscreen.scene.rotation, {y: 4.8, duration: 1})
                                gsap.to(rightscreen.scene.rotation, {y: 4.8, duration: 1})
                                gsap.to(notebook.scene.rotation, {y: 4.8, duration: 1})
                                gsap.to(phone.scene.rotation, {y: 4.8, duration: 1})
                                gsap.to(poe.scene.rotation, {y: 4.8, duration: 1})
                                gsap.to(plant.scene.rotation, {y: 4.8, duration: 1})

                            })
                        }) //Poe end
                    }) //Phone end 
                }) //Notebook end 
            }) //Right screen end 
        }) //Left screen end 
    }) //Desk end 
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
            m.userData.id = id; //Putting id to an element
            if(m.userData.id != 0) m.castShadow = true; //if the mesh isn't the desk, it casts shadows
            else  m.receiveShadow = true; //If it is, it receives shadows
            sceneMeshes.push(m); //We push the mesh to sceneMeshes
        }
    })
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


/**
 * Translates an object on z axis (vertical)
 * @param {id of the object} id 
 * @param {value to translate} z 
 */
 function hoverYtranslate(id, y){
    sceneMeshes.forEach(mesh => {
        if (mesh.userData.id == id) {
            gsap.to(mesh.position, {y:y, duration: 0.5})
        }
    });
}

/**
 * Puts the camera to its initial position
 */
function cameraIntialPosition(){
    gsap.to(camera.rotation, {x: initCameraRota.x , y: initCameraRota.y , duration: 1});
    gsap.to(camera.position, {x: initCameraPos.x , y: initCameraPos.y , z: initCameraPos.z , duration: 1});
}

/**
 * Everytime that the pointer moves, we check if it's on a object
 * If it is, we start its animation
 * @param {Pointer moving event} event 
 */
function onPointerMove( event ) {

    pointerMove.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    pointerMove.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    
    const intersectsMove = raycasterMove.intersectObjects( sceneMeshes ); //Intersections

    /**
     * If an object is hovered, we check its id, stored on the userData
     * if it's an interactive mesh, we move it a little bit to significate that we can click it
     * When if the pointer isn't on the mesh anymore, we reset it's position
     */
    if (intersectsMove.length > 0) {
        
        /** Left screen hover effect */
        if ( intersectsMove[0].object.userData.id == leftScreenID && !zoomedScreenLeft){
            hoverZtranslate(leftScreenID, 0.05);
            gsap.to(left_screen_content.position, {y: screenContHovPosY, duration: 0.5})
        } 
        else if (!zoomedScreenLeft) {
            hoverZtranslate(leftScreenID, 0.0);
            gsap.to(left_screen_content.position, {y: screenLeftPos.y, duration: 0.5})

        }
        /** Right screen hover effect */
        if ( intersectsMove[0].object.userData.id == rightScreenID && !zoomedScreenRight ){
            hoverZtranslate(rightScreenID, 0.05);
            gsap.to(right_screen_content.position, {y: screenContHovPosY, duration: 0.5})
        }
        else if (!zoomedScreenRight){
            hoverZtranslate(rightScreenID, 0.0);
            gsap.to(right_screen_content.position, {y: screenLeftPos.y, duration: 0.5})
        }

         /** Phone hover effect */
         if ( intersectsMove[0].object.userData.id == phoneID && !zoomedPhone) hoverYtranslate(phoneID, 0.25);
         else if (!zoomedPhone) hoverYtranslate(phoneID, 0.0);

        /** Notebook hover effect */
        if ( intersectsMove[0].object.userData.id == notebookID) {
            hoverZtranslate(notebookID, 0.05);
            gsap.to(text_resume, {visible: true, duration: 0.5});
        }
        else{
            hoverZtranslate(notebookID, 0.0);
            gsap.to(text_resume, {visible: false, duration: 0.1});
        }
        //Rebel pilot hover effect
        if ( intersectsMove[0].object.userData.id == pilotID ) hoverZtranslate(pilotID, -0.1);
        else hoverZtranslate(pilotID, 0.0);

        if (intersectsMove[0].object.userData.id == plantID ) hoverYtranslate(plantID, 0.2);
        else hoverYtranslate(plantID, 0.0);
        
    }
}

function onDocumentMouseDown( event ) {
    pointerClick.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    pointerClick.y = - ( event.clientY / window.innerHeight ) * 2 + 1;


    raycasterClick.setFromCamera(pointerClick, camera);
    const intersects = raycasterClick.intersectObjects( sceneMeshes );

    if (intersects.length > 0) {
        hoverGuide.style.display = "none";
        if (intersects[0].object.userData.id == leftScreenID) { //Left screen
            //If it isn't zoomed, then we zoom in
            if (!zoomedScreenLeft) {
                gsap.to(camera.position, {x: camZoomScreenLPos.x, y:camZoomScreenLPos.y, z:camZoomScreenLPos.z, duration: 1});
                gsap.to(camera.rotation, {x: camZoomScreenLRot.x, y:camZoomScreenLRot.y, duration: 1});
                hoverZtranslate(leftScreenID , 0.0);
                gsap.to(left_screen_content.position, {y: screenLeftPos.y, duration: 0.5})
                zoomedScreenLeft = true;
                backButton.style.display = "block";
            }
            //If we already zoomed in, we zoom out
            else{
                cameraIntialPosition();
                zoomedScreenLeft = false;
                backButton.style.display = "none";
            }
        }
        else if (intersects[0].object.userData.id == rightScreenID) { //Right screen
            if (!zoomedScreenRight) {
                // puting the object back to its initial position
                hoverZtranslate(rightScreenID , 0.0);
                gsap.to(right_screen_content.position, {y: screenRightPos.y, duration: 0.5})
                gsap.to(camera.position, {z: camZoomScreenRPos.z ,y: camZoomScreenRPos.y ,x: camZoomScreenRPos.x, duration: 1});
                gsap.to(camera.rotation, {x: camZoomScreenRRot.x, y:camZoomScreenRRot.y, duration: 1});
                backButton.style.display = "block";
                zoomedScreenRight = true;
            }
            //If we already zoomed in, we zoom out
            else {
                cameraIntialPosition();
                zoomedScreenRight = false;
                backButton.style.display = "none";
            }
        }
        else if (intersects[0].object.userData.id == phoneID) { //Phone
            if (!zoomedPhone) {
                hoverYtranslate(phoneID, 0.0)
                sceneMeshes.forEach(mesh => {
                    if (mesh.userData.id == phoneID) {
                        gsap.to(mesh.position, {y: phoneZoomPosY, duration: 1});
                        gsap.to(mesh.rotation, {z: -Math.PI/2, y: Math.PI, duration: 1}); //panim
                        gsap.to(camera.position, {z: camZoomPhonePos.z ,y: camZoomPhonePos.y ,x: camZoomPhonePos.x, duration: 1});
                        gsap.to(camera.rotation, {x: initCameraRota.x , y: initCameraRota.y , duration: 1});
                    }
                    //We replace the phone's screen texture by a png loaded before
                    //We recognize it by it's name, we need to be sure that no other element has that name
                    if (mesh.name === "screen"){
                        let texture = contactTex;                       
                        mesh.material = new THREE.MeshBasicMaterial({map: texture});
                    }
                });
                zoomedPhone = true;
                backButton.style.display = "block";
            }
            else{
                sceneMeshes.forEach(mesh => {
                    if (mesh.userData.id == phoneID) {
                        gsap.to(mesh.rotation, {z: Math.PI, y: -Math.PI, duration: 1});
                        gsap.to(mesh.position, {y: phonePos.y, duration: 1});
                        cameraIntialPosition();
                    }
                });
                zoomedPhone = false;
                backButton.style.display = "none";
            }
        }
        else if (intersects[0].object.userData.id == notebookID){ //Notebook
            download();
        }
        else if (intersects[0].object.userData.id == pilotID){ //Pilot
            if (!zoomedPilot) {
                hoverZtranslate(pilotID , 0.0);
                gsap.to(camera.position, {z: camZoomPilotPos.z ,y: camZoomPilotPos.y ,x: camZoomPilotPos.x , duration: 1});
                gsap.to(camera.rotation, {y: camZoomPilotRotY, x:0, duration: 1});
                gsap.to(text_SW, {visible: true, duration: 0.5});
                zoomedPilot = true;
                backButton.style.display = "block";
            }
            else {
                cameraIntialPosition();
                gsap.to(text_SW, {visible: false, duration: 0.5});
                zoomedPilot = false;
                backButton.style.display = "none";
            }
        }
        else if (intersects[0].object.userData.id == plantID) {
            if (!plantDancing) {
                hoverYtranslate(plantID, 0.0);
                plantDancing = true;
            }
            else {
                hoverYtranslate(plantID, 0.0);
                plantDancing = false;
            }
        }
        //Debug : console.log(intersects)
    }
}

/**
 * Download my resume with a confirm alert 
 */
function download() {
    if (confirm ('Download my Resume ?')) {
        location.href = 'resume.pdf';
    }
    return false;
}

startButton.addEventListener('click', (e) => {
    cameraIntialPosition();
    startButton.style.display = "none";
    hoverGuide.style.display = "block";
    left_screen_content.visible = true;
    right_screen_content.visible = true;
    video1.play();
    video2.play();
})

backButton.addEventListener('click', (e) => {

    if (zoomedPhone) {
        sceneMeshes.forEach(mesh => {
            if (mesh.userData.id == 3) {
                gsap.to(mesh.rotation, {z: Math.PI, y: -Math.PI, duration: 1});
                gsap.to(mesh.position, {y: 0, duration: 1});
                cameraIntialPosition();
            }
        });
        zoomedPhone = false;
    }
    else if (zoomedPilot) {
        cameraIntialPosition();
        gsap.to(text_SW, {visible: false, duration: 0.5});
        zoomedPilot = false;
    }
    else if ( zoomedScreenLeft || zoomedScreenRight){
        cameraIntialPosition();
    }

    backButton.style.display = "none";
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

//Animating the scene
const animate = () =>
{
    // Video texture being updated
    if( video1.readyState === video1.HAVE_ENOUGH_DATA)
	{
		video1ImageContext.drawImage(video1, 0,0);
		if (video1Texture) {
			video1Texture.needsUpdate = true;
		}
	}
    if( video2.readyState === video2.HAVE_ENOUGH_DATA)
	{
		video2ImageContext.drawImage(video2, 0,0);
		if (video2Texture) {
			video2Texture.needsUpdate = true;
		}
	}
    let angle = factor*2*Math.PI/180
    factor += 0.05;
    dirLight.position.set(Math.cos(angle)*8,10, Math.abs(Math.sin(angle)*8) );

    //animate leaves
    sceneMeshes.forEach(mesh  => {
        if (mesh.name.startsWith("Plant001")) {
            if (mesh.rotation.y == 0) gsap.to(mesh.rotation, {y: -leavesRota, duration: plantDancing ? 1 : 5});
            else if (mesh.rotation.y <= -leavesRota) gsap.to(mesh.rotation, {y: 0, duration: plantDancing ? 1 : 5});
        }
        if (mesh.name.startsWith("Plant002")) {
            if (mesh.rotation.y == 0) gsap.to(mesh.rotation, {y: -leavesRota, duration: plantDancing ? 1 : 10});
            else if (mesh.rotation.y <= -leavesRota) gsap.to(mesh.rotation, {y: 0, duration: plantDancing ? 1 : 10});
        }
        if (mesh.name.startsWith("Plant000")) {
            if (mesh.rotation.y == 0) gsap.to(mesh.rotation, {y: leavesRota, duration: plantDancing ? 1 : 10});
            else if (mesh.rotation.y >= leavesRota) gsap.to(mesh.rotation, {y: 0, duration: plantDancing ? 1 : 10});
        }
    });
   
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