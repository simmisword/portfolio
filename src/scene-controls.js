import * as THREE from "three";

import { FlyControls } from "three/examples/jsm/controls/FlyControls";

import * as dat from "dat.gui";

export class SceneControls {
  constructor(width, height) {
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;

    this.camera = new THREE.PerspectiveCamera(50, width / height, 1, 10000);
    this.camera.position.set(30, 30, 100);

    this.controls = new FlyControls(this.camera, this.renderer.domElement);
    this.controls.movementSpeed = 100;
    this.controls.rollSpeed = Math.PI / 4;
    this.controls.autoForward = false;
    this.controls.dragToLook = true;

    this.gui = new dat.GUI();
  }

  initGuiControls(plasticParticles) {
    this.particlesControls = this.gui.addFolder("Plastic Particles");

    this.particlesControls
      .add(plasticParticles, "AMOUNTX")
      .min(0)
      .max(5000)
      .step(10);
  }
}
