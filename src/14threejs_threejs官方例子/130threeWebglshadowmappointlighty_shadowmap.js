
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/130threeWebglshadowmappointlighty
        // --shadowmap_pointlight--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_shadowmap_pointlight
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                background: 0x59472b,
                defaultLights: false
            },
            camera: {
                fov: 45,
                near: 1,
                far: 1000,
                position: [ 0, 10, 40  ]
            },
            control: {
                target: [ 0, 10, 0 ]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        let pointLight, pointLight2;
        
        init();
        
        function init() {
        
            scene.add( new THREE.AmbientLight( 0x111122, 3 ) );
        
            // lights
        
            function createLight( color ) {
        
                const intensity = 200;
        
                const light = new THREE.PointLight( color, intensity, 20 );
                light.castShadow = true;
                light.shadow.bias = - 0.005; // reduces self-shadowing on double-sided objects
        
                let geometry = new THREE.SphereGeometry( 0.3, 12, 6 );
                let material = new THREE.MeshBasicMaterial( { color: color } );
                material.color.multiplyScalar( intensity );
                let sphere = new THREE.Mesh( geometry, material );
                light.add( sphere );
        
                const texture = new THREE.CanvasTexture( generateTexture() );
                texture.magFilter = THREE.NearestFilter;
                texture.wrapT = THREE.RepeatWrapping;
                texture.wrapS = THREE.RepeatWrapping;
                texture.repeat.set( 1, 4.5 );
        
                geometry = new THREE.SphereGeometry( 2, 32, 8 );
                material = new THREE.MeshPhongMaterial( {
                    side: THREE.DoubleSide,
                    alphaMap: texture,
                    alphaTest: 0.5
                } );
        
                sphere = new THREE.Mesh( geometry, material );
                sphere.castShadow = true;
                sphere.receiveShadow = true;
                light.add( sphere );
        
                return light;
        
            }
        
            pointLight = createLight( 0x0088ff );
            scene.add( pointLight );
        
            pointLight2 = createLight( 0xff8888 );
            scene.add( pointLight2 );
            //
        
            const geometry = new THREE.BoxGeometry( 30, 30, 30 );
        
            const material = new THREE.MeshPhongMaterial( {
                color: 0xa0adaf,
                shininess: 10,
                specular: 0x111111,
                side: THREE.BackSide
            } );
        
            const mesh = new THREE.Mesh( geometry, material );
            mesh.position.y = 10;
            mesh.receiveShadow = true;
            scene.add( mesh );
        
            //
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.BasicShadowMap;
        
            //
        
            app.signal.onAppUpdate.add(animate)
        
        }
        
        
        function generateTexture() {
        
            const canvas = document.createElement( 'canvas' );
            canvas.width = 2;
            canvas.height = 2;
        
            const context = canvas.getContext( '2d' );
            context.fillStyle = 'white';
            context.fillRect( 0, 1, 2, 1 );
        
            return canvas;
        
        }
        
        function animate() {
        
            let time = performance.now() * 0.001;
        
            pointLight.position.x = Math.sin( time * 0.6 ) * 9;
            pointLight.position.y = Math.sin( time * 0.7 ) * 9 + 6;
            pointLight.position.z = Math.sin( time * 0.8 ) * 9;
        
            pointLight.rotation.x = time;
            pointLight.rotation.z = time;
        
            time += 10000;
        
            pointLight2.position.x = Math.sin( time * 0.6 ) * 9;
            pointLight2.position.y = Math.sin( time * 0.7 ) * 9 + 6;
            pointLight2.position.z = Math.sin( time * 0.8 ) * 9;
        
            pointLight2.rotation.x = time;
            pointLight2.rotation.z = time;
        
           
        
        }
        
        
        
        
        
        
        
        
        
        
        
    }
    catch (e) {
        console.error(e);
    }
};