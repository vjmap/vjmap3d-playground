
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/033threeWebglInteractiveCubes
        // --interactive_cubes--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_interactive_cubes
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                background: 0xf0f0f0,
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 70,
                near: 0.1, 
                far: 100,
                position: [0, 0, 0 ]
            },
            control: {
                enable: false
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        let INTERSECTED;
        let theta = 0;
        
        const radius = 5;
        
        init();
        
        function init() {
        
            const light = new THREE.DirectionalLight( 0xffffff, 3 );
            light.position.set( 1, 1, 1 ).normalize();
            scene.add( light );
        
            const geometry = new THREE.BoxGeometry();
        
            for ( let i = 0; i < 2000; i ++ ) {
        
                const object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );
        
                object.position.x = Math.random() * 40 - 20;
                object.position.y = Math.random() * 40 - 20;
                object.position.z = Math.random() * 40 - 20;
        
                object.rotation.x = Math.random() * 2 * Math.PI;
                object.rotation.y = Math.random() * 2 * Math.PI;
                object.rotation.z = Math.random() * 2 * Math.PI;
        
                object.scale.x = Math.random() + 0.5;
                object.scale.y = Math.random() + 0.5;
                object.scale.z = Math.random() + 0.5;
        
                //scene.add( object );
                let meshEntity = vjmap3d.MeshEntity.fromObject3d(object);
                meshEntity.addTo(app);
            }
        
            app.sceneEntity.addAction(() => {
                theta += 0.1;
        
                camera.position.x = radius * Math.sin( THREE.MathUtils.degToRad( theta ) );
                camera.position.y = radius * Math.sin( THREE.MathUtils.degToRad( theta ) );
                camera.position.z = radius * Math.cos( THREE.MathUtils.degToRad( theta ) );
                camera.lookAt( scene.position );
            
                camera.updateMatrixWorld();
            })
        
            app.signal.onAppRender.add(e => {
               let io = app.queryEntitiesByScreenPos(app.Input.x(), app.Input.y());
               if (io?.intersection) {
                    if ( INTERSECTED != io.intersection.object ) {
        
                        if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
        
                        INTERSECTED = io.intersection.object;
                        INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
                        INTERSECTED.material.emissive.setHex( 0xff0000 );
        
                    }
               } else {
                    if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
        
                    INTERSECTED = null;
               }
            })
        }
        
    }
    catch (e) {
        console.error(e);
    }
};