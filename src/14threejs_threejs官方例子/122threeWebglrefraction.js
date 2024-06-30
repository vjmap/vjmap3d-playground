
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/122threeWebglrefraction
        // --refraction--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_refraction
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                background: 0xeeeeee,
                defaultLights: false
            },
            camera: {
                fov: 45,
                near: 1,
                far: 500,
                position: [ 0, 75, 160  ]
            },
            control: {
                target: [0, 40, 0],
                maxDistance: 400,
                minDistance:10
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        let refractor, smallSphere;
        
        init();
        
        async function init() {
           
            // refractor
        
            const refractorGeometry = new THREE.PlaneGeometry( 90, 90 );
        
            refractor = new Refractor( refractorGeometry, {
                color: 0xcbcbcb,
                textureWidth: 1024,
                textureHeight: 1024,
                shader: WaterRefractionShader
            } );
        
            refractor.position.set( 0, 50, 0 );
        
            scene.add( refractor );
        
            // load dudv map for distortion effect
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
            const loader = new THREE.TextureLoader();
            const dudvMap = await loader.loadAsync(assetsPath + 'textures/waterdudv.jpg' );
        
            dudvMap.wrapS = dudvMap.wrapT = THREE.RepeatWrapping;
            refractor.material.uniforms.tDudv.value = dudvMap;
        
            //
        
            const geometry = new THREE.IcosahedronGeometry( 5, 0 );
            const material = new THREE.MeshPhongMaterial( { color: 0xffffff, emissive: 0x333333, flatShading: true } );
            smallSphere = new THREE.Mesh( geometry, material );
            scene.add( smallSphere );
        
            // walls
            const planeGeo = new THREE.PlaneGeometry( 100.1, 100.1 );
        
            const planeTop = new THREE.Mesh( planeGeo, new THREE.MeshPhongMaterial( { color: 0xffffff } ) );
            planeTop.position.y = 100;
            planeTop.rotateX( Math.PI / 2 );
            scene.add( planeTop );
        
            const planeBottom = new THREE.Mesh( planeGeo, new THREE.MeshPhongMaterial( { color: 0xffffff } ) );
            planeBottom.rotateX( - Math.PI / 2 );
            scene.add( planeBottom );
        
            const planeBack = new THREE.Mesh( planeGeo, new THREE.MeshPhongMaterial( { color: 0x7f7fff } ) );
            planeBack.position.z = - 50;
            planeBack.position.y = 50;
            scene.add( planeBack );
        
            const planeRight = new THREE.Mesh( planeGeo, new THREE.MeshPhongMaterial( { color: 0x00ff00 } ) );
            planeRight.position.x = 50;
            planeRight.position.y = 50;
            planeRight.rotateY( - Math.PI / 2 );
            scene.add( planeRight );
        
            const planeLeft = new THREE.Mesh( planeGeo, new THREE.MeshPhongMaterial( { color: 0xff0000 } ) );
            planeLeft.position.x = - 50;
            planeLeft.position.y = 50;
            planeLeft.rotateY( Math.PI / 2 );
            scene.add( planeLeft );
        
            // lights
            const mainLight = new THREE.PointLight( 0xe7e7e7, 2.5, 250, 0 );
            mainLight.position.y = 60;
            scene.add( mainLight );
        
            const greenLight = new THREE.PointLight( 0x00ff00, 0.5, 1000, 0 );
            greenLight.position.set( 550, 50, 0 );
            scene.add( greenLight );
        
            const redLight = new THREE.PointLight( 0xff0000, 0.5, 1000, 0 );
            redLight.position.set( - 550, 50, 0 );
            scene.add( redLight );
        
            const blueLight = new THREE.PointLight( 0xbbbbfe, 0.5, 1000, 0 );
            blueLight.position.set( 0, 50, 550 );
            scene.add( blueLight );
        
            app.signal.onAppUpdate.add(e => animate(e))
        }
        
        
        function animate(e) {
        
            const time = e.elapsedTime;
        
            refractor.material.uniforms.time.value = time;
        
            smallSphere.position.set(
                Math.cos( time ) * 30,
                Math.abs( Math.cos( time * 2 ) ) * 20 + 5,
                Math.sin( time ) * 30
            );
            smallSphere.rotation.y = ( Math.PI / 2 ) - time;
            smallSphere.rotation.z = time * 8;
        
        
        }
        
        
        
        
        
        
        
    }
    catch (e) {
        console.error(e);
    }
};