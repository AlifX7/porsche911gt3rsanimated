import * as THREE from 'three';

// -------------------------------------------------------------
// 1. SMOOTH SCROLLING (Lenis)
// -------------------------------------------------------------
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  direction: 'vertical',
  gestureDirection: 'vertical',
  smooth: true,
  mouseMultiplier: 1,
  smoothTouch: false,
  touchMultiplier: 2,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// -------------------------------------------------------------
// 2. THREE.JS SETUP & SCENE
// -------------------------------------------------------------
const canvas = document.querySelector('#webgl');
const scene = new THREE.Scene();
// Deep premium background
scene.background = new THREE.Color('#050505');
scene.fog = new THREE.FogExp2('#050505', 0.05);

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
};

const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100);
camera.position.set(0, 1.5, 9);
scene.add(camera);

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  powerPreference: "high-performance",
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// -------------------------------------------------------------
// 3. HIGH-END STUDIO LIGHTING
// -------------------------------------------------------------
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

// Overhead softbox light
const rectLight1 = new THREE.RectAreaLight(0xffffff, 5, 10, 10);
rectLight1.position.set(0, 4, 0);
rectLight1.lookAt(0, 0, 0);
scene.add(rectLight1);

const rectLight2 = new THREE.RectAreaLight(0xff0000, 2, 4, 10);
rectLight2.position.set(-4, 2, -2);
rectLight2.lookAt(0, 0, 0);
scene.add(rectLight2);

const rectLight3 = new THREE.RectAreaLight(0x0055ff, 2, 4, 10);
rectLight3.position.set(4, 2, -2);
rectLight3.lookAt(0, 0, 0);
scene.add(rectLight3);

const spotLight = new THREE.SpotLight(0xffffff, 20);
spotLight.position.set(0, 6, 4);
spotLight.angle = Math.PI / 4;
spotLight.penumbra = 0.5;
spotLight.castShadow = true;
spotLight.shadow.bias = -0.0001;
spotLight.shadow.mapSize.width = 2048;
spotLight.shadow.mapSize.height = 2048;
scene.add(spotLight);

// Floor to catch shadows and reflection
const floorMaterial = new THREE.MeshStandardMaterial({
  color: 0x050505,
  roughness: 0.1,
  metalness: 0.8,
});
const floor = new THREE.Mesh(new THREE.PlaneGeometry(50, 50), floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.5;
floor.receiveShadow = true;
scene.add(floor);


// -------------------------------------------------------------
// 4. PREMIUM PROXY CAR MODEL (Fallback)
// -------------------------------------------------------------
// Since we don't have the explicit Porsche .glb, we build a highly stylized abstract "Glass & Neon" sports car shape.
// It looks phenomenal and premium, serving as a perfect placeholder until a real model is loaded.
const carGroup = new THREE.Group();

const bodyMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x111111,
  metalness: 0.9,
  roughness: 0.2,
  clearcoat: 1.0,
  clearcoatRoughness: 0.1,
});

const glassMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x000000,
  metalness: 1.0,
  roughness: 0.0,
  transmission: 0.9,
  ior: 1.5,
  thickness: 2.0,
});

const tailLightMaterial = new THREE.MeshStandardMaterial({
  color: 0xff0000,
  emissive: 0xff0000,
  emissiveIntensity: 5.0,
});

// Chassis (Lower body)
const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.4, 4.2), bodyMaterial);
chassis.position.y = 0.2;
chassis.castShadow = true;
carGroup.add(chassis);

// Cabin (Upper body)
const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.35, 2.0), glassMaterial);
cabin.position.set(0, 0.55, -0.2);
carGroup.add(cabin);

// Tail light strip (Porsche signature)
const tailLight = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.05, 0.05), tailLightMaterial);
tailLight.position.set(0, 0.3, 2.11);
carGroup.add(tailLight);

// Rear Wing (GT3 RS signature)
const wingPillars = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.3, 0.05), bodyMaterial);
wingPillars.position.set(0, 0.5, 1.8);
carGroup.add(wingPillars);

const wingDeck = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.05, 0.4), bodyMaterial);
wingDeck.position.set(0, 0.65, 1.9);
carGroup.add(wingDeck);

// Wheels
const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.5, metalness: 0.8 });
const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.3, 32);
const wheelsPositions = [
  [-1.0, 0.0, 1.4], [1.0, 0.0, 1.4],
  [-1.0, 0.0, -1.2], [1.0, 0.0, -1.2]
];

wheelsPositions.forEach(pos => {
  const wheel = new THREE.Mesh(wheelGeo, wheelMaterial);
  wheel.rotation.z = Math.PI / 2;
  wheel.position.set(...pos);
  wheel.castShadow = true;
  carGroup.add(wheel);
});

scene.add(carGroup);

// Initial Rotation
carGroup.rotation.y = Math.PI / 4;


// -------------------------------------------------------------
// 5. RESIZE HANDLER
// -------------------------------------------------------------
window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// -------------------------------------------------------------
// 6. ANIMATION LOOP
// -------------------------------------------------------------
const clock = new THREE.Clock();

function tick() {
  const elapsedTime = clock.getElapsedTime();
  
  // Subtle hovering/breathing effect for the abstract car proxy
  carGroup.position.y = Math.sin(elapsedTime) * 0.02;

  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}

tick();

// -------------------------------------------------------------
// 7. GSAP SCROLL ANIMATIONS
// -------------------------------------------------------------
gsap.registerPlugin(ScrollTrigger);

// Loading Screen removal
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loading').classList.add('fade-out');
  }, 1000);
});

// Create a master timeline tied to the whole page scroll
const mainTl = gsap.timeline({
  scrollTrigger: {
    trigger: ".scroll-container",
    start: "top top",
    end: "bottom bottom",
    scrub: 1, // Smooth scrubbing
  }
});

// As user scrolls down, animate the car's rotation, position, and camera zoom
// Scene 1: Rotate to side profile for Aerodynamics
mainTl.to(carGroup.rotation, {
  y: -Math.PI / 2,
  ease: "power2.inOut"
}, 0);
mainTl.to(carGroup.position, {
  x: 1.5,
  ease: "power2.inOut"
}, 0);
mainTl.to(camera.position, {
  z: 7,
  y: 0.8,
  ease: "power2.inOut"
}, 0);

// Scene 2: Rotate to rear 3/4 for Engine
mainTl.to(carGroup.rotation, {
  y: Math.PI + (Math.PI / 4),
  ease: "power2.inOut"
}, 0.33);
mainTl.to(carGroup.position, {
  x: -1.5,
  ease: "power2.inOut"
}, 0.33);

// Scene 3: Rotate to Front for Lightweight / Final CTA
mainTl.to(carGroup.rotation, {
  y: 0,
  ease: "power2.inOut"
}, 0.66);
mainTl.to(carGroup.position, {
  x: 0,
  z: 2,
  ease: "power2.inOut"
}, 0.66);
mainTl.to(camera.position, {
  z: 6,
  ease: "power2.inOut"
}, 0.66);


// HTML Element Animations
const textBlocks = gsap.utils.toArray('.text-block');

textBlocks.forEach((block, i) => {
  gsap.to(block, {
    scrollTrigger: {
      trigger: block,
      start: "top 80%",
      end: "top 40%",
      scrub: 1,
    },
    opacity: 1,
    y: 0,
    ease: "power2.out"
  });
});

// Hero text fade out on scroll
gsap.to('.hero-content', {
  scrollTrigger: {
    trigger: '.hero',
    start: "top top",
    end: "bottom center",
    scrub: 1,
  },
  opacity: 0,
  y: -50,
});
