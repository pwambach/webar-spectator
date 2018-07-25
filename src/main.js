import getVRDisplay from './get-vr-device';
import renderAR from './render-ar';
import renderNonAR from './render-non-ar';

getVRDisplay(navigator)
  .then(vrDisplay => {
    if (!vrDisplay) {
      renderNonAR();
      return;
    }

    renderAR(vrDisplay);
  })
  .catch((error) => {
    alert('Browser not supported'); // eslint-disable-line no-alert
    console.error(error);
  });
