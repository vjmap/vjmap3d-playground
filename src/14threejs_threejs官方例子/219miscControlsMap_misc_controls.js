
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/219miscControlsMap
        // --misc_controls_map--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#misc_controls_map
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            camera: {
                fov: 60,
                near: 1,
                far: 1000,
                position: [ 0, 200, - 400]
            },
            control: {
                enable: false
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        let controls;
        
        init();
        //render(); // remove when using animation loop
        
        function init() {
        
            scene.background = new THREE.Color( 0xcccccc );
            scene.fog = new THREE.FogExp2( 0xcccccc, 0.002 );
        
            // controls
        
            controls = new MapControls( camera, renderer.domElement );
        
            //controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)
        
            controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
            controls.dampingFactor = 0.05;
        
            controls.screenSpacePanning = false;
        
            controls.minDistance = 100;
            controls.maxDistance = 500;
        
            controls.maxPolarAngle = Math.PI / 2;
        
            // world
        
            const geometry = new THREE.BoxGeometry();
            geometry.translate( 0, 0.5, 0 );
            const material = new THREE.MeshPhongMaterial( { color: 0xeeeeee, flatShading: true } );
        
            for ( let i = 0; i < 500; i ++ ) {
        
                const mesh = new THREE.Mesh( geometry, material );
                mesh.position.x = Math.random() * 1600 - 800;
                mesh.position.y = 0;
                mesh.position.z = Math.random() * 1600 - 800;
                mesh.scale.x = 20;
                mesh.scale.y = Math.random() * 80 + 10;
                mesh.scale.z = 20;
                mesh.updateMatrix();
                mesh.matrixAutoUpdate = false;
                scene.add( mesh );
        
            }
        
            // lights
        
            const dirLight1 = new THREE.DirectionalLight( 0xffffff, 3 );
            dirLight1.position.set( 1, 1, 1 );
            scene.add( dirLight1 );
        
            const dirLight2 = new THREE.DirectionalLight( 0x002288, 3 );
            dirLight2.position.set( - 1, - 1, - 1 );
            scene.add( dirLight2 );
        
            const ambientLight = new THREE.AmbientLight( 0x555555 );
            scene.add( ambientLight );
        
        
            const gui = new GUI();
            gui.add( controls, 'zoomToCursor' );
            gui.add( controls, 'screenSpacePanning' );
        
        }
        
    }
    catch (e) {
        console.error(e);
    }
};