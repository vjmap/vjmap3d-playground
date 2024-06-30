
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/015threeWebglGeometryCsg
        // --geometry_csg--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_geometry_csg
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                background: 0xfce4ec,
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 50,
                near: 1,
                far: 100
            },
            control: {
                minDistance: 5,
                maxDistance: 75
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        let amLib = await vjmap3d.loadPluginAlgorithm(); // 加载算法插件库
        const { SUBTRACTION, INTERSECTION, ADDITION, Brush, Evaluator }  = amLib;
        
        camera.position.set( - 1, 1, 1 ).normalize().multiplyScalar( 10 );
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        let baseBrush, brush;
        let core;
        let result, evaluator, wireframe;
        
        const params = {
        
            operation: SUBTRACTION,
            useGroups: true,
            wireframe: false,
        
        };
        
        init();
        
        function init() {
        
            // lights
            const ambient = new THREE.HemisphereLight( 0xffffff, 0xbfd4d2, 3 );
            scene.add( ambient );
        
            const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.3 );
            directionalLight.position.set( 1, 4, 3 ).multiplyScalar( 3 );
            directionalLight.castShadow = true;
            directionalLight.shadow.mapSize.setScalar( 2048 );
            directionalLight.shadow.bias = - 1e-4;
            directionalLight.shadow.normalBias = 1e-4;
            scene.add( directionalLight );
        
           
            // add shadow plane
            const plane = new THREE.Mesh(
                new THREE.PlaneGeometry(),
                new THREE.ShadowMaterial( {
                    color: 0xd81b60,
                    transparent: true,
                    opacity: 0.075,
                    side: THREE.DoubleSide,
                } ),
            );
            plane.position.y = - 3;
            plane.rotation.x = - Math.PI / 2;
            plane.scale.setScalar( 10 );
            plane.receiveShadow = true;
            scene.add( plane );
        
            // create brushes
            evaluator = new Evaluator();
        
            baseBrush = new Brush(
                new THREE.IcosahedronGeometry( 2, 3 ),
                new THREE.MeshStandardMaterial( {
                    flatShading: true,
        
                    polygonOffset: true,
                    polygonOffsetUnits: 1,
                    polygonOffsetFactor: 1,
                } ),
            );
        
            brush = new Brush(
                new THREE.CylinderGeometry( 1, 1, 5, 45 ),
                new THREE.MeshStandardMaterial( {
                    color: 0x80cbc4,
        
                    polygonOffset: true,
                    polygonOffsetUnits: 1,
                    polygonOffsetFactor: 1,
        
                } ),
            );
        
            core = new Brush(
                new THREE.IcosahedronGeometry( 0.15, 1 ),
                new THREE.MeshStandardMaterial( {
                    flatShading: true,
                    color: 0xff9800,
                    emissive: 0xff9800,
                    emissiveIntensity: 0.35,
        
                    polygonOffset: true,
                    polygonOffsetUnits: 1,
                    polygonOffsetFactor: 1,
        
                } ),
            );
            core.castShadow = true;
            scene.add( core );
        
            // create wireframe
            wireframe = new THREE.Mesh(
                undefined,
                new THREE.MeshBasicMaterial( { color: 0x009688, wireframe: true } ),
            );
            scene.add( wireframe );
        
        
            app.signal.onAppUpdate.add(animate);
        
            // set up gui
            const gui = new GUI();
            gui.add( params, 'operation', { SUBTRACTION, INTERSECTION, ADDITION } );
            gui.add( params, 'wireframe' );
            gui.add( params, 'useGroups' );
        
           
        
        }
        
        function updateCSG() {
        
            evaluator.useGroups = params.useGroups;
            result = evaluator.evaluate( baseBrush, brush, params.operation, result );
        
            result.castShadow = true;
            result.receiveShadow = true;
            scene.add( result );
        
        }
        
        
        function animate() {
        
            // update the transforms
            const t = window.performance.now() + 9000;
            baseBrush.rotation.x = t * 0.0001;
            baseBrush.rotation.y = t * 0.00025;
            baseBrush.rotation.z = t * 0.0005;
            baseBrush.updateMatrixWorld();
        
            brush.rotation.x = t * - 0.0002;
            brush.rotation.y = t * - 0.0005;
            brush.rotation.z = t * - 0.001;
        
            const s = 0.5 + 0.5 * ( 1 + Math.sin( t * 0.001 ) );
            brush.scale.set( s, 1, s );
            brush.updateMatrixWorld();
        
            // update the csg
            updateCSG();
        
            wireframe.geometry = result.geometry;
            wireframe.visible = params.wireframe;
        
        }
    }
    catch (e) {
        console.error(e);
    }
};