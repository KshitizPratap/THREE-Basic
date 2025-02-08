import * as THREE from "three";
import { OrbitControls } from "jsm/controls/OrbitControls.js";
import getStarfield from "./src/getStarField.js";
import { getFresnelMat } from "./src/getFresnelMat.js";

const w = window.innerWidth;
const h = window.innerHeight;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);

const fov = 75;
const aspect = w / h;
const near = 0.1;
const far = 1000;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.z = 2;

const scene = new THREE.Scene();

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.03;

const earthGroup = new THREE.Group();
earthGroup.rotation.z = (-23.4 * Math.PI) / 180;

const loader = new THREE.TextureLoader();
const geometry = new THREE.IcosahedronGeometry(1.0, 16);
const material = new THREE.MeshStandardMaterial({
  map: loader.load("./texture/earthMap.jpg"),
});
const earth = new THREE.Mesh(geometry, material);
earthGroup.add(earth);

const nightLightMaterial = new THREE.MeshStandardMaterial({
  map: loader.load("./texture/2k_earth_nightmap.jpg"),
  blending: THREE.AdditiveBlending,
  emissive: new THREE.Color(0xffffff), // Makes the texture glow
  emissiveMap: loader.load("./texture/2k_earth_nightmap.jpg"), // Uses night lights for emission
  emissiveIntensity: 0.25, // Adjust brightness
});
const lightEarthMesh = new THREE.Mesh(geometry, nightLightMaterial);
earthGroup.add(lightEarthMesh);

const couldEarthMaterial = new THREE.MeshStandardMaterial({
  map: loader.load("./texture/2k_earth_clouds.jpg"),
  blending: THREE.AdditiveBlending,
  transparent: true,
  opacity: 0.75,
  shadowSide: 1,
});
const cloudEarthMesh = new THREE.Mesh(geometry, couldEarthMaterial);
cloudEarthMesh.scale.setScalar(1.009);
earthGroup.add(cloudEarthMesh);

scene.add(earthGroup);

const fresnalMat = getFresnelMat();
const fresnalMesh = new THREE.Mesh(geometry, fresnalMat);
fresnalMesh.scale.setScalar(1.01);
earthGroup.add(fresnalMesh);

const stars = getStarfield({ numStars: 2000 });
scene.add(stars);

const sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
sunLight.position.set(-2, 0.5, 1.5);
scene.add(sunLight);

function animate(t = 0) {
  requestAnimationFrame(animate);
  earth.rotation.y = t * 0.0001;
  lightEarthMesh.rotation.y = t * 0.0001;
  cloudEarthMesh.rotation.y = t * 0.00015;
  fresnalMesh.rotation.y = t * 0.0001;
  renderer.render(scene, camera);
  controls.update();
}
animate();
