export function getPrintFn(container) {
  const poseElement = document.createElement('pre');
  const pointsElement = document.createElement('pre');
  container.insertBefore(pointsElement, container.children[0]);
  container.insertBefore(poseElement, container.children[0]);

  return (({pose, points}) => {
    if (pose) {
      poseElement.innerHTML = `Position:
  x: ${pose.position[0]}
  y: ${pose.position[1]}
  z: ${pose.position[2]}

Orientation:
  0: ${pose.orientation[0]},
  1: ${pose.orientation[1]},
  2: ${pose.orientation[2]},
  3: ${pose.orientation[3]}`;
    }

    if (points) {
      pointsElement.innerHTML = `Number of points: ${points}`;
    }
  });
}
