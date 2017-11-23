import P2PClient from 'p2p-client';
import {copyFloat32ToInt16} from './array-utils';
import {getPrintFn} from './print-data';

let p2pClient = null;
let vrDisplay = null;
const poseData = new Int16Array(7);
let pointCloud = null;
const pointsI16 = new Int16Array(120000);
let frameData = null;
const container = document.getElementById('container');
const print = getPrintFn(container);
const $title = document.getElementById('title');
const $subtitle = document.getElementById('subtitle');

const SEND_POSE_EVERY_X_FRAME = 1;
const SEND_POINTS_EVERY_X_FRAME = 5;
const SKIP_POINTS = 4; // otherwise it's too much data

export default function renderAR(vrd) {
  vrDisplay = vrd;

  if (window.VRPointCloud) {
    pointCloud = new VRPointCloud();
  }

  if (window.VRFrameData) {
    frameData = new VRFrameData();
  }

  // eslint-disable-next-line no-alert
  const targetId = prompt('Please enter connection ID');

  if (!targetId || targetId.length !== 5) {
    alert('Invalid connection ID'); // eslint-disable-line no-alert
    return;
  }

  p2pClient = new P2PClient();

  p2pClient.on('ready', () => {
    p2pClient.connect(targetId);
  });

  p2pClient.on('open', () => {
    animate();
  });

  $title.innerHTML = 'Connection established';
  $subtitle.innerHTML = `${p2pClient.id} -> ${targetId}`;
}

let frames = 0;
function animate() {
  frames++;

  requestAnimationFrame(animate);

  if (frameData && frames % SEND_POSE_EVERY_X_FRAME === 0) {
    vrDisplay.getFrameData(frameData);
    
    const {pose} = frameData;
    copyToPoseBuffer(pose);
    p2pClient.send(poseData);
    print({pose});
  }

  if (
    typeof vrDisplay.getPointCloud === 'function' &&
    frames % SEND_POINTS_EVERY_X_FRAME === 0
  ) {
    vrDisplay.getPointCloud(pointCloud, false, SKIP_POINTS, true);
    copyFloat32ToInt16(
      pointCloud.points,
      pointsI16,
      pointCloud.numberOfPoints * 3
    );

    p2pClient.send(pointsI16.slice(0, pointCloud.numberOfPoints * 3));
    print({points: pointCloud.numberOfPoints});
  }
}

function copyToPoseBuffer(pose) {
  poseData[0] = pose.position[0] * 1000;
  poseData[1] = pose.position[1] * 1000;
  poseData[2] = pose.position[2] * 1000;

  poseData[3] = pose.orientation[0] * 1000;
  poseData[4] = pose.orientation[1] * 1000;
  poseData[5] = pose.orientation[2] * 1000;
  poseData[6] = pose.orientation[3] * 1000;
}
