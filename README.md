# WebAR Spectator

  View WebAR pose data (and depth data with Tango) on a second device as a third person spectator. Data is transmitted serverless via a p2p WebRTC connection.

  gif

  [Try it](https://webar-spectator.now.sh) or view video

## Why

  This is a friday-research project done at [ubilabs](https://www.ubilabs.net). The basic idea was to build a tool that gives you a better overview of your virtual AR space and helps to interpret the values coming from the WebAR API. Besides building a tool that helps while developing AR apps, the general goal is to have an easy to integrate module to stream WebAR data to other devices for stuff like recording big amounts of point cloud data or tracking device positions.

## How to use

  1. Open [webar-spectator.now.sh](https://webar-spectator.now.sh) on any modern browser and get a connection ID
  2. Open [webar-spectator.now.sh](https://webar-spectator.now.sh) on a AR ready device with one of these browsers: [ARCore](https://github.com/google-ar/WebARonARCore) / [ARKit](https://github.com/google-ar/WebARonARKit) / [Tango](https://github.com/google-ar/WebARonTango)
  3. Enter connection ID

  > Note: Currently the p2p connection can only be established when both devices are connected within the same Wifi network. In the future this should be also possible across network borders.

## WebRTC
  All data is send directly to the partner device over a p2p WebRTC DataChannel. The main reasons to use WebRTC are low latency and avoiding the additional work of server maintenance.
  The only server involved (eventually also a STUN server depending on your network setup) is a [signaling server](https://github.com/pwambach/p2p-signaling-server) written in node.js which helps to exchange the information required by the [p2p-client](https://github.com/pwambach/p2p-client) module to initiate a connection.

  The reason to write these modules by myself was to learn more about the inner workings of WebRTC and to have a minimum working setup without additional stuff for video or audio channels. There are already many modules out there which do a pretty good job at this like e.g. [peerjs](https://github.com/peers/peerjs).

  More detailed information about p2p and WebRTC in general can be found here:
  [Getting Started with WebRTC](https://www.html5rocks.com/en/tutorials/webrtc/basics/)
  [WebRTC in the real world](https://www.html5rocks.com/en/tutorials/webrtc/infrastructure)

## Thanks to

This project uses [three.js](https://threejs.org/), [webpack](https://github.com/webpack/webpack), [babel](https://github.com/babel/babel) and [now](https://zeit.co/now). So thanks to everyone involved in these awesome projects.
And also thanks to everyone involved in the development of AR/WebAR for giving us awesome stuff to play with :)

