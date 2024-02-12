let simplex = `
//	Simplex 4D Noise 
//	by Ian McEwan, Ashima Arts
//
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
float permute(float x){return floor(mod(((x*34.0)+1.0)*x, 289.0));}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
float taylorInvSqrt(float r){return 1.79284291400159 - 0.85373472095314 * r;}

vec4 grad4(float j, vec4 ip){
  const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);
  vec4 p,s;

  p.xyz = floor( fract (vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;
  p.w = 1.5 - dot(abs(p.xyz), ones.xyz);
  s = vec4(lessThan(p, vec4(0.0)));
  p.xyz = p.xyz + (s.xyz*2.0 - 1.0) * s.www; 

  return p;
}

float snoise(vec4 v){
  const vec2  C = vec2( 0.138196601125010504,  // (5 - sqrt(5))/20  G4
                        0.309016994374947451); // (sqrt(5) - 1)/4   F4
// First corner
  vec4 i  = floor(v + dot(v, C.yyyy) );
  vec4 x0 = v -   i + dot(i, C.xxxx);

// Other corners

// Rank sorting originally contributed by Bill Licea-Kane, AMD (formerly ATI)
  vec4 i0;

  vec3 isX = step( x0.yzw, x0.xxx );
  vec3 isYZ = step( x0.zww, x0.yyz );
//  i0.x = dot( isX, vec3( 1.0 ) );
  i0.x = isX.x + isX.y + isX.z;
  i0.yzw = 1.0 - isX;

//  i0.y += dot( isYZ.xy, vec2( 1.0 ) );
  i0.y += isYZ.x + isYZ.y;
  i0.zw += 1.0 - isYZ.xy;

  i0.z += isYZ.z;
  i0.w += 1.0 - isYZ.z;

  // i0 now contains the unique values 0,1,2,3 in each channel
  vec4 i3 = clamp( i0, 0.0, 1.0 );
  vec4 i2 = clamp( i0-1.0, 0.0, 1.0 );
  vec4 i1 = clamp( i0-2.0, 0.0, 1.0 );

  //  x0 = x0 - 0.0 + 0.0 * C 
  vec4 x1 = x0 - i1 + 1.0 * C.xxxx;
  vec4 x2 = x0 - i2 + 2.0 * C.xxxx;
  vec4 x3 = x0 - i3 + 3.0 * C.xxxx;
  vec4 x4 = x0 - 1.0 + 4.0 * C.xxxx;

// Permutations
  i = mod(i, 289.0); 
  float j0 = permute( permute( permute( permute(i.w) + i.z) + i.y) + i.x);
  vec4 j1 = permute( permute( permute( permute (
             i.w + vec4(i1.w, i2.w, i3.w, 1.0 ))
           + i.z + vec4(i1.z, i2.z, i3.z, 1.0 ))
           + i.y + vec4(i1.y, i2.y, i3.y, 1.0 ))
           + i.x + vec4(i1.x, i2.x, i3.x, 1.0 ));
// Gradients
// ( 7*7*6 points uniformly over a cube, mapped onto a 4-octahedron.)
// 7*7*6 = 294, which is close to the ring size 17*17 = 289.

  vec4 ip = vec4(1.0/294.0, 1.0/49.0, 1.0/7.0, 0.0) ;

  vec4 p0 = grad4(j0,   ip);
  vec4 p1 = grad4(j1.x, ip);
  vec4 p2 = grad4(j1.y, ip);
  vec4 p3 = grad4(j1.z, ip);
  vec4 p4 = grad4(j1.w, ip);

// Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  p4 *= taylorInvSqrt(dot(p4,p4));

// Mix contributions from the five corners
  vec3 m0 = max(0.6 - vec3(dot(x0,x0), dot(x1,x1), dot(x2,x2)), 0.0);
  vec2 m1 = max(0.6 - vec2(dot(x3,x3), dot(x4,x4)            ), 0.0);
  m0 = m0 * m0;
  m1 = m1 * m1;
  return 49.0 * ( dot(m0*m0, vec3( dot( p0, x0 ), dot( p1, x1 ), dot( p2, x2 )))
               + dot(m1*m1, vec2( dot( p3, x3 ), dot( p4, x4 ) ) ) ) ;

}
`

