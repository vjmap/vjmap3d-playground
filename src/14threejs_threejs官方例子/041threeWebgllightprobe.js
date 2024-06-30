
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/041threeWebgllightprobe
        // --lightprobe--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_lightprobe
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            camera: {
                fov: 40,
                near: 1, 
                far: 1000,
                position: [ 0, 0, 30 ]
            },
            control: {
                minDistance: 10,
                maxDistance: 50
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        let mesh;
        
        let gui;
        
        let lightProbe;
        let directionalLight;
        
        // linear color space
        const API = {
            lightProbeIntensity: 1.0,
            directionalLightIntensity: 0.6,
            envMapIntensity: 1
        };
        
        init();
        
        function init() {
        
        
            // tone mapping
            renderer.toneMapping = THREE.NoToneMapping;
        
            // camera
            camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 1000 );
            camera.position.set( 0, 0, 30 );
        
            // probe
            lightProbe = new THREE.LightProbe();
            scene.add( lightProbe );
        
            // light
            directionalLight = new THREE.DirectionalLight( 0xffffff, API.directionalLightIntensity );
            directionalLight.position.set( 10, 10, 10 );
            scene.add( directionalLight );
        
            // envmap
            const genCubeUrls = function ( prefix, postfix ) {
        
                return [
                    prefix + 'px' + postfix, prefix + 'nx' + postfix,
                    prefix + 'py' + postfix, prefix + 'ny' + postfix,
                    prefix + 'pz' + postfix, prefix + 'nz' + postfix
                ];
        
            };
        
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
        
            const urls = genCubeUrls(assetsPath + 'textures/cube/pisa/', '.png' );
        
            new THREE.CubeTextureLoader().load( urls, function ( cubeTexture ) {
        
                scene.background = cubeTexture;
        
                lightProbe.copy( LightProbeGenerator.fromCubeTexture( cubeTexture ) );
        
                const geometry = new THREE.SphereGeometry( 5, 64, 32 );
                //const geometry = new THREE.TorusKnotGeometry( 4, 1.5, 256, 32, 2, 3 );
        
                const material = new THREE.MeshStandardMaterial( {
                    color: 0xffffff,
                    metalness: 0,
                    roughness: 0,
                    envMap: cubeTexture,
                    envMapIntensity: API.envMapIntensity,
                } );
        
                // mesh
                mesh = new THREE.Mesh( geometry, material );
                scene.add( mesh );
        
              
        
            } );
        
        
            // gui
            gui = new GUI( { title: 'Intensity' } );
        
            gui.add( API, 'lightProbeIntensity', 0, 1, 0.02 )
                .name( 'light probe' )
                .onChange( function () {
        
                    lightProbe.intensity = API.lightProbeIntensity; 
        
                } );
        
            gui.add( API, 'directionalLightIntensity', 0, 1, 0.02 )
                .name( 'directional light' )
                .onChange( function () {
        
                    directionalLight.intensity = API.directionalLightIntensity; 
        
                } );
        
            gui.add( API, 'envMapIntensity', 0, 1, 0.02 )
                .name( 'envMap' )
                .onChange( function () {
        
                    mesh.material.envMapIntensity = API.envMapIntensity; 
        
                } );
        
        
        }
    }
    catch (e) {
        console.error(e);
    }
};