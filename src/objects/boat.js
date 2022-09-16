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
