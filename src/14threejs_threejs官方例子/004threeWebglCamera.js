
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/004threeWebglCamera
        // --camera--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_camera
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov:  50,
                near: 1,
                far: 10000,
                position: [0, 0, 2500]
            },
            control: {
                enable: false
            },
            postProcess: {
                enable: false
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        let SCREEN_WIDTH = app.containerSize.width;
        let SCREEN_HEIGHT = app.containerSize.height;
        let aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
        camera.aspect = aspect * 0.5;
        camera.updateProjectionMatrix();
        
        let  mesh;
        let cameraRig, activeCamera, activeHelper;
        let cameraPerspective, cameraOrtho;
        let cameraPerspectiveHelper, cameraOrthoHelper;
        const frustumSize = 600;
        
        init();
        app.signal.onAppUpdate.add(() => render())
        
        function init() {
           
            cameraPerspective = new THREE.PerspectiveCamera( 50, 0.5 * aspect, 150, 1000 );
        
            cameraPerspectiveHelper = new THREE.CameraHelper( cameraPerspective );
            scene.add( cameraPerspectiveHelper );
        
            //
            cameraOrtho = new THREE.OrthographicCamera( 0.5 * frustumSize * aspect / - 2, 0.5 * frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 150, 1000 );
        
            cameraOrthoHelper = new THREE.CameraHelper( cameraOrtho );
            scene.add( cameraOrthoHelper );
        
            //
        
            activeCamera = cameraPerspective;
            activeHelper = cameraPerspectiveHelper;
        
        
            // counteract different front orientation of cameras vs rig
        
            cameraOrtho.rotation.y = Math.PI;
            cameraPerspective.rotation.y = Math.PI;
        
            cameraRig = new THREE.Group();
        
            cameraRig.add( cameraPerspective );
            cameraRig.add( cameraOrtho );
        
            scene.add( cameraRig );
        
            //
        
            mesh = new THREE.Mesh(
                new THREE.SphereGeometry( 100, 16, 8 ),
                new THREE.MeshBasicMaterial( { color: 0xffffff, wireframe: true } )
            );
            scene.add( mesh );
        
            const mesh2 = new THREE.Mesh(
                new THREE.SphereGeometry( 50, 16, 8 ),
                new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: true } )
            );
            mesh2.position.y = 150;
            mesh.add( mesh2 );
        
            const mesh3 = new THREE.Mesh(
                new THREE.SphereGeometry( 5, 16, 8 ),
                new THREE.MeshBasicMaterial( { color: 0x0000ff, wireframe: true } )
            );
            mesh3.position.z = 150;
            cameraRig.add( mesh3 );
        
            //
        
            const geometry = new THREE.BufferGeometry();
            const vertices = [];
        
            for ( let i = 0; i < 10000; i ++ ) {
        
                vertices.push( THREE.MathUtils.randFloatSpread( 2000 ) ); // x
                vertices.push( THREE.MathUtils.randFloatSpread( 2000 ) ); // y
                vertices.push( THREE.MathUtils.randFloatSpread( 2000 ) ); // z
        
            }
        
            geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
        
            const particles = new THREE.Points( geometry, new THREE.PointsMaterial( { color: 0x888888 } ) );
            scene.add( particles );
        
            
        
            renderer.setScissorTest( true );
        
          
            app.logInfo("按 O 键切换至正交相机, 按 P 键切换至透视相机", 60000)
            app.signal.onKeyDown.add(e => onKeyDown(e.originalEvent))
            app.signal.onContainerSizeChange.add(e => onWindowResize(e))
        }
        
        //
        
        function onKeyDown( event ) {
        
            console.log(event)
            switch ( event.keyCode ) {
        
                case 79: /*O*/
        
                    activeCamera = cameraOrtho;
                    activeHelper = cameraOrthoHelper;
        
                    break;
        
                case 80: /*P*/
        
                    activeCamera = cameraPerspective;
                    activeHelper = cameraPerspectiveHelper;
        
                    break;
        
            }
        
        }
        
        //
        
        function onWindowResize() {
        
            SCREEN_WIDTH = window.innerWidth;
            SCREEN_HEIGHT = window.innerHeight;
            aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
        
            renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
        
            camera.aspect = 0.5 * aspect;
            camera.updateProjectionMatrix();
        
            cameraPerspective.aspect = 0.5 * aspect;
            cameraPerspective.updateProjectionMatrix();
        
            cameraOrtho.left = - 0.5 * frustumSize * aspect / 2;
            cameraOrtho.right = 0.5 * frustumSize * aspect / 2;
            cameraOrtho.top = frustumSize / 2;
            cameraOrtho.bottom = - frustumSize / 2;
            cameraOrtho.updateProjectionMatrix();
        
        }
        
        
        function render() {
        
            const r = Date.now() * 0.0005;
        
            mesh.position.x = 700 * Math.cos( r );
            mesh.position.z = 700 * Math.sin( r );
            mesh.position.y = 700 * Math.sin( r );
        
            mesh.children[ 0 ].position.x = 70 * Math.cos( 2 * r );
            mesh.children[ 0 ].position.z = 70 * Math.sin( r );
        
            if ( activeCamera === cameraPerspective ) {
        
                cameraPerspective.fov = 35 + 30 * Math.sin( 0.5 * r );
                cameraPerspective.far = mesh.position.length();
                cameraPerspective.updateProjectionMatrix();
        
                cameraPerspectiveHelper.update();
                cameraPerspectiveHelper.visible = true;
        
                cameraOrthoHelper.visible = false;
        
            } else {
        
                cameraOrtho.far = mesh.position.length();
                cameraOrtho.updateProjectionMatrix();
        
                cameraOrthoHelper.update();
                cameraOrthoHelper.visible = true;
        
                cameraPerspectiveHelper.visible = false;
        
            }
        
            cameraRig.lookAt( mesh.position );
        
            //
        
            activeHelper.visible = false;
        
            renderer.setClearColor( 0x000000, 1 );
            renderer.setScissor( 0, 0, SCREEN_WIDTH / 2, SCREEN_HEIGHT );
            renderer.setViewport( 0, 0, SCREEN_WIDTH / 2, SCREEN_HEIGHT );
            renderer.render( scene, activeCamera );
        
            //
        
            activeHelper.visible = true;
        
            renderer.setClearColor( 0x111111, 1 );
            renderer.setScissor( SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2, SCREEN_HEIGHT );
            renderer.setViewport( SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2, SCREEN_HEIGHT );
            //renderer.render( scene, camera );
        
        }
    }
    catch (e) {
        console.error(e);
    }
};