import * as THREE from "three";

export class Particles {
  constructor(width) {
    this.amount = 5000;
    this.group = THREE.Group();
    // const map = new THREE.TextureLoader().load("sprite.png");
    const material = new THREE.SpriteMaterial();

    for (let i = 0; i < worldSize * worldSize; i++) {
      const x = THREE.MathUtils.randFloatSpread(worldSize);
      const y = THREE.MathUtils.randFloatSpread(worldSize) - worldSize / 2;
      const z = THREE.MathUtils.randFloatSpread(worldSize);

      this.planctonVertices.push(x, y, z);
    }

    const sprite = new THREE.Sprite(material);
    scene.add(sprite);
  }
}

export class PlasticParticles {
  constructor() {
    this.SEPARATION = 10;
    this.AMOUNTX = 100;
    this.AMOUNTY = 100;

    this.numParticles = this.AMOUNTX * this.AMOUNTY;

    this.positions = new Float32Array(this.numParticles * 3);
    this.scales = new Float32Array(this.numParticles);

    this.particles;
    this.count = 0;

    let i = 0,
      j = 0;
    for (let ix = 0; ix < this.AMOUNTX; ix++) {
      for (let iy = 0; iy < this.AMOUNTY; iy++) {
        this.positions[i] =
          ix * this.SEPARATION - (this.AMOUNTX * this.SEPARATION) / 2; // x
        this.positions[i + 1] = 1; // y
        this.positions[i + 2] =
          iy * this.SEPARATION - (this.AMOUNTY * this.SEPARATION) / 2; // z

        this.scales[j] = 0.1;

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

    this.material = new THREE.PointsMaterial({ color: 0xffffff });
    this.particles = new THREE.Points(this.geometry, this.material);
  }

  render() {
    const positions = this.particles.geometry.attributes.position.array;
    const scales = this.particles.geometry.attributes.scale.array;

    let i = 0,
      j = 0;

    for (let ix = 0; ix < this.AMOUNTX; ix++) {
      for (let iy = 0; iy < this.AMOUNTY; iy++) {
        positions[i + 1] =
          Math.sin((ix + this.count) * 0.3) * 5 +
          Math.sin((iy + this.count) * 0.5) * 5;

        scales[j] =
          Math.sin((ix + this.count) * 0.3) +
          1 +
          (Math.sin((iy + this.count) * 0.5) + 1);

        i += 3;
        j++;
      }
    }

    this.particles.geometry.attributes.position.needsUpdate = true;
    this.particles.geometry.attributes.scale.needsUpdate = true;

    this.count += 0.1;
  }

  setAmount(count) {
    this.AMOUNTX = count;
    this.AMOUNTY = count;
  }

  setSeperation(seperation) {
    this.SEPARATION = seperation;
  }
}
