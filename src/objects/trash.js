import { random } from "../utils";

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
