export function getPrintFn(container) {
  const infoElement = document.createElement('div');
  const poseElement = document.createElement('pre');
  const pointsElement = document.createElement('pre');
  container.appendChild(infoElement);
  container.appendChild(poseElement);
  container.appendChild(pointsElement);

  return (({info, pose, points}) => {
    if (info) {
      infoElement.innerHTML = info;
    }

    if (pose) {
      poseElement.innerHTML = `Pose:
  x: ${pose.position[0]}
  y: ${pose.position[1]}
  z: ${pose.position[2]}
Orientation:
  a: ${pose.orientation[0]},
  a: ${pose.orientation[1]},
  a: ${pose.orientation[2]},
  a: ${pose.orientation[3]}`;
    }

    if (points) {
      pointsElement.innerHTML = `Points:
  ${points}`;
    }
  });
}
