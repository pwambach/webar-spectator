import P2PClient from 'p2p-client';
import {copyFloat32ToInt16} from './array-utils';

let p2pClient = null;
let vrDisplay = null;
const poseData = new Int16Array(7);
let pointCloud = null;
const pointsI16 = new Int16Array(120000);
let frameData = null;

export default function renderAR(vrd) {
  vrDisplay = vrd;
  pointCloud = new VRPointCloud();
  frameData = new VRFrameData();

  document.getElementById('container').innerHTML = 'AR';

  // eslint-disable-next-line no-alert
  const targetId = prompt('Please enter partner ID');

  if (!targetId || targetId.length !== 5) {
    return;
  }

  p2pClient = new P2PClient();

  p2pClient.on('ready', () => {
    p2pClient.connect(targetId);
  });

  p2pClient.on('open', () => {
    p2pClient.send(JSON.stringify({a: 1, b: 2}));
    animate();
  });

  document.getElementById(
    'container'
  ).innerHTML = `AR ${p2pClient.id} -> ${targetId}`;
}

let frames = 0;
function animate() {
  frames++;

  requestAnimationFrame(animate);

  if (frames % 2 === 0) {
    vrDisplay.getFrameData(frameData);

    const {pose} = frameData;
    copyToPoseBuffer(pose);
    p2pClient.send(poseData);
  }

  if (typeof vrDisplay.getPointCloud === 'function' && frames % 15 === 0) {
    vrDisplay.getPointCloud(pointCloud, false, 1, true);
    copyFloat32ToInt16(
      pointCloud.points,
      pointsI16,
      pointCloud.numberOfPoints * 3
    );

    p2pClient.send(pointsI16.slice(0, pointCloud.numberOfPoints * 3));
  }

  console.log(p2pClient.channel.bufferedAmount);
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
