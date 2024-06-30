
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/035threeWebglInteractiveLines
        // --interactive_lines--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_interactive_lines
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
                near: 1, 
                far: 10000,
                position: [0, 0, 0 ]
            },
            control: {
                enable: false
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        let parentTransform, sphereInter;
        const radius = 100;
        let theta = 0;
        
        init();
        
        function init() {
        
            const geometry = new THREE.SphereGeometry( 5 );
            const material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
        
            sphereInter = new THREE.Mesh( geometry, material );
            sphereInter.visible = false;
            scene.add( sphereInter );
        
            const lineGeometry = new THREE.BufferGeometry();
            const points = [];
        
            const point = new THREE.Vector3();
            const direction = new THREE.Vector3();
        
            for ( let i = 0; i < 50; i ++ ) {
        
                direction.x += Math.random() - 0.5;
                direction.y += Math.random() - 0.5;
                direction.z += Math.random() - 0.5;
                direction.normalize().multiplyScalar( 10 );
        
                point.add( direction );
                points.push( point.x, point.y, point.z );
        
            }
        
            lineGeometry.setAttribute( 'position', new THREE.Float32BufferAttribute( points, 3 ) );
        
            parentTransform = new THREE.Object3D();
            parentTransform.position.x = Math.random() * 40 - 20;
            parentTransform.position.y = Math.random() * 40 - 20;
            parentTransform.position.z = Math.random() * 40 - 20;
        
            parentTransform.rotation.x = Math.random() * 2 * Math.PI;
            parentTransform.rotation.y = Math.random() * 2 * Math.PI;
            parentTransform.rotation.z = Math.random() * 2 * Math.PI;
        
            parentTransform.scale.x = Math.random() + 0.5;
            parentTransform.scale.y = Math.random() + 0.5;
            parentTransform.scale.z = Math.random() + 0.5;
        
            for ( let i = 0; i < 50; i ++ ) {
        
                let object;
        
                const lineMaterial = new THREE.LineBasicMaterial( { color: Math.random() * 0xffffff } );
        
                if ( Math.random() > 0.5 ) {
        
                    object = new THREE.Line( lineGeometry, lineMaterial );
        
                } else {
        
                    object = new THREE.LineSegments( lineGeometry, lineMaterial );
        
                }
        
                object.position.x = Math.random() * 400 - 200;
                object.position.y = Math.random() * 400 - 200;
                object.position.z = Math.random() * 400 - 200;
        
                object.rotation.x = Math.random() * 2 * Math.PI;
                object.rotation.y = Math.random() * 2 * Math.PI;
                object.rotation.z = Math.random() * 2 * Math.PI;
        
                object.scale.x = Math.random() + 0.5;
                object.scale.y = Math.random() + 0.5;
                object.scale.z = Math.random() + 0.5;
        
                parentTransform.add( object );
        
            }
        
            scene.add( parentTransform );
            vjmap3d.Entity.attchObject(parentTransform); // 只有变成entity才能queryEntitiesByScreenPos查询
        
            app.signal.onAppRender.add(e => {
                theta += 0.1;
        
                camera.position.x = radius * Math.sin( THREE.MathUtils.degToRad( theta ) );
                camera.position.y = radius * Math.sin( THREE.MathUtils.degToRad( theta ) );
                camera.position.z = radius * Math.cos( THREE.MathUtils.degToRad( theta ) );
                camera.lookAt( scene.position );
            
                camera.updateMatrixWorld();
        
                
                let io = app.queryEntitiesByScreenPos(app.Input.x(), app.Input.y(), {
                    raycasterParameters: {
                        Line: {
                            threshold: 3
                        }
                    }
                });
                if (io?.intersection) {
                    sphereInter.visible = true;
                    sphereInter.position.copy( io.intersection.point );
                } else {
                    sphereInter.visible = false;
                }
             })
        
        }
        
    }
    catch (e) {
        console.error(e);
    }
};