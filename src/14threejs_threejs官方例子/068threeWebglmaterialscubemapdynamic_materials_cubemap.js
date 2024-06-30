
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/068threeWebglmaterialscubemapdynamic
        // --materials_cubemap_dynamic--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_materials_cubemap_dynamic
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 60,
                near: 1,
                far: 1000,
                position: [0, 0, 75 ]
            },
            postProcess: {
                enable: false
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        let cube, sphere, torus, material;
        
        let cubeCamera, cubeRenderTarget;
        
        
        init();
        
        function init() {
        
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
        
            scene.rotation.y = 0.5; // avoid flying objects occluding the sun
        
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
            vjmap3d.LoadManager.hdrLoader
                .setPath( assetsPath + 'textures/equirectangular/' )
                .load( 'quarry_01_1k.hdr', function ( texture ) {
        
                    texture.mapping = THREE.EquirectangularReflectionMapping;
        
                    scene.background = texture;
                    scene.environment = texture;
        
                } );
        
            //
        
            cubeRenderTarget = new THREE.WebGLCubeRenderTarget( 256 );
            cubeRenderTarget.texture.type = THREE.HalfFloatType;
        
            cubeCamera = new THREE.CubeCamera( 1, 1000, cubeRenderTarget );
        
            //
        
            material = new THREE.MeshStandardMaterial( {
                envMap: cubeRenderTarget.texture,
                roughness: 0.05,
                metalness: 1
            } );
        
            const gui = new GUI();
            gui.add( material, 'roughness', 0, 1 );
            gui.add( material, 'metalness', 0, 1 );
            gui.add( renderer, 'toneMappingExposure', 0, 2 ).name( 'exposure' );
        
            sphere = new THREE.Mesh( new THREE.IcosahedronGeometry( 15, 8 ), material );
            scene.add( sphere );
        
            const material2 = new THREE.MeshStandardMaterial( {
                roughness: 0.1,
                metalness: 0
            } );
        
            cube = new THREE.Mesh( new THREE.BoxGeometry( 15, 15, 15 ), material2 );
            scene.add( cube );
        
            torus = new THREE.Mesh( new THREE.TorusKnotGeometry( 8, 3, 128, 16 ), material2 );
            scene.add( torus );
        
        
            app.signal.onAppUpdate.add(e => animate(e.elapsedTime))
        }
        
        
        function animate( msTime ) {
        
            const time = msTime;
        
            cube.position.x = Math.cos( time ) * 30;
            cube.position.y = Math.sin( time ) * 30;
            cube.position.z = Math.sin( time ) * 30;
        
            cube.rotation.x += 0.02;
            cube.rotation.y += 0.03;
        
            torus.position.x = Math.cos( time + 10 ) * 30;
            torus.position.y = Math.sin( time + 10 ) * 30;
            torus.position.z = Math.sin( time + 10 ) * 30;
        
            torus.rotation.x += 0.02;
            torus.rotation.y += 0.03;
        
            cubeCamera.update( renderer, scene );
        
        }
        
    }
    catch (e) {
        console.error(e);
    }
};