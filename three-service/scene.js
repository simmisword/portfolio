import * as THREE from "three";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import { FlyControls } from "three/examples/jsm/controls/FlyControls";

import { Water } from "three/examples/jsm/objects/Water.js";
import { Sky } from "three/examples/jsm/objects/Sky.js";

import { Boat, Trash } from "./swimming-parts.js";

export class WaterScene {
  constructor() {
    this.sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    this.loader = new GLTFLoader();

    this.renderer = this.initRenderer();
    document.body.appendChild(this.renderer.domElement);
    this.scene = new THREE.Scene();
    this.camera = this.initCamera();
    this.controls = this.initControls();

    this.sun = new THREE.Vector3();
    this.sky = this.initSky();
    this.water = this.initWater();
    this.bottom = this.initBottom();
    this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.updateSun();

    this.boat;
    this.trashes = [];

    this.initObjects();
  }

  initBottom() {
    const bottom = this.loader.load("/assets/bottom/scene.gltf", (gltf) => {
      gltf.scene.position.y = -10;
      this.scene.add(gltf.scene);
    });
    return bottom;
  }

  async initObjects() {
    const TRASH_COUNT = 10;

    async function loadModel(selfLoader, url) {
      return new Promise((resolve, reject) => {
        if (selfLoader) {
          selfLoader.load(url, (gltf) => {
            resolve(gltf.scene);
          });
        }
      });
    }

    let boatModel = await loadModel(this.loader, "assets/boat/scene.gltf");

    this.boat = new Boat(boatModel);
    this.scene.add(this.boat.boat);

    let trashModel = await loadModel(
      this.loader,
      "assets/garbage_bag/scene.gltf"
    );

    for (let i = 0; i < TRASH_COUNT; i++) {
      if (trashModel) {
        const trash = new Trash(trashModel.clone());
        this.scene.add(trash.trash);
        this.trashes.push(trash);
      }
    }
  }

  initWater() {
    let water = this.getNewWater();
    let water2 = this.getNewWater();

    water.rotation.x = -Math.PI / 2;
    water2.rotation.x = Math.PI / 2;

    this.scene.add(water);
    this.scene.add(water2);

    // const waterbodyGeometry = new THREE.BoxGeometry(100, 100, 100);
    // const waterbodyMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    // let waterBody = new THREE.Mesh(waterbodyGeometry, waterbodyMaterial);

    // this.scene.add(waterBody);

    return { water, water2 };
  }

  initSky() {
    const sky = new Sky();
    sky.scale.setScalar(10000);
    this.scene.add(sky);

    const skyUniforms = sky.material.uniforms;

    skyUniforms["turbidity"].value = 10;
    skyUniforms["rayleigh"].value = 2;
    skyUniforms["mieCoefficient"].value = 0.005;
    skyUniforms["mieDirectionalG"].value = 0.8;

    return sky;
  }

  getNewWater() {
    const waterGeometry = new THREE.PlaneGeometry(10000, 10000);
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
      distortionScale: 3.7,
      fog: this.scene.fog !== undefined,
    });
  }

  initControls() {
    let controls = new FlyControls(this.camera, this.renderer.domElement);
    controls.movementSpeed = 100;
    controls.rollSpeed = Math.PI / 24;
    controls.autoForward = false;
    controls.dragToLook = true;
    return controls;
  }

  initCamera() {
    let camera = new THREE.PerspectiveCamera(
      50,
      this.sizes.width / this.sizes.height,
      1,
      10000
    );
    camera.position.set(30, 30, 100);
    return camera;
  }

  initRenderer() {
    let renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    return renderer;
  }

  updateSun() {
    const parameters = {
      elevation: 2,
      azimuth: 180,
    };

    const phi = THREE.MathUtils.degToRad(90 - parameters.elevation);
    const theta = THREE.MathUtils.degToRad(parameters.azimuth);

    this.sun.setFromSphericalCoords(1, phi, theta);

    this.sky.material.uniforms["sunPosition"].value.copy(this.sun);
    this.water.water.material.uniforms["sunDirection"].value
      .copy(this.sun)
      .normalize();
    this.water.water2.material.uniforms["sunDirection"].value
      .copy(this.sun)
      .normalize();

    this.scene.environment = this.pmremGenerator.fromScene(this.sky).texture;
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.render();

    if (this.controls) {
      this.controls.update(0.01);
    }
    if (this.boat) {
      this.boat.update();
      this.checkCollisions();
    }
    // stats.update();
  }

  render() {
    const time = performance.now() * 0.001;

    // mesh.position.y = Math.sin( time ) * 20 + 5;
    // mesh.rotation.x = time * 0.5;
    // mesh.rotation.z = time * 0.51;

    this.water.water.material.uniforms["time"].value += 1.0 / 60.0;
    this.water.water2.material.uniforms["time"].value += 1.0 / 60.0;

    this.renderer.render(this.scene, this.camera);
  }

  checkCollisions() {
    if (this.boat.boat) {
      this.trashes.forEach((trash) => {
        if (trash.trash) {
          if (this.isColliding(this.boat.boat, trash.trash)) {
            this.scene.remove(trash.trash);
          }
        }
      });
    }
  }

  isColliding(obj1, obj2) {
    return (
      Math.abs(obj1.position.x - obj2.position.x) < 15 &&
      Math.abs(obj1.position.y - obj2.position.y) < 15
    );
  }

  onWindowResize() {
    this.sizes.width = window.innerWidth;
    this.sizes.height = window.innerHeight;

    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
