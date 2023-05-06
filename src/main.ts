import './style.css';

import * as THREE from 'three'
import  { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { FlakesTexture } from './FlakesTexture';


let renderer: THREE.WebGLRenderer;
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
//@ts-ignore
let controls: OrbitControls;
let pointlight: THREE.PointLight;

function init() {
  scene = new THREE.Scene();

  renderer = new THREE.WebGLRenderer({alpha:true,antialias:true});
  renderer.setSize(window.innerWidth,window.innerHeight);
  document.body.appendChild(renderer.domElement);

  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;

  camera = new THREE.PerspectiveCamera(50,window.innerWidth/window.innerHeight,1,1000);
  camera.position.set(0,0,500);
  controls = new OrbitControls(camera, renderer.domElement);
  
  pointlight = new THREE.PointLight(0xffffff,1);
  pointlight.position.set(200,200,200);
  scene.add(pointlight);

  const envmaploader = new THREE.PMREMGenerator(renderer);

  new RGBELoader().load('/img/room.hdr', function (texture) {
    const envMap = envmaploader.fromEquirectangular(texture).texture;
    scene.background = envMap;
    sphereGenerator({ envMap });
  });

  
  // sphereGenerator()

  // animate with three js loop
  renderer.setAnimationLoop(animate);

  // make it responsive
  window.addEventListener('resize',onWindowResize,false);
}

function animate() {
  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth,window.innerHeight);
}

function sphereGenerator(config?: { envMap: THREE.Texture }){
  const texture = new THREE.CanvasTexture( new FlakesTexture() as any);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set( 10, 6 );

  const ballMatConfig: THREE.MeshPhysicalMaterialParameters = {
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    metalness: 0.9,
    roughness:0.5,
    color: 0x8418CA,
    normalMap: texture,
    normalScale: new THREE.Vector2( .15, .15 ),
    envMap: config?.envMap,

  }

  let ballGeo = new THREE.SphereGeometry(100,64,64);
  let ballMat = new THREE.MeshPhysicalMaterial(ballMatConfig);
  let ballMesh = new THREE.Mesh(ballGeo,ballMat);
  scene.add(ballMesh);
}

init();
