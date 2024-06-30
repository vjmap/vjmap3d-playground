
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/126threeWebglshadersOcean
        // --shaders_ocean--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_shaders_ocean
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            camera: {
                fov: 55,
                near: 1,
                far: 20000,
                position: [30, 30, 100]
            },
            control: {
               maxPolarAngle: Math.PI * 0.495,
               target: [ 0, 10, 0 ],
               minDistance: 40.0,
               maxDistance: 200.0
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        let  water, sun, mesh;
        
        init();
        
        function init() {
        
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.toneMappingExposure = 0.5;
           
            //
        
            sun = new THREE.Vector3();
        
            // Water
        
            const waterGeometry = new THREE.PlaneGeometry( 10000, 10000 );
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
            water = new Water(
                waterGeometry,
                {
                    textureWidth: 512,
                    textureHeight: 512,
                    waterNormals: new THREE.TextureLoader().load(assetsPath + 'textures/waternormals.jpg', function ( texture ) {
        
                        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        
                    } ),
                    sunDirection: new THREE.Vector3(),
                    sunColor: 0xffffff,
                    waterColor: 0x001e0f,
                    distortionScale: 3.7,
                    fog: scene.fog !== undefined
                }
            );
        
            water.rotation.x = - Math.PI / 2;
        
            scene.add( water );
        
            // Skybox
        
            const sky = new Sky();
            sky.scale.setScalar( 10000 );
            scene.add( sky );
        
            const skyUniforms = sky.material.uniforms;
        
            skyUniforms[ 'turbidity' ].value = 10;
            skyUniforms[ 'rayleigh' ].value = 2;
            skyUniforms[ 'mieCoefficient' ].value = 0.005;
            skyUniforms[ 'mieDirectionalG' ].value = 0.8;
        
            const parameters = {
                elevation: 2,
                azimuth: 180
            };
        
            const pmremGenerator = new THREE.PMREMGenerator( renderer );
            const sceneEnv = new THREE.Scene();
        
            let renderTarget;
        
            function updateSun() {
        
                const phi = THREE.MathUtils.degToRad( 90 - parameters.elevation );
                const theta = THREE.MathUtils.degToRad( parameters.azimuth );
        
                sun.setFromSphericalCoords( 1, phi, theta );
        
                sky.material.uniforms[ 'sunPosition' ].value.copy( sun );
                water.material.uniforms[ 'sunDirection' ].value.copy( sun ).normalize();
        
                if ( renderTarget !== undefined ) renderTarget.dispose();
        
                sceneEnv.add( sky );
                renderTarget = pmremGenerator.fromScene( sceneEnv );
                scene.add( sky );
        
                scene.environment = renderTarget.texture;
        
            }
        
            updateSun();
        
            //
        
            const geometry = new THREE.BoxGeometry( 30, 30, 30 );
            const material = new THREE.MeshStandardMaterial( { roughness: 0 } );
        
            mesh = new THREE.Mesh( geometry, material );
            scene.add( mesh );
        
           
            // GUI
        
            const gui = new GUI();
        
            const folderSky = gui.addFolder( 'Sky' );
            folderSky.add( parameters, 'elevation', 0, 90, 0.1 ).onChange( updateSun );
            folderSky.add( parameters, 'azimuth', - 180, 180, 0.1 ).onChange( updateSun );
            folderSky.open();
        
            const waterUniforms = water.material.uniforms;
        
            const folderWater = gui.addFolder( 'Water' );
            folderWater.add( waterUniforms.distortionScale, 'value', 0, 8, 0.1 ).name( 'distortionScale' );
            folderWater.add( waterUniforms.size, 'value', 0.1, 10, 0.1 ).name( 'size' );
            folderWater.open();
        
            //
        
            app.signal.onAppUpdate.add(render)
        
        }
        
        
        function render() {
        
            const time = performance.now() * 0.001;
        
            mesh.position.y = Math.sin( time ) * 20 + 5;
            mesh.rotation.x = time * 0.5;
            mesh.rotation.z = time * 0.51;
        
            water.material.uniforms[ 'time' ].value += 1.0 / 60.0;
        
        }
        
        
        
        
        
        
        
        
        
        
        
        
    }
    catch (e) {
        console.error(e);
    }
};