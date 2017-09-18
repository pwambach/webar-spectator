import P2PClient from 'p2p-client';
import * as THREE from 'three';
import createOrbitControls from 'three-orbit-controls';
import {copyInt16ToFloat32} from './array-utils';

let nextOffset = 0;
const poseFloat32 = new Float32Array(7);

export default function renderNonAR() {
  document.getElementById('container').innerHTML = 'NonAR';

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
  const controls = new OrbitControls(camera);

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
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0xffffff, 1.0);
  document.body.appendChild(renderer.domElement);

  const animate = () => {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  };
  animate();

  // p2p
  const p2pClient = new P2PClient(true);
  console.log('Partner Id: ', p2pClient.id);

  p2pClient.on('data', data => {
    console.log(data.byteLength);
    if (data.byteLength === 14) {
      handlePose(data, poseIndicator);
      return;
    }

    handlePoints(data, bufferGeometry);

    nextOffset = 0;
    if (data.byteLength === 65664) {
      nextOffset = 32832; // byteLength / 2
    }
  });
}

function handlePose(data, poseIndicator) {
  copyInt16ToFloat32(new Int16Array(data), poseFloat32, poseFloat32.length);
  poseIndicator.position.set(poseFloat32[0], poseFloat32[1], poseFloat32[2]);
  poseIndicator.quaternion.set(
    poseFloat32[3],
    poseFloat32[4],
    poseFloat32[5],
    poseFloat32[6]
  );
  poseIndicator.updateMatrixWorld();
}

function handlePoints(data, bufferGeometry) {
  const source = new Int16Array(data);
  const length = source.length;
  const target = bufferGeometry.attributes.position.array;

  copyInt16ToFloat32(source, target, nextOffset, length);

  if (nextOffset === 0) {
    for (let i = length; i < target.length; i++) {
      target[i] = 0;
    }
  }

  bufferGeometry.attributes.position.needsUpdate = true;
}
