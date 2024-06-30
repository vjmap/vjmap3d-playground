
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/220miscControlstransform
        // --misc_controls_transform--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#misc_controls_transform
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            camera: {
                fov: 50,
                near: 0.1,
                far: 100,
                position: [ 0, 200, - 400]
            },
            control: {
                enable: false
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        let cameraPersp, cameraOrtho, currentCamera;
        let control, orbit;
        
        init();
        
        function init() {
        
            const aspect = window.innerWidth / window.innerHeight;
        
            const frustumSize = 5;
        
            cameraPersp = new THREE.PerspectiveCamera( 50, aspect, 0.1, 100 );
            cameraOrtho = new THREE.OrthographicCamera( - frustumSize * aspect, frustumSize * aspect, frustumSize, - frustumSize, 0.1, 100 );
            currentCamera = cameraPersp;
            app.data.camera = currentCamera
        
            currentCamera.position.set( 5, 2.5, 5 );
        
            scene.add( new THREE.GridHelper( 5, 10, 0x888888, 0x444444 ) );
        
            const ambientLight = new THREE.AmbientLight( 0xffffff );
            scene.add( ambientLight );
        
            const light = new THREE.DirectionalLight( 0xffffff, 4 );
            light.position.set( 1, 1, 1 );
            scene.add( light );
        
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
            const texture = new THREE.TextureLoader().load(assetsPath + 'textures/crate.gif' );
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
        
            const geometry = new THREE.BoxGeometry();
            const material = new THREE.MeshLambertMaterial( { map: texture } );
        
            orbit = new OrbitControls( currentCamera, renderer.domElement );
            orbit.update();
        
            control = new TransformControls( currentCamera, renderer.domElement );
        
            control.addEventListener( 'dragging-changed', function ( event ) {
        
                orbit.enabled = ! event.value;
        
            } );
        
            const mesh = new THREE.Mesh( geometry, material );
            scene.add( mesh );
        
            control.attach( mesh );
            scene.add( control );
        
            window.addEventListener( 'resize', onWindowResize );
        
            window.addEventListener( 'keydown', function ( event ) {
        
                switch ( event.key ) {
        
                    case 'q':
                        control.setSpace( control.space === 'local' ? 'world' : 'local' );
                        break;
        
                    case 'Shift':
                        control.setTranslationSnap( 1 );
                        control.setRotationSnap( THREE.MathUtils.degToRad( 15 ) );
                        control.setScaleSnap( 0.25 );
                        break;
        
                    case 'w':
                        control.setMode( 'translate' );
                        break;
        
                    case 'e':
                        control.setMode( 'rotate' );
                        break;
        
                    case 'r':
                        control.setMode( 'scale' );
                        break;
        
                    case 'c':
                        const position = currentCamera.position.clone();
        
                        currentCamera = currentCamera.isPerspectiveCamera ? cameraOrtho : cameraPersp;
                        currentCamera.position.copy( position );
        
                        orbit.object = currentCamera;
                        control.camera = currentCamera;
        
                        currentCamera.lookAt( orbit.target.x, orbit.target.y, orbit.target.z );
                        onWindowResize();
                        break;
        
                    case 'v':
                        const randomFoV = Math.random() + 0.1;
                        const randomZoom = Math.random() + 0.1;
        
                        cameraPersp.fov = randomFoV * 160;
                        cameraOrtho.bottom = - randomFoV * 500;
                        cameraOrtho.top = randomFoV * 500;
        
                        cameraPersp.zoom = randomZoom * 5;
                        cameraOrtho.zoom = randomZoom * 5;
                        onWindowResize();
                        break;
        
                    case '+':
                    case '=':
                        control.setSize( control.size + 0.1 );
                        break;
        
                    case '-':
                    case '_':
                        control.setSize( Math.max( control.size - 0.1, 0.1 ) );
                        break;
        
                    case 'x':
                        control.showX = ! control.showX;
                        break;
        
                    case 'y':
                        control.showY = ! control.showY;
                        break;
        
                    case 'z':
                        control.showZ = ! control.showZ;
                        break;
        
                    case ' ':
                        control.enabled = ! control.enabled;
                        break;
        
                    case 'Escape':
                        control.reset();
                        break;
        
                }
        
            } );
        
            window.addEventListener( 'keyup', function ( event ) {
        
                switch ( event.key ) {
        
                    case 'Shift':
                        control.setTranslationSnap( null );
                        control.setRotationSnap( null );
                        control.setScaleSnap( null );
                        break;
        
                }
        
            } );
        
            app.logInfo(`"W" translate | "E" rotate | "R" scale | "+/-" adjust size<br />
            "Q" toggle world/local space |  "Shift" snap to grid<br />
            "X" toggle X | "Y" toggle Y | "Z" toggle Z | "Spacebar" toggle enabled<br />
            "Esc" reset current transform<br />
            "C" toggle camera | "V" random zoom`, 20000)
        }
        
        function onWindowResize() {
        
            const aspect = window.innerWidth / window.innerHeight;
        
            cameraPersp.aspect = aspect;
            cameraPersp.updateProjectionMatrix();
        
            cameraOrtho.left = cameraOrtho.bottom * aspect;
            cameraOrtho.right = cameraOrtho.top * aspect;
            cameraOrtho.updateProjectionMatrix();
        
          
        }
        
    }
    catch (e) {
        console.error(e);
    }
};