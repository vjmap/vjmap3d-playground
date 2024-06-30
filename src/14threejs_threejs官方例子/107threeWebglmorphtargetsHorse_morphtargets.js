
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/107threeWebglmorphtargetsHorse
        // --morphtargets_horse--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_morphtargets_horse
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                background: 0xf0f0f0,
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 50,
                near: 1,
                far: 10000,
                position: [0, 0, 300]
            },
            control: {
               enable: false
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        let mesh, mixer;
        
        const radius = 600;
        let theta = 0;
        let prevTime = Date.now();
        
        init();
        
        function init() {
        
            //
        
            const light1 = new THREE.DirectionalLight( 0xefefff, 5 );
            light1.position.set( 1, 1, 1 ).normalize();
            scene.add( light1 );
        
            const light2 = new THREE.DirectionalLight( 0xffefef, 5 );
            light2.position.set( - 1, - 1, - 1 ).normalize();
            scene.add( light2 );
        
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
            vjmap3d.ResManager.loadRes( assetsPath + 'models/gltf/Horse.glb', false).then( ( gltf ) => {
        
                mesh = gltf.scene.children[ 0 ];
                mesh.scale.set( 1.5, 1.5, 1.5 );
                scene.add( mesh );
        
                mixer = new THREE.AnimationMixer( mesh );
        
                mixer.clipAction( gltf.animations[ 0 ] ).setDuration( 1 ).play();
        
            } );
        
        
            app.signal.onAppRender.add(render)
        }
        
        function render() {
        
            theta += 0.1;
        
            camera.position.x = radius * Math.sin( THREE.MathUtils.degToRad( theta ) );
            camera.position.z = radius * Math.cos( THREE.MathUtils.degToRad( theta ) );
        
            camera.lookAt( 0, 150, 0 );
        
            if ( mixer ) {
        
                const time = Date.now();
        
                mixer.update( ( time - prevTime ) * 0.001 );
        
                prevTime = time;
        
            }
        
        
        }
        
    }
    catch (e) {
        console.error(e);
    }
};