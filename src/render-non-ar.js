import P2PClient from 'p2p-client';
import * as THREE from 'three';
import createOrbitControls from 'three-orbit-controls';
import {copyInt16ToFloat32} from './array-utils';
import {getPrintFn} from './print-data';

const poseFloat32 = new Float32Array(7);
const container = document.getElementById('container');
const print = getPrintFn(container);
const $title = document.getElementById('title');
let rotateScene = true;

export default function renderNonAR() {
  // Camera
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.001,
    20
  );
  camera.position.z = 5;
  camera.position.y = 2.5;
  const OrbitControls = createOrbitControls(THREE);
  new OrbitControls(camera); // eslint-disable-line no-new

  // Scene
  const scene = new THREE.Scene();

  // Grid
  const geometry = new THREE.PlaneGeometry(5, 5, 5, 5);
  const material = new THREE.MeshBasicMaterial({
    color: 0xcccccc,
    side: THREE.DoubleSide,
    wireframe: true
  });
  const plane = new THREE.Mesh(geometry, material);
  plane.rotation.x = Math.PI / 2;
  plane.position.y = -0.01;
  scene.add(plane);

  // Axis Helper
  const axisHelper = new THREE.AxisHelper(1);
  scene.add(axisHelper);

  // Pose Position and Orientation Indicator
  const coneGeometry = new THREE.ConeGeometry(0.1, 0.15, 4);
  coneGeometry.rotateX(Math.PI / 2);
  coneGeometry.rotateZ(Math.PI / 4);
  const coneMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    wireframe: true
  });
  const poseIndicator = new THREE.Mesh(coneGeometry, coneMaterial);
  scene.add(poseIndicator);

  // Point Cloud
  const pointsMaterial = new THREE.PointsMaterial({
    size: 0.001,
    color: 0x333333
  });
  pointsMaterial.depthWrite = false;
  const bufferAttribute = new THREE.BufferAttribute(
    new Float32Array(120000),
    3
  );
  const bufferGeometry = new THREE.BufferGeometry();
  bufferGeometry.addAttribute('position', bufferAttribute);
  const points = new THREE.Points(bufferGeometry, pointsMaterial);
  points.frustumCulled = false;
  points.renderDepth = 0;
  scene.add(points);

  // Renderer
  const renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0xffffff, 1.0);
  document.body.appendChild(renderer.domElement);

  const onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', onWindowResize);

  const animate = () => {
    if (rotateScene) {
      scene.rotation.y -= 0.001;
    }

    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  };
  animate();

  // p2p
  const p2pClient = new P2PClient(true);
  $title.innerHTML = `Your ID: ${p2pClient.id}`;

  p2pClient.on('open', () => {
    $title.innerHTML = 'Connection established';
    rotateScene = false;
    scene.rotation.y = 0;
    setTimeout(() => {$title.parentNode.style.display = 'none';}, 2000);
  });

  p2pClient.on('data', data => {
    if (data.byteLength === 14) {
      handlePose(data, poseIndicator);
      return;
    }

    // TODO handle responses with byteLength >= 65664
    handlePoints(data, bufferGeometry);
  });
}

function handlePose(data, poseIndicator) {
  copyInt16ToFloat32(new Int16Array(data), poseFloat32, 0, poseFloat32.length);
  poseIndicator.position.set(poseFloat32[0], poseFloat32[1], poseFloat32[2]);
  poseIndicator.quaternion.set(
    poseFloat32[3],
    poseFloat32[4],
    poseFloat32[5],
    poseFloat32[6]
  );
  poseIndicator.updateMatrixWorld();
  print({pose: {
    position: [poseFloat32[0], poseFloat32[1], poseFloat32[2]],
    orientation: [poseFloat32[3], poseFloat32[4], poseFloat32[5], poseFloat32[6]]
  }});
}

function handlePoints(data, bufferGeometry) {
  const source = new Int16Array(data);
  const length = source.length;
  const target = bufferGeometry.attributes.position.array;

  copyInt16ToFloat32(source, target, 0, length);

  // clear any old values
  for (let i = length; i < target.length; i++) {
    target[i] = 0;
  }

  print({points: length / 3});

  bufferGeometry.attributes.position.needsUpdate = true;
}
