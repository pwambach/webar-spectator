export default function(navigator) {
  if (!navigator.getVRDisplays) {
    return Promise.resolve(null);
  }

  return navigator
    .getVRDisplays()
    .then(vrDisplays => {
      let vrDisplay = null;

      if (vrDisplays && vrDisplays.length > 0) {
        for (let i = 0; !vrDisplay && i < vrDisplays.length; i++) {
          vrDisplay = vrDisplays[i];
          if (vrDisplay.displayName !== 'Tango VR Device') {
            vrDisplay = null;
          }
        }
      }

      return vrDisplay;
    })
    .catch(error => console.error(error));
}
