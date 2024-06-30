
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/216miscControlsArcball
        // --misc_controls_arcball--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#misc_controls_arcball
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            camera: {
                fov: 70,
                near: 0.1,
                far: 500,
                position: [0, 0, 50]
            },
            control: {
                enable: false
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        const cameras = [ 'Orthographic', 'Perspective' ];
        const cameraType = { type: 'Perspective' };
        
        const perspectiveDistance = 2.5;
        const orthographicDistance = 120;
        let gui, controls;
        let folderOptions, folderAnimations;
        
        const arcballGui = {
        
            gizmoVisible: true,
        
            setArcballControls: function () {
        
                controls = new ArcballControls( camera, renderer.domElement, scene );
        
                this.gizmoVisible = true;
        
                this.populateGui();
        
            },
        
            populateGui: function () {
        
                folderOptions.add( controls, 'enabled' ).name( 'Enable controls' );
                folderOptions.add( controls, 'enableGrid' ).name( 'Enable Grid' );
                folderOptions.add( controls, 'enableRotate' ).name( 'Enable rotate' );
                folderOptions.add( controls, 'enablePan' ).name( 'Enable pan' );
                folderOptions.add( controls, 'enableZoom' ).name( 'Enable zoom' );
                folderOptions.add( controls, 'cursorZoom' ).name( 'Cursor zoom' );
                folderOptions.add( controls, 'adjustNearFar' ).name( 'adjust near/far' );
                folderOptions.add( controls, 'scaleFactor', 1.1, 10, 0.1 ).name( 'Scale factor' );
                folderOptions.add( controls, 'minDistance', 0, 50, 0.5 ).name( 'Min distance' );
                folderOptions.add( controls, 'maxDistance', 0, 50, 0.5 ).name( 'Max distance' );
                folderOptions.add( controls, 'minZoom', 0, 50, 0.5 ).name( 'Min zoom' );
                folderOptions.add( controls, 'maxZoom', 0, 50, 0.5 ).name( 'Max zoom' );
                folderOptions.add( arcballGui, 'gizmoVisible' ).name( 'Show gizmos' ).onChange( function () {
        
                    controls.setGizmosVisible( arcballGui.gizmoVisible );
        
                } );
                folderOptions.add( controls, 'copyState' ).name( 'Copy state(ctrl+c)' );
                folderOptions.add( controls, 'pasteState' ).name( 'Paste state(ctrl+v)' );
                folderOptions.add( controls, 'reset' ).name( 'Reset' );
                folderAnimations.add( controls, 'enableAnimations' ).name( 'Enable anim.' );
                folderAnimations.add( controls, 'dampingFactor', 0, 100, 1 ).name( 'Damping' );
                folderAnimations.add( controls, 'wMax', 0, 100, 1 ).name( 'Angular spd' );
        
            }
        
        };
        
        
        init();
        
        function init() {
        
        
            renderer.toneMapping = THREE.ReinhardToneMapping;
            renderer.toneMappingExposure = 3;
            renderer.domElement.style.background = 'linear-gradient( 180deg, rgba( 0,0,0,1 ) 0%, rgba( 128,128,255,1 ) 100% )';
           
            camera = makePerspectiveCamera();
            camera.position.set( 0, 0, perspectiveDistance );
            app.camera = camera
            const material = new THREE.MeshStandardMaterial();
        
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
            vjmap3d.LoadManager.objLoader
                .setPath(assetsPath + 'models/obj/cerberus/' )
                .load( 'Cerberus.obj', function ( group ) {
        
                    const textureLoader = new THREE.TextureLoader().setPath(assetsPath + 'models/obj/cerberus/' );
        
                    material.roughness = 1;
                    material.metalness = 1;
        
                    const diffuseMap = textureLoader.load( 'Cerberus_A.jpg' );
                    diffuseMap.colorSpace = THREE.SRGBColorSpace;
                    material.map = diffuseMap;
        
                    material.metalnessMap = material.roughnessMap = textureLoader.load('Cerberus_RM.jpg');
                    material.normalMap = textureLoader.load( 'Cerberus_N.jpg' );
        
                    material.map.wrapS = THREE.RepeatWrapping;
                    material.roughnessMap.wrapS = THREE.RepeatWrapping;
                    material.metalnessMap.wrapS = THREE.RepeatWrapping;
                    material.normalMap.wrapS = THREE.RepeatWrapping;
        
        
                    group.traverse( function ( child ) {
        
                        if ( child.isMesh ) {
        
                            child.material = material;
        
                        }
        
                    } );
        
                    group.rotation.y = Math.PI / 2;
                    group.position.x += 0.25;
                    scene.add( group );
        
                    vjmap3d.LoadManager.hdrLoader
                        .setPath(assetsPath +  'textures/equirectangular/' )
                        .load( 'venice_sunset_1k.hdr', function ( hdrEquirect ) {
        
                            hdrEquirect.mapping = THREE.EquirectangularReflectionMapping;
        
                            scene.environment = hdrEquirect;
        
        
                        } );
        
        
                    window.addEventListener( 'keydown', onKeyDown );
                    window.addEventListener( 'resize', onWindowResize );
        
                    //
        
                    gui = new GUI();
                    gui.add( cameraType, 'type', cameras ).name( 'Choose Camera' ).onChange( function () {
        
                        setCamera( cameraType.type );
        
                    } );
        
                    folderOptions = gui.addFolder( 'Arcball parameters' );
                    folderAnimations = folderOptions.addFolder( 'Animations' );
        
                    arcballGui.setArcballControls();
        
                
        
                } );
        
        }
        
        function makeOrthographicCamera() {
        
            const halfFovV = THREE.MathUtils.DEG2RAD * 45 * 0.5;
            const halfFovH = Math.atan( ( window.innerWidth / window.innerHeight ) * Math.tan( halfFovV ) );
        
            const halfW = perspectiveDistance * Math.tan( halfFovH );
            const halfH = perspectiveDistance * Math.tan( halfFovV );
            const near = 0.01;
            const far = 2000;
            const newCamera = new THREE.OrthographicCamera( - halfW, halfW, halfH, - halfH, near, far );
            return newCamera;
        
        }
        
        function makePerspectiveCamera() {
        
            const fov = 45;
            const aspect = window.innerWidth / window.innerHeight;
            const near = 0.01;
            const far = 2000;
            const newCamera = new THREE.PerspectiveCamera( fov, aspect, near, far );
            return newCamera;
        
        }
        
        
        function onWindowResize() {
        
            if ( camera.type == 'OrthographicCamera' ) {
        
                const halfFovV = THREE.MathUtils.DEG2RAD * 45 * 0.5;
                const halfFovH = Math.atan( ( window.innerWidth / window.innerHeight ) * Math.tan( halfFovV ) );
        
                const halfW = perspectiveDistance * Math.tan( halfFovH );
                const halfH = perspectiveDistance * Math.tan( halfFovV );
                camera.left = - halfW;
                camera.right = halfW;
                camera.top = halfH;
                camera.bottom = - halfH;
        
            } else if ( camera.type == 'PerspectiveCamera' ) {
        
                camera.aspect = window.innerWidth / window.innerHeight;
        
            }
        
            camera.updateProjectionMatrix();
        
        
        }
        
        
        function onKeyDown( event ) {
        
            if ( event.key === 'c' ) {
        
                if ( event.ctrlKey || event.metaKey ) {
        
                    controls.copyState();
        
                }
        
            } else if ( event.key === 'v' ) {
        
                if ( event.ctrlKey || event.metaKey ) {
        
                    controls.pasteState();
        
                }
        
            }
        
        }
        
        function setCamera( type ) {
        
            if ( type == 'Orthographic' ) {
        
                camera = makeOrthographicCamera();
                camera.position.set( 0, 0, orthographicDistance );
        
        
            } else if ( type == 'Perspective' ) {
        
                camera = makePerspectiveCamera();
                camera.position.set( 0, 0, perspectiveDistance );
        
            }
        
            controls.setCamera( camera );
        
         
            app.camera = camera
        
        }
        
        
    }
    catch (e) {
        console.error(e);
    }
};