import * as THREE from "three";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import {GUI} from "three/addons/libs/lil-gui.module.min.js";
// console.clear();
var mouseX = 85,
mouseY = -342;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

let gui = new GUI();

let scene = new THREE.Scene();
// scene.fog = new THREE.Fog( 0x000000, 10, 15); 

let camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 1, 1000);
camera.position.set(-6 , 1, 20);
let renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


// LIGHT START
// const pointLight = new THREE.PointLight( 0xff0000, 1, 100 );
// pointLight.position.set( 1, 1, 1 );
// scene.add( pointLight );

// const sphereSize = 1;
// const pointLightHelper = new THREE.PointLightHelper( pointLight, sphereSize );
// scene.add( pointLightHelper );

// const spotLight = new THREE.SpotLight( 0xffffff );
// spotLight.position.set( 1, 1, 1 );
// spotLight.map = new THREE.TextureLoader().load( "./textures/sprites/ball.png" );

// spotLight.castShadow = true;

// spotLight.shadow.mapSize.width = 1024;
// spotLight.shadow.mapSize.height = 1024;

// spotLight.shadow.camera.near = 500;
// spotLight.shadow.camera.far = 4000;
// spotLight.shadow.camera.fov = 30;

// scene.add( spotLight );

// const light = new THREE.AmbientLight( 0x404040 ); // soft white light
// scene.add( light );
         // lights
         const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
         scene.add(ambientLight)
         const light = new THREE.PointLight()
         scene.add(light)
         const helper = new THREE.PointLightHelper(light)
         scene.add(helper)
         // for shadow
         light.castShadow = true
         light.shadow.mapSize.width = 1024
         light.shadow.mapSize.height = 1024
         light.shadow.camera.near = 0.5
         light.shadow.camera.far = 100
         light.position.x = 3;
         light.intensity = 10
         scene.add(light)
         // light controls
         const lightColor = {
            color: light.color.getHex()
          }
         const lightFolder = gui.addFolder('Light')
         lightFolder.addColor(lightColor, 'color').onChange(() => {
          light.color.set(lightColor.color)
         })
         lightFolder.add(light, 'intensity', 0, 1, 0.01)
         lightFolder.open()
         const pointLightFolder = gui.addFolder('THREE.PointLight')
         pointLightFolder.add(light, 'distance', 0, 100, 0.01)
         pointLightFolder.add(light, 'decay', 0, 4, 0.1)
         pointLightFolder.add(light.position, 'x', -50, 50, 0.01)
         pointLightFolder.add(light.position, 'y', -50, 50, 0.01)
         pointLightFolder.add(light.position, 'z', -50, 50, 0.01)
         pointLightFolder.open()
         // plane
         const planeGeometry = new THREE.PlaneGeometry(100, 20)
         const plane = new THREE.Mesh(planeGeometry, new THREE.MeshPhongMaterial({ color: 0xffffff }))
         plane.rotateX(-Math.PI / 2)
         plane.position.y = -2.5
         plane.receiveShadow = true
         scene.add(plane)
         // torus
         const geometry = new THREE.TorusGeometry(1.5, 0.5, 20, 50)
         const material2 = new THREE.MeshStandardMaterial({
            color: 0x87ceeb
         })
        //  const materialFolder = gui.addFolder('Material')
        //  materialFolder.add(material, 'wireframe')
        //  materialFolder.open()
         const torus = new THREE.Mesh(geometry, material2)
         torus.castShadow = true
         torus.receiveShadow = true
         scene.add(torus)


document.body.appendChild(renderer.domElement);

document.addEventListener('mousemove', onDocumentMouseMove, false);
document.addEventListener('mousedown', (event => {
  console.log(camera.position)
}), false);

document.addEventListener('touchstart', onDocumentTouchStart, false);
document.addEventListener('touchmove', onDocumentTouchMove, false);

//

