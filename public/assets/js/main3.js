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

  let tweenObj = {}
  let animationScripts = []
  let scrollPercent = 0

  let raycaster = new THREE.Raycaster();

  let gui = new GUI();
  let container;

  container = document.getElementById( 'home_wave' );

  let scene = new THREE.Scene();
  // scene.fog = new THREE.Fog( 0x000000, 0.1, 2);
  scene.background = new THREE.Color(0x111111)

  let camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 1, 1000);
  camera.position.set(-6 , 1, 20);

  let renderer = new THREE.WebGLRenderer();
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  container.appendChild( renderer.domElement );

          // lights

          const light = new THREE.PointLight()
          scene.add(light)
          const helper = new THREE.PointLightHelper(light)
          // scene.add(helper)
          // for shadow
          let originPos = {
            x : 3, y : 0, z : 0
          }
          light.castShadow = true
          light.shadow.mapSize.width = 1024
          light.shadow.mapSize.height = 1024
          light.shadow.camera.near = 0.5
          light.shadow.camera.far = 100
          light.position.x = 3;
          //  light.intensity = 5
          light.lookAt(0, 0, 0)
          scene.add(light)
          // light controls

          // plane
          const planeGeometry = new THREE.PlaneGeometry(12, 12)
          const plane = new THREE.Mesh(planeGeometry, new THREE.MeshPhongMaterial({ color: 0x000000 }))
          .translateX(-20)
          plane.rotateZ(-Math.PI / 2)
          plane.rotateX(-Math.PI)
          plane.castShadow = false
          plane.receiveShadow = false
          // scene.add(plane)


          //  sphere.castShadow = true
          //  sphere.receiveShadow = true
          //  scene.add( sphere );

        //add an animation that flashes the cube through 100 percent of scroll
        animationScripts.push(
          {
            start: 0,
            end: 20,
            func: () => {
                plane.position.x = 10;
                plane.position.y = 0;
                plane.position.z = 0;
    
                createjs.Tween.get(gu.morph).to({
                  value: 1.8 - scrollPercent / 100 * 1.8
                }, 1000, createjs.Ease.linear);
              },
          },
          {
            start: 10,
            end: 30,
            func: () => {
                plane.position.x = 0;
                plane.position.y = 20;
                plane.position.z = 0;
    
                createjs.Tween.get(gu.morph).to({
                  value: 1.8 - scrollPercent / 100 * 1.8
                }, 1000, createjs.Ease.linear);
              },
          },
          {
          start: 0,
          end: 30,
          func: () => {
              // plane.position.x = 10;
              // plane.position.y = 0;
              // plane.position.z = 0;

              createjs.Tween.get(gu.morph).to({
                value: 1.8 - scrollPercent / 100 * 1.8
              }, 1000, createjs.Ease.linear);
            },
          },
          {
            start: 31,
            end: 70,
            func: () => {
              plane.position.x = 0;
              plane.position.y = 20;
              plane.position.z = 0;
              createjs.Tween.get(gu.morph).to({
                value: 1.8 - scrollPercent / 100 * 1.8
              }, 1000, createjs.Ease.linear);
            },
          },
          {
            start: 80,
            end: 100,
            func: () => {
              createjs.Tween.get(gu.morph).to({
                value: 1.8 - scrollPercent / 100 * 1.8
              }, 1000, createjs.Ease.linear);
            },
          },
        )



  document.addEventListener('mousemove', onDocumentMouseMove, false);
  document.addEventListener('mousedown', (event => {
    console.log(camera.position)
  }), false);

  document.addEventListener('touchstart', onDocumentTouchStart, false);
  document.addEventListener('touchmove', onDocumentTouchMove, false);

  //

  window.addEventListener('resize', onWindowResize, false);

  document.body.onscroll = () => {
    //calculate the current scroll progress as a percentage
    scrollPercent =
        ((document.documentElement.scrollTop || document.body.scrollTop) /
            ((document.documentElement.scrollHeight ||
                document.body.scrollHeight))) *
        100;
    console.log((document.documentElement.scrollTop || document.body.scrollTop), (document.documentElement.scrollHeight ||
      document.body.scrollHeight), document.documentElement.clientHeight)
  }

  function playScrollAnimations() {
    if(!!animationScripts && animationScripts.length > 0) {
        animationScripts.forEach((a) => {
            if (scrollPercent >= a.start && scrollPercent < a.end) {
                a.func()
            }
        })
    }
  }



  // let controls = new OrbitControls(camera, renderer.domElement);
  // controls.enableDamping = true;

  let gu = {
    time: {value: 0},
    timeRate: {value: 0.2},
    waveRate: {value: 0.35},
    morph: {value: 1.8},
    shift: {value: -0.1},
    angle: {value: 41},
    diffX: {value: 100},
    waveHight: {value: 0.1},
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
    },
    pointSize: {
      value: 4 * windowHalfY / 540
    }
  }

  const planeData = {
    width: 30,
    height: 30,
    wSeg: 150,
    hSeg: 150
  }

  let g = new THREE.PlaneGeometry(planeData.width, planeData.height, planeData.wSeg, planeData.hSeg)
  .rotateY(Math.PI * 0.5)
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
        "timeRate": gu.timeRate,
        "waveRate": gu.waveRate,
        "shift": gu.shift,
        "morph": gu.morph,
        "angle": gu.angle,
        "diffX": gu.diffX,
        "waveHight": gu.waveHight,
        "light": {
          position: {
            x : 1, y : 1, z : 1
          },
          color: {
            x : 1, y : 1, z : 1
          }
        },
        "lightPosition" : gu.lightPosition,
        "pointSize": gu.pointSize
      },
      vertexShader: `
      uniform float time;
      uniform float timeRate;
      uniform float morph;
      uniform float shift;
      uniform float pointSize;
      uniform float angle;
      uniform float diffX;

      uniform vec3 color1;
      uniform vec3 color2;
      uniform mat4 modelview;
      uniform float waveRate;
      uniform float waveHight;
      attribute vec3 altPosition;
      out vec4 fragColor;
    
      varying vec2 vUv;
      varying vec4 pos;
      varying vec3 vColor;
      varying vec3 vPos;
      ${simplex}
    
      #include <common>
      #include <fog_pars_vertex>
      #include <shadowmap_pars_vertex>
    
      void main() {
    
        #include <begin_vertex>
        #include <beginnormal_vertex>     // Defines objectNormal
    
        float t = time * timeRate;
        vec3 pos1 = position;
        vec3 pos2 = altPosition;
        float n1 = snoise(vec4(pos1 * 0.2, t));
        // float n2 = snoise(vec4(normalize(pos2 * 1.2), t));
        float n2 = snoise(vec4(pos2 * waveRate, t));
    
        pos1.y += n1 * 0.3;
        pos1.x += n1 * 0.7;
        pos1.z += n1 * 0.7;
        pos2 += normalize(pos2) * n2 * waveHight;
        pos2.y += shift;
        pos2.x += 10.0;
    
        if (pos2.z < tan(radians(angle)) * (pos2.x - 10.0)) {
          pos2.x += diffX;
        }

        float delayValue = length(pos1.xz) / (7.5 * sqrt(2.));
        delayValue = sqrt(1. - (1. - delayValue * delayValue));
        float delayUnit = 1.;
        float factMorph = clamp(morph * (1. + delayUnit)  - (delayValue * delayUnit), 0., 1.);
        transformed = mix(pos1, pos2, factMorph);
    
        vPos = transformed;
        vPos.x -= 6.0;

        // vUv = uv;
        gl_PointSize = pointSize;

        // pos = projectionMatrix * modelViewMatrix * vec4(position,1.0);
        // gl_Position = pos;
    
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
        varying vec3 vPos;

        float calculateDiffuse(vec3 normal, vec3 lightDirection) {
          return clamp(max(dot(normal, lightDirection), 0.0), 0.0, 1.0);
        }

        void main() {
            if ( length( gl_PointCoord - vec2( 0.5, 0.5 ) ) > 0.475 ) discard;


            vec3 lightDirection = normalize(lightPosition - vPos);

            float diffuseCoefficient = calculateDiffuse(normalize(vPos), lightDirection);
        
            vec3 finalColor = mix(color1, color2, smoothstep(-5.0, 5.0, vPos.y));
      
            // Apply lighting to the final color
            finalColor += color3 * diffuseCoefficient;
      
            gl_FragColor = vec4(finalColor, 1.0);

        }
      `,
  });

  console.log(material)

  let o = new THREE.Points(g, material);
  scene.add(o);

  // gui.add(gu.angle, "value", 0, 360, 1).name("angle");
  // gui.add(gu.timeRate, "value", 0, 3, 0.01).name("timeRate");
  // gui.add(gu.waveRate, "value", 0, 2, 0.01).name("waveRate");
  // gui.add(gu.shift, "value", 0, 1).name("shift");
  // gui.add(gu.waveHight, "value", 0, 10, 0.01).name("waveHight");

  gui.addColor(scene, "background").name("background")

  let clock = new THREE.Clock();
  let t = 0;


  // tween.update()
  renderer.setAnimationLoop(() => {
      camera.lookAt(scene.position);
      plane.lookAt(camera.position)

      light.lookAt(plane.position)
      light.position.x = (originPos.x + 5 + (gu.morph.value) * 4) + (mouseX) * .02;
      light.position.y = originPos.y - (mouseY) * .02;
      light.position.z = originPos.z + (1.8 - gu.morph.value) * 3;

      light.position.x = Math.min(17 * windowHalfX / 860, light.position.x)


      let td = clock.getDelta();
      t += td;
      gu.time.value = t;
      // TWEEN.update()
      // controls.update();
      playScrollAnimations();
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
    let delta2 = 15 * windowHalfX / 860;

    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    o.geometry.translate(delta2 - delta1, 0, 0)

    camera.aspect = innerWidth / innerHeight;
    camera.rotation.x = Math.PI / 2
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  }

  //

  function onDocumentMouseMove(event) {

    mouseX = event.clientX - windowHalfX;
    mouseY = event.clientY - windowHalfY;

    createjs.Tween.get(camera.position, {override:true}).to({
      y: 1 + (0.5 - mouseY / windowHalfY) * 2,
      x: -6 + (0.5 - mouseX / windowHalfX) * 1
    }, 1500, createjs.Ease.linear );


    let mouse = {x : 0, y : 0}
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    var intersects = raycaster.intersectObject(plane, true);
    const heightRate = mouseY / windowHalfY;
    const delta = (0.5 - heightRate) * 0.3;
    
    if (intersects.length > 0) {
      createjs.Tween.get(gu.waveHight, {override:true}).to({
        value: 0.8 + delta
      }, 500, createjs.Ease.circIn );

    } else {
      createjs.Tween.get(gu.waveHight, {override:true}).to({
        value: 0.1
      }, 500, createjs.Ease.linear);
    }

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


