import { Sky } from "three/examples/jsm/objects/Sky.js";

export class SceneSky {
  constructor() {
    this.sky = new Sky();
    this.sky.scale.setScalar(10000);

    this.skyUniforms = this.sky.material.uniforms;

    this.skyUniforms["turbidity"].value = 10;
    this.skyUniforms["rayleigh"].value = 2;
    this.skyUniforms["mieCoefficient"].value = 0.005;
    this.skyUniforms["mieDirectionalG"].value = 0.8;
  }
}
