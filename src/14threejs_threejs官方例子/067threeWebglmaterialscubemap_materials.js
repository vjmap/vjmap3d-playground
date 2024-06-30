
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/067threeWebglmaterialscubemap
        // --materials_cubemap--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_materials_cubemap
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 50,
                near: 0.1,
                far: 100,
                position: [0, 0, 13 ]
            },
            control: {
               minPolarAngle: Math.PI / 4,
               maxPolarAngle: Math.PI / 1.5
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        let pointLight;
        
        init();
        
        function init() {
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
            //cubemap
            const path = assetsPath + 'textures/cube/SwedishRoyalCastle/';
            const format = '.jpg';
            const urls = [
                path + 'px' + format, path + 'nx' + format,
                path + 'py' + format, path + 'ny' + format,
                path + 'pz' + format, path + 'nz' + format
            ];
        
            const reflectionCube = new THREE.CubeTextureLoader().load( urls );
            const refractionCube = new THREE.CubeTextureLoader().load( urls );
            refractionCube.mapping = THREE.CubeRefractionMapping;
        
            scene.background = reflectionCube;
        
            //lights
            const ambient = new THREE.AmbientLight( 0xffffff, 3 );
            scene.add( ambient );
        
            pointLight = new THREE.PointLight( 0xffffff, 200 );
            scene.add( pointLight );
        
            //materials
            const cubeMaterial3 = new THREE.MeshLambertMaterial( { color: 0xffaa00, envMap: reflectionCube, combine: THREE.MixOperation, reflectivity: 0.3 } );
            const cubeMaterial2 = new THREE.MeshLambertMaterial( { color: 0xfff700, envMap: refractionCube, refractionRatio: 0.95 } );
            const cubeMaterial1 = new THREE.MeshLambertMaterial( { color: 0xffffff, envMap: reflectionCube } );
        
            //models
            const objLoader = vjmap3d.LoadManager.objLoader;
        
            objLoader.setPath(assetsPath + 'models/obj/walt/' );
            objLoader.load( 'WaltHead.obj', function ( object ) {
        
                const head = object.children[ 0 ];
                head.scale.setScalar( 0.1 );
                head.position.y = - 3;
                head.material = cubeMaterial1;
        
                const head2 = head.clone();
                head2.position.x = - 6;
                head2.material = cubeMaterial2;
        
                const head3 = head.clone();
                head3.position.x = 6;
                head3.material = cubeMaterial3;
        
                scene.add( head, head2, head3 );
        
            } );
        
        }
        
        
    }
    catch (e) {
        console.error(e);
    }
};