
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/127threeWebglshadersSky
        // --shaders_sky--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_shaders_sky
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            camera: {
                fov: 60,
                near: 100,
                far: 2000000,
                position: [ 0, 100, 2000 ]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        let sky, sun;
        
        init();
        
        function initSky() {
        
            // Add Sky
            sky = new Sky();
            sky.scale.setScalar( 450000 );
            scene.add( sky );
        
            sun = new THREE.Vector3();
        
            /// GUI
        
            const effectController = {
                turbidity: 10,
                rayleigh: 3,
                mieCoefficient: 0.005,
                mieDirectionalG: 0.7,
                elevation: 2,
                azimuth: 180,
                exposure: renderer.toneMappingExposure
            };
        
            function guiChanged() {
        
                const uniforms = sky.material.uniforms;
                uniforms[ 'turbidity' ].value = effectController.turbidity;
                uniforms[ 'rayleigh' ].value = effectController.rayleigh;
                uniforms[ 'mieCoefficient' ].value = effectController.mieCoefficient;
                uniforms[ 'mieDirectionalG' ].value = effectController.mieDirectionalG;
        
                const phi = THREE.MathUtils.degToRad( 90 - effectController.elevation );
                const theta = THREE.MathUtils.degToRad( effectController.azimuth );
        
                sun.setFromSphericalCoords( 1, phi, theta );
        
                uniforms[ 'sunPosition' ].value.copy( sun );
        
                renderer.toneMappingExposure = effectController.exposure;
                renderer.render( scene, camera );
        
            }
        
            const gui = new GUI();
        
            gui.add( effectController, 'turbidity', 0.0, 20.0, 0.1 ).onChange( guiChanged );
            gui.add( effectController, 'rayleigh', 0.0, 4, 0.001 ).onChange( guiChanged );
            gui.add( effectController, 'mieCoefficient', 0.0, 0.1, 0.001 ).onChange( guiChanged );
            gui.add( effectController, 'mieDirectionalG', 0.0, 1, 0.001 ).onChange( guiChanged );
            gui.add( effectController, 'elevation', 0, 90, 0.1 ).onChange( guiChanged );
            gui.add( effectController, 'azimuth', - 180, 180, 0.1 ).onChange( guiChanged );
            gui.add( effectController, 'exposure', 0, 1, 0.0001 ).onChange( guiChanged );
        
            guiChanged();
        
        }
        
        function init() {
        
            const helper = new THREE.GridHelper( 10000, 2, 0xffffff, 0xffffff );
            scene.add( helper );
        
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.toneMappingExposure = 0.5;
        
            initSky();
        
        
        }
        
        
        
        
        
        
        
        
        
        
        
        
    }
    catch (e) {
        console.error(e);
    }
};