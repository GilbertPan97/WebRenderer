import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';

// 创建场景
const scene = new THREE.Scene();

// 创建相机
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// 创建渲染器
const renderer = new THREE.WebGLRenderer();
const canvasContainer = document.getElementById('renderCanvas');
renderer.setSize(canvasContainer.clientWidth, window.clientHeight);
canvasContainer.appendChild(renderer.domElement);

window.addEventListener('resize', onWindowResize);
onWindowResize();

// 创建渐变背景
const gradientTexture = createGradientTexture();
scene.background = gradientTexture;

// 绘制世界坐标系
// const axesHelper = new THREE.AxesHelper(3); // 设置坐标轴长度为3
// scene.add(axesHelper);
createAxes(scene)

// 添加轨道控制器
const controls = new OrbitControls(camera, renderer.domElement);

// 设置控制器属性
controls.enableDamping = true; // 开启阻尼效果，使动画更平滑
controls.dampingFactor = 0.25; // 阻尼系数

// 文件输入变化事件
document.getElementById('fileInput').addEventListener('change', handleFileSelect, false);

// 渲染按钮点击事件
document.getElementById('renderButton').addEventListener('click', function() {
  try {
    render();
  } catch (error) {
    alert('Rendering error: ' + error.message);
  }
});

// 开始渲染循环
animate();

function animate() {
  requestAnimationFrame(animate);
  render();
}

function render() {
  renderer.render(scene, camera);
  console.log("Sence has points? ", scene.hasPoints);
  controls.update(); // 更新控制器，使其响应鼠标操作
}

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(event) {
      const buffer = event.target.result;
      const loader = new PLYLoader();
      const geometry = loader.parse(buffer);

      const material = new THREE.PointsMaterial({ color: 0xffffff, size: 0.05 });
      const points = new THREE.Points(geometry, material);

      // 检测加载后的 points 是否存在点，并将结果打印出来
      const nbrGeoPnts = geometry.attributes.position.length
      const hasPoints = nbrGeoPnts > 0;
      console.log("Points exist in the point cloud:", hasPoints);
      console.log("Number of points in geometry is:", nbrGeoPnts);

      // 获取点的数量并打印到控制台
      const numPoints = points.length;
      console.log("THREE.Points is:\n", points);

      scene.add(points);
      controls.target.copy(points.position); // 将控制器的目标设为点云的位置，使视角初始时对准点云中心
      controls.update(); // 更新控制器

      // 自动调整相机视角以适配加载的点云
      const box = new THREE.Box3().setFromObject(points);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = camera.fov * (Math.PI / 180);
      let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
      cameraZ *= 1.5; // 放大相机视角以留出一些余量
      camera.position.z = cameraZ;
    };
    reader.readAsArrayBuffer(file);
  }
}

// 窗口大小变化时更新渲染器的大小
function onWindowResize() {
  const width = canvasContainer.clientWidth;
  const height = canvasContainer.clientHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

function createGradientTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 256;
  const context = canvas.getContext('2d');

  // 创建渐变
  const gradient = context.createLinearGradient(0, 0, 0, 256);
  gradient.addColorStop(0, '#000000'); // 黑色
  gradient.addColorStop(1, '#0000FF'); // 蓝色

  // 填充渐变
  context.fillStyle = gradient;
  context.fillRect(0, 0, 1, 256);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
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
