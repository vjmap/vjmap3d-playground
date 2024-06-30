
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/106threeWebglmorphtargetsFace
        // --morphtargets_face--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_morphtargets_face
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                background: 0x666666,
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 45,
                near: 1,
                far: 20,
                position: [- 1.8, 0.8, 3]
            },
            control: {
                minDistance: 2.5,
                maxDistance: 5,
                minAzimuthAngle: - Math.PI / 2,
                maxAzimuthAngle: Math.PI / 2,
                maxPolarAngle:  Math.PI / 1.8,
                target:  [ 0, 0.15, - 0.2 ]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        let mixer;
        
        init();
        
        function init() {
        
        
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
        
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
           
            vjmap3d.ResManager.loadRes(  assetsPath + 'models/gltf/facecap.glb', false).then( ( gltf ) => {
        
                    const mesh = gltf.scene.children[ 0 ];
        
                    scene.add( mesh );
        
                    mixer = new THREE.AnimationMixer( mesh );
        
                    mixer.clipAction( gltf.animations[ 0 ] ).play();
        
                    // GUI
        
                    const head = mesh.getObjectByName( 'mesh_2' );
                    const influences = head.morphTargetInfluences;
        
                    const gui = new GUI();
                    gui.close();
        
                    for ( const [ key, value ] of Object.entries( head.morphTargetDictionary ) ) {
        
                        gui.add( influences, value, 0, 1, 0.01 )
                            .name( key.replace( 'blendShape1.', '' ) )
                            .listen();
        
                    }
        
                } );
        
            const environment = new RoomEnvironment( renderer );
            const pmremGenerator = new THREE.PMREMGenerator( renderer );
        
            scene.environment = pmremGenerator.fromScene( environment ).texture;
        
            app.signal.onAppUpdate.add(e => animate(e))
        }
        
        
        function animate(e) {
        
            const delta = e.deltaTime;
        
            if ( mixer ) {
        
                mixer.update( delta );
        
            }
        
        }
        
    }
    catch (e) {
        console.error(e);
    }
};