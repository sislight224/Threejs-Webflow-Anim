
var SEPARATION = 80,
        AMOUNTX = 100,
        AMOUNTY = 70;
 
    var container;
    var camera, scene, renderer;
 
    var particles, particle, count = 0;
 
    let sphereDot, planDot, sphereSeg, planSeg;

    var mouseX = 85,
        mouseY = -342;
 
    var windowHalfX = window.innerWidth / 2;
    var windowHalfY = window.innerHeight / 2;
 
    let animationScripts = []
    let scrollPercent = 0


    init();
    animate();
 
    function init() {
 
        container = document.getElementById('home_wave');
        document.body.appendChild(container);
 
        camera = new THREE.PerspectiveCamera(120, window.innerWidth / window.innerHeight, 0.1, 10000);
        camera.position.z = 1.5;
        camera.position.y = -0.5;
        // camera.rotation.z += Math.PI/3
        // camera.updateProjectionMatrix();

        scene = new THREE.Scene();
        scene.fog = new THREE.Fog( 0x000000, 0.1, 2);


        particles = new Array();
 
        var PI2 = Math.PI * 2;
        // var material = new THREE.ParticleCanvasMaterial({
 
        //     color: 0xe1e1e1,
        //     program: function(context) {
 
        //         context.beginPath();
        //         context.arc(0, 0, .6, 0, PI2, true);
        //         context.fill();
 
        //     }
 
        // });
 
        var i = 0;
 
        var radius = 500;

        // for (var ix = 0; ix < AMOUNTX; ix++) {
 
        //     for (var iy = 0; iy < AMOUNTY; iy++) {
 
        //         particle = particles[i++] = new THREE.Particle(material);
        //         particle.position.x = ix * SEPARATION - ((AMOUNTX * SEPARATION) / 2);
        //         particle.position.z = ix * SEPARATION - ((AMOUNTX * SEPARATION) / 2);
        //         particle.position.originX = iy * SEPARATION - ((AMOUNTY * SEPARATION) / 2);
        //         particle.position.originZ = iy * SEPARATION - ((AMOUNTY * SEPARATION) / 2);
        //         scene.add(particle);
        //     }
 
        // }
 
        renderer = new THREE.WebGLRenderer( { antialias: true } );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        container.appendChild(renderer.domElement);
 
        document.addEventListener('mousemove', onDocumentMouseMove, false);
        document.addEventListener('touchstart', onDocumentTouchStart, false);
        document.addEventListener('touchmove', onDocumentTouchMove, false);
 
        //
 
        window.addEventListener('resize', onWindowResize, false);
 

        //add an animation that flashes the cube through 100 percent of scroll
        animationScripts.push({
            start: 0,
            end: 101,
            func: () => {
                
            },
        })

        initBlob();
        initPlan();
    }

    function initBlob() {
        sphereSeg = 256;
        let sphere_geometry = new THREE.SphereGeometry(0.5, sphereSeg, sphereSeg);
        let material = new THREE.MeshNormalMaterial();

        let sphere = new THREE.Mesh(sphere_geometry, material);
        //scene.add(sphere);

        let dotGeometry = new THREE.Geometry();
        for (let i = 0; i < sphere.geometry.vertices.length; i++) {
            let p = sphere.geometry.vertices[i];
            dotGeometry.vertices.push(p);
        }
        let dotMaterial = new THREE.PointsMaterial( { size: 1.5 , sizeAttenuation: false } );
        dotMaterial.color.setHSL( 1.0, 0.3, 0.7, THREE.SRGBColorSpace );
        sphereDot = new THREE.Points( dotGeometry, dotMaterial );
        scene.add( sphereDot );
    }

    function initPlan() {
        planSeg = 128
        let plan_geometry = new THREE.PlaneGeometry(15, 15, planSeg, planSeg);
        let material = new THREE.MeshNormalMaterial();

        let plan = new THREE.Mesh(plan_geometry, material);
        // scene.add(plan);

        let dotGeometry = new THREE.Geometry();
        for (let i = 0; i < plan.geometry.vertices.length; i++) {
            let p = plan.geometry.vertices[i];
            dotGeometry.vertices.push(p);
        }
        let dotMaterial = new THREE.PointsMaterial( { size: 3, sizeAttenuation: false } );
        planDot = new THREE.Points( dotGeometry, dotMaterial );
        scene.add( planDot );
    }
 
    function onWindowResize() {
 
        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;
 
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
 
        renderer.setSize(window.innerWidth, window.innerHeight);
 
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
 
        }
 
    }
 
    function onDocumentTouchMove(event) {
 
        if (event.touches.length === 1) {
 
            event.preventDefault();
 
            mouseX = event.touches[0].pageX - windowHalfX;
            mouseY = event.touches[0].pageY - windowHalfY;
 
        }
 
    }
 

    document.body.onscroll = () => {
        //calculate the current scroll progress as a percentage
        scrollPercent =
            ((document.documentElement.scrollTop || document.body.scrollTop) /
                ((document.documentElement.scrollHeight ||
                    document.body.scrollHeight) -
                    document.documentElement.clientHeight)) *
            100;
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

    //
 
    function animate() {
 
        requestAnimationFrame(animate);
        playScrollAnimations()

        render();
 
 
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
    function render() {
 
        // camera.position.x += (mouseX - camera.position.x) * .00005;
        // camera.position.y += (mouseY - camera.position.y) * .00005;
        // camera.position.y += (-mouseY - camera.position.y) * .05;
        camera.lookAt(scene.position);
 

        // var i = 0;
 
        // for (var ix = 0; ix < AMOUNTX; ix++) {
 
        //     for (var iy = 0; iy < AMOUNTY; iy++) {
 
        //         particle = particles[i++];
        //         particle.position.y = (Math.sin((ix + count) * 0.3) * 20) + (Math.sin((iy + count) * 0.5) * 20);
        //         particle.position.x = particle.position.originX * (1 - scrollPercent / 100)
        //         particle.scale.x = particle.scale.y = (Math.sin((ix + count) * 0.3) + 1) * 2 + (Math.sin((iy + count) * 0.5) + 1) * 2;
 
        //     }
 
        // }

        // SPHERE Dot
        let time = performance.now() * 0.0003;

        let s_k = 5;
        for (let i = 0; i < sphereDot.geometry.vertices.length; i++) {
            let p = sphereDot.geometry.vertices[i];
            p.normalize().multiplyScalar(1 + 0.05 * noise.perlin3(p.x * s_k + time, p.y * s_k, p.z * s_k));
        }
      
        sphereDot.geometry.computeVertexNormals();
        sphereDot.geometry.normalsNeedUpdate = true;
        sphereDot.geometry.verticesNeedUpdate = true;

        // PLAN Dot
        let p_k = 3;
        for (let i = 0; i < planDot.geometry.vertices.length; i++) {
            let p = planDot.geometry.vertices[i];
            let ix = i % planSeg;
            let iy = Math.round(i / planSeg)
            p.z = (Math.sin((ix + count) * 0.3) + 1) * 0.1 + (Math.sin((iy + count) * 0.3) + 1) * 0.1;
        }
      
        planDot.geometry.computeVertexNormals();
        planDot.geometry.normalsNeedUpdate = true;
        planDot.geometry.verticesNeedUpdate = true;
 
        renderer.render(scene, camera);
 
        count += 0.01;
 
    }