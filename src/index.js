import {
    WebGLRenderer,
    PerspectiveCamera,
    Scene,
    Mesh,
    PlaneBufferGeometry,
    ShadowMaterial,
    DirectionalLight,
    PCFSoftShadowMap,
    sRGBEncoding,
    Color,
    AmbientLight,
    Box3,
    LoadingManager,
    MathUtils,
} from 'three';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import URDFLoader from './URDFLoader.js';

let scene, camera, renderer, robot, controls;

document.getElementById('fileInput').addEventListener('change', handleFileSelect, false);

init();
render();

function init() {

    scene = new Scene();
    scene.background = new Color(0x263238);

    camera = new PerspectiveCamera();
    camera.position.set(10, 10, 10);
    camera.lookAt(0, 0, 0);

    renderer = new WebGLRenderer({ antialias: true });
    const canvasContainer = document.getElementById('renderCanvas');
    renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
    renderer.outputEncoding = sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;
    canvasContainer.appendChild(renderer.domElement);

    createAxes(scene)

    const directionalLight = new DirectionalLight(0xffffff, 1.0);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.setScalar(1024);
    directionalLight.position.set(5, 30, 5);
    scene.add(directionalLight);

    const ambientLight = new AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const ground = new Mesh(new PlaneBufferGeometry(), new ShadowMaterial({ opacity: 0.25 }));
    ground.rotation.x = -Math.PI / 2;
    ground.scale.setScalar(30);
    ground.receiveShadow = true;
    scene.add(ground);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // 开启阻尼效果，使动画更平滑
    controls.dampingFactor = 0.25; // 阻尼系数
    // controls.minDistance = 4;
    // controls.target.y = 1;
    controls.update();

    // onResize();
    // window.addEventListener('resize', onResize);

}

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file) {
    // Load robot
    const manager = new LoadingManager();
    const loader = new URDFLoader(manager);
    loader.load(file, result => {
      robot = result;
    });
  scene.add(robot);
  }
}

function onResize() {

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

}

function render() {

    requestAnimationFrame(render);
    renderer.render(scene, camera);

}

function createAxes(scene) {
  // 创建坐标轴的箭头
  const arrowX = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), 1.5, 0xff0000, 0.4, 0.2); // 增加箭头的长度、宽度和头部长度
  const arrowY = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), 1.5, 0x00ff00, 0.4, 0.2);
  const arrowZ = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), 1.5, 0x0000ff, 0.4, 0.2);

  // 创建坐标系
  const axesHelper = new THREE.Group();
  axesHelper.add(arrowX);
  axesHelper.add(arrowY);
  axesHelper.add(arrowZ);

  // 创建球形标记点
  const sphereGeometry = new THREE.SphereGeometry(0.1, 32, 32);
  const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  axesHelper.add(sphere);

  scene.add(axesHelper);
}
