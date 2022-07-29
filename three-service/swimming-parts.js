import { random } from "./utils";
import * as THREE from "three";

export class Trash {
  constructor(_scene) {
    _scene.scale.set(1.5, 1.5, 1.5);
    _scene.position.set(random(-100, 100), -0.5, random(-100, 100));

    this.trash = _scene;
  }

  update() {
    let newX = this.trash.position.x - 0.01 + random(-0.01, 0.01);
    let newY = -0.5 + random(-0.01, 0.01);
    let newZ = this.trash.position.z - 0.01 + random(-0.01, 0.01);
    this.trash.position.set(newX, newY, newZ);
  }
}

export class PlasticParticles {
  constructor() {
    this.SEPARATION = 100;
    this.AMOUNTX = 50;
    this.AMOUNTY = 50;

    this.positions = new Float32Array(this.numParticles * 3);
    this.scales = new Float32Array(this.numParticles);

    let particles,
      count = 0;

    const numParticles = this.AMOUNTX * this.AMOUNTY;
    let i = 0,
      j = 0;
    for (let ix = 0; ix < this.AMOUNTX; ix++) {
      for (let iy = 0; iy < this.AMOUNTY; iy++) {
        this.positions[i] =
          ix * this.SEPARATION - (this.AMOUNTX * this.SEPARATION) / 2; // x
        this.positions[i + 1] = 0; // y
        this.positions[i + 2] =
          iy * this.SEPARATION - (this.AMOUNTY * this.SEPARATION) / 2; // z

        this.scales[j] = 1;

        i += 3;
        j++;
      }
    }

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(this.positions, 3)
    );
    this.geometry.setAttribute(
      "scale",
      new THREE.BufferAttribute(this.scales, 1)
    );

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(0xffffff) },
      },
    });
    this.particles = new THREE.Points(this.geometry, this.material);
  }
}

export class Boat {
  constructor(_scene) {
    _scene.scale.set(3, 3, 3);
    _scene.position.set(5, 12.9, -20);

    this.boat = _scene;
    this.speed = {
      vel: 0,
      rot: 0,
    };
  }

  update() {
    if (this.boat) {
      this.boat.rotation.y += this.speed.rot;
      this.boat.translateX(this.speed.vel);
    }
  }

  stop() {
    this.speed.rot = 0;
    this.speed.vel = 0;
  }
}