window.addEventListener('resize', onWindowResize, false);


let controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

let gu = {
  time: {value: 0},
  morph: {value: 0},
  shift: {value: -0.1},
  color1: {
    type: 'c',
    value: new THREE.Color(0x5AD0CF)
  },
  color2: {
    type: 'c',
    value: new THREE.Color(0x153C90)
  },
  color3: {
    type: 'c',
    value: new THREE.Color(0xffffff)
  },
  light: light,
  lightPosition: {
    value : light.position
  }
}

console.log(light)

const planeData = {
  width: 25,
  height: 25,
  wSeg: 100,
  hSeg: 100
}

let g = new THREE.PlaneGeometry(planeData.width, planeData.height, planeData.wSeg, planeData.hSeg)
.rotateY(Math.PI * 0.7)
.rotateX(-Math.PI)
.translate(15 * windowHalfX / 860, 0, 5);
g.index = null;
toSphere(g, 5, 2);

var material = new THREE.ShaderMaterial( {
    // lights: true,
    uniforms: {
      "color1": gu.color1,
      "color2": gu.color2,
      "color3": gu.color3,
      "time": gu.time,
      "shift": gu.shift,
      "morph": gu.morph,
      "light": {
        position: {
          x : 1, y : 1, z : 1
        },
        color: {
          x : 1, y : 1, z : 1
        }
      },
      "lightPosition" : gu.lightPosition
    },
    vertexShader: `
    uniform float time;
    uniform float morph;
    uniform float shift;
    uniform vec3 color1;
    uniform vec3 color2;
    uniform mat4 modelview;
    attribute vec3 altPosition;
    out vec4 fragColor;
  
    varying vec2 vUv;
    varying vec4 pos;
    ${simplex}
  
    #include <common>
    #include <fog_pars_vertex>
    #include <shadowmap_pars_vertex>
  
    void main() {
  
      #include <begin_vertex>
      #include <beginnormal_vertex>     // Defines objectNormal
  
      float t = time * 0.1;
      vec3 pos1 = position;
      vec3 pos2 = altPosition;
      float n1 = snoise(vec4(pos1 * 0.2, t));
      float n2 = snoise(vec4(normalize(pos2 * 0.2), t));
  
      pos1.y += n1 * 0.5;
      pos1.x += n1 * 0.7;
      pos1.z += n1 * 0.7;
      pos2 += normalize(pos2) * n2 * 0.3;
      pos2.y += shift;
  
      float delayValue = length(pos1.xz) / (7.5 * sqrt(2.));
      delayValue = sqrt(1. - (1. - delayValue * delayValue));
      float delayUnit = 1.;
      float factMorph = clamp(morph * (1. + delayUnit)  - (delayValue * delayUnit), 0., 1.);
      transformed = mix(pos1, pos2, factMorph);
  
      vUv = uv;
      gl_PointSize = 4.0;
      pos = projectionMatrix * modelViewMatrix * vec4(position,1.0);
      gl_Position = pos;
  
      #include <project_vertex>
      #include <worldpos_vertex>
      #include <defaultnormal_vertex>   // Defines transformedNormal
      #include <shadowmap_vertex>
      #include <fog_vertex>
    }
  `,
  
  
    fragmentShader: `
      uniform vec3 color1;
      uniform vec3 color2;
      uniform vec3 color3;
      uniform vec3 lightPosition; // Added uniform for light position
      varying vec2 vUv;
      varying vec4 pos;

      float calculateDiffuse(vec3 normal, vec3 lightDirection) {
        return clamp(max(dot(normal, lightDirection), 0.0), 0.0, 1.0);
      }

      float distSquared( vec3 A, vec3 B )
      {
        vec3 C = A - B;
        if(sqrt(dot( C, C )) < 12.0) {
          return sqrt(dot( C, C )) / 50.0;
        } else {
          return 0.0;
        }
      }

      void main() {
          if ( length( gl_PointCoord - vec2( 0.5, 0.5 ) ) > 0.475 ) discard;


          vec3 lightDirection = normalize(lightPosition - pos.xyz);
          float distanceP = distSquared(lightPosition, pos.xyz);

          float diffuseCoefficient = calculateDiffuse(normalize(pos.xyz), lightDirection);
      
          vec3 finalColor = mix(color1, color2, smoothstep(-20.0, 20.0, pos.y));
    
          // Apply lighting to the final color
          finalColor += color3 * distanceP;
    
          gl_FragColor = vec4(finalColor, 1.0);


          //gl_FragColor = vec4(mix(color1, color2, smoothstep(-20.0, 20.0, pos.y)), 1.0);

          //float diffuseCoefficient = 0.4;

         // gl_FragColor.rgb += color3 * diffuseCoefficient;
      }
    `,
});

