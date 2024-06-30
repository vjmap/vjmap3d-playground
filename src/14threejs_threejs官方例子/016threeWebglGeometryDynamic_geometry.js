
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/016threeWebglGeometryDynamic
        // --geometry_dynamic--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_geometry_dynamic
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                background: 0xaaccff,
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 60,
                near: 1,
                far: 20000,
                position: [0, 200, 0]
            },
            control: {
               enable: false
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        scene.fog = new THREE.FogExp2( 0xaaccff, 0.0007 );
        
        let mesh, geometry, material, clock, controls;
        
        const worldWidth = 128, worldDepth = 128;
        
        init();
        
        function init() {
        
            clock = new THREE.Clock();
          
            geometry = new THREE.PlaneGeometry( 20000, 20000, worldWidth - 1, worldDepth - 1 );
            geometry.rotateX( - Math.PI / 2 );
        
            const position = geometry.attributes.position;
            position.usage = THREE.DynamicDrawUsage;
        
            for ( let i = 0; i < position.count; i ++ ) {
        
                const y = 35 * Math.sin( i / 2 );
                position.setY( i, y );
        
            }
        
        
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
            const texture = new THREE.TextureLoader().load(assetsPath + 'textures/water.jpg' );
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set( 5, 5 );
            texture.colorSpace = THREE.SRGBColorSpace;
        
            material = new THREE.MeshBasicMaterial( { color: 0x0044ff, map: texture } );
        
            mesh = new THREE.Mesh( geometry, material );
            scene.add( mesh );
        
            controls = new FirstPersonControls( camera, renderer.domElement );
        
            controls.movementSpeed = 500;
            controls.lookSpeed = 0.1;
        
            app.signal.onAppUpdate.add(render);
            app.signal.onContainerSizeChange.add(() => controls.handleResize())
        
            app.logInfo("按左键前进，右键后退", 5000)
        }
        
        
        
        function render() {
        
            const delta = clock.getDelta();
            const time = clock.getElapsedTime() * 10;
        
            const position = geometry.attributes.position;
        
            for ( let i = 0; i < position.count; i ++ ) {
        
                const y = 35 * Math.sin( i / 5 + ( time + i ) / 7 );
                position.setY( i, y );
        
            }
        
            position.needsUpdate = true;
        
            controls.update( delta );
        
        }
        
    }
    catch (e) {
        console.error(e);
    }
};