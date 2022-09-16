import * as THREE from "three";

import { Water } from "three/examples/jsm/objects/Water.js";

export class Sea {
  constructor(worldSize, fog) {
    this.waterUp = this.getNewWater(worldSize, fog);
    this.waterDown = this.getNewWater(worldSize, fog);

    this.waterUp.rotation.x = -Math.PI / 2;
    this.waterDown.rotation.x = Math.PI / 2;
    this.waterDown.position.setY(-0.01);

    this.planctonVertices = [];

    for (let i = 0; i < worldSize * worldSize; i++) {
      const x = THREE.MathUtils.randFloatSpread(worldSize);
      const y = THREE.MathUtils.randFloatSpread(worldSize) - worldSize / 2;
      const z = THREE.MathUtils.randFloatSpread(worldSize);

      this.planctonVertices.push(x, y, z);
    }

    this.planctonGeometry = new THREE.BufferGeometry();
    this.planctonGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(this.planctonVertices, 3)
    );

    this.plactonMaterial = new THREE.PointsMaterial({ color: 0x888888 });

    this.planctonPoints = new THREE.Points(
      this.planctonGeometry,
      this.plactonMaterial
    );
  }

  getNewWater(worldSize, fog) {
    const waterGeometry = new THREE.PlaneGeometry(worldSize, worldSize);
    return new Water(waterGeometry, {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: new THREE.TextureLoader().load(
        "assets/textures/waternormals.jpeg",
        function (texture) {
          texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        }
      ),
      sunDirection: new THREE.Vector3(),
      sunColor: 0xffffff,
      waterColor: 0x001e0f,
      distortionScale: 0.1,
      fog: fog !== undefined,
      material: {
        transparent: true,
        opacity: 0.1,
      },
    });
  }
}