console.log(material)

let o = new THREE.Points(g, material);
scene.add(o);

gui.add(gu.morph, "value", 0, 10).name("morph");
gui.add(gu.time, "value", 0, 1).name("time");
gui.add(gu.shift, "value", 0, 1).name("shift");

let clock = new THREE.Clock();
let t = 0;


// tween.update()
renderer.setAnimationLoop(() => {
    // camera.lookAt(scene.position);

    // camera.position.x -= (mouseX - camera.position.x) * .00003;
    // camera.position.y -= (mouseY - camera.position.y) * .00003;

    // camera.position.x = Math.max(camera.position.x, -5);
    // camera.position.x = Math.min(camera.position.x, -4);

    // camera.position.y = Math.max(camera.position.y, -0);
    // camera.position.y = Math.min(camera.position.y, 2);

    // g.lookAt(camera.position)

    let td = clock.getDelta();
    t += td;
    gu.time.value = t;
    TWEEN.update()
    controls.update();
    renderer.render(scene, camera);
});

function toSphere(g, radius, start = 0){
  let pos = g.attributes.position;
  let counter = pos.count;
  let pts = [];

  let rad = radius;

  let r = 0;
  let dlong = Math.PI * (3 - Math.sqrt(5));
  let dz = 2 / counter;
  let long = 0;
  let z = 1 - dz / 2;

  let during = Math.round(counter / 3);
  let sIndex = during * start

  for(let i = 0; i < during * (start + 1); i++){
    r = Math.sqrt(1 - z * z);
    pts.push(
        Math.cos(long) * r * rad,
        z * rad,
        -Math.sin(long) * r * rad
    );
    z = z - dz;
    long = long + dlong;
  }
  

  g.setAttribute("altPosition", new THREE.Float32BufferAttribute(pts, 3));
}

function onWindowResize() {
  let delta1 = 15 * windowHalfX / 860;

  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;
  o.geometry.translate(delta2 - delta1, 0, 0)

  let delta2 = 15 * windowHalfX / 860;


  camera.aspect = innerWidth / innerHeight;
  camera.rotation.x = Math.PI / 2
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
}

//

function onDocumentMouseMove(event) {

  mouseX = event.clientX - windowHalfX;
  mouseY = event.clientY - windowHalfY;

}

function onDocumentTouchStart(event) {

  if (event.touches.length === 1) {

      event.preventDefault();

      mouseX = event.touches[0].pageX - windowHalfX;
      mouseY = event.touches[0].pageY - windowHalfY;

      console.log(camera.position)

  }

}

function onDocumentTouchMove(event) {

  if (event.touches.length === 1) {

      event.preventDefault();

      mouseX = event.touches[0].pageX - windowHalfX;
      mouseY = event.touches[0].pageY - windowHalfY;

  }

}



window.addEventListener('keydown', (event) => {
    let value = event.which;
    console.log("-----press-----", value)
    if(value == 65) {
        // gu.morph.value += 0.01
        console.log("Press a")
        new TWEEN.Tween(gu.morph)
        .to({value: 0}, 3000)
        .easing(TWEEN.Easing.generatePow(1.5).Out)
        .start()
    }
    if(value == 83) {
        new TWEEN.Tween(gu.morph)
        .to({value: 1.8}, 3000)
        .easing(TWEEN.Easing.generatePow(1.5).Out)
        .start()
    }
})

