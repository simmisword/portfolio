import * as THREE from "three";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import { FlyControls } from "three/examples/jsm/controls/FlyControls";

import { Water } from "three/examples/jsm/objects/Water.js";
import { Sky } from "three/examples/jsm/objects/Sky.js";
import { ImprovedNoise } from "three/examples/jsm/math/ImprovedNoise.js";

import { Boat, Trash, PlasticParticles } from "./swimming-parts.js";

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
    this.scene.fog = new THREE.FogExp2(0xffffff, 0.0001);
    this.camera = this.initCamera();
    this.controls = this.initControls();

    this.sun = new THREE.Vector3();
    this.sky = this.initSky();
    this.water = this.initWater();
    this.terrain = this.initTerrain();
    this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.updateSun();

    this.boat;
    this.trashes = [];

    this.initObjects();

    this.plasticParticles = new PlasticParticles();
    this.scene.add(this.plasticParticles.particles);
  }

  initTerrain() {
    const worldWidth = 256,
      worldDepth = 256,
      worldHalfWidth = worldWidth / 2,
      worldHalfDepth = worldDepth / 2;
    const data = this.generateHeight(worldWidth, worldDepth);

    const geometry = new THREE.PlaneGeometry(
      7500,
      7500,
      worldWidth - 1,
      worldDepth - 1
    );
    geometry.rotateX(-Math.PI / 2);

    const vertices = geometry.attributes.position.array;

    for (let i = 0, j = 0, l = vertices.length; i < l; i++, j += 3) {
      vertices[j + 1] = data[i] * 10;
    }

    //

    const texture = new THREE.CanvasTexture(
      this.generateTexture(data, worldWidth, worldDepth)
    );
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;

    const mesh = new THREE.Mesh(
      geometry,
      new THREE.MeshBasicMaterial({ map: texture })
    );
    mesh.position.set(0, -1000, 0);
    mesh.rotation.y = Math.PI / 2;
    this.scene.add(mesh);
    return mesh;
  }

  generateHeight(width, height) {
    const size = width * height,
      data = new Uint8Array(size),
      perlin = new ImprovedNoise(),
      z = Math.random() * 100;

    let quality = 1;

    for (let j = 0; j < 4; j++) {
      for (let i = 0; i < size; i++) {
        const x = i % width,
          y = ~~(i / width);
        data[i] += Math.abs(
          perlin.noise(x / quality, y / quality, z) * quality * 1.75
        );
      }

      quality *= 5;
    }

    return data;
  }

  generateTexture(data, width, height) {
    // bake lighting into texture

    let context, image, imageData, shade;

    const vector3 = new THREE.Vector3(0, 0, 0);

    const sun = new THREE.Vector3(1, 1, 1);
    sun.normalize();

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    context = canvas.getContext("2d");
    context.fillStyle = "#000";
    context.fillRect(0, 0, width, height);

    image = context.getImageData(0, 0, canvas.width, canvas.height);
    imageData = image.data;

    for (let i = 0, j = 0, l = imageData.length; i < l; i += 4, j++) {
      vector3.x = data[j - 2] - data[j + 2];
      vector3.y = 2;
      vector3.z = data[j - width * 2] - data[j + width * 2];
      vector3.normalize();

      shade = vector3.dot(sun);

      imageData[i] = (96 + shade * 128) * (0.5 + data[j] * 0.007);
      imageData[i + 1] = (32 + shade * 96) * (0.5 + data[j] * 0.007);
      imageData[i + 2] = shade * 96 * (0.5 + data[j] * 0.007);
    }

    context.putImageData(image, 0, 0);

    // Scaled 4x

    const canvasScaled = document.createElement("canvas");
    canvasScaled.width = width * 4;
    canvasScaled.height = height * 4;

    context = canvasScaled.getContext("2d");
    context.scale(4, 4);
    context.drawImage(canvas, 0, 0);

    image = context.getImageData(0, 0, canvasScaled.width, canvasScaled.height);
    imageData = image.data;

    for (let i = 0, l = imageData.length; i < l; i += 4) {
      const v = ~~(Math.random() * 5);

      imageData[i] += v;
      imageData[i + 1] += v;
      imageData[i + 2] += v;
    }

    context.putImageData(image, 0, 0);

    return canvasScaled;
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
    water2.position.setY(-0.01);

    // water.material.transparent = true;
    // water.material.opacity = 0.1;
    // water2.material.transparent = true;
    // water2.material.opacity = 0.1;

    console.log(water.material.opacity);

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
      distortionScale: 0.1,
      fog: this.scene.fog !== undefined,
      material: {
        transparent: true,
        opacity: 0.1,
      },
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
    if (this.trashes) {
      this.trashes.forEach((trash) => {
        if (trash.trash) {
          trash.update();
        }
      });
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
            // console.log(
            //   "Distance X:",
            //   Math.abs(this.boat.boat.position.x - trash.trash.position.x)
            // );
            // console.log(
            //   "Distance Y:",
            //   Math.abs(this.boat.boat.position.y - trash.trash.position.y)
            // );
            this.scene.remove(trash.trash);
            this.trashes.filter((item) => {
              return item !== trash;
            });
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
