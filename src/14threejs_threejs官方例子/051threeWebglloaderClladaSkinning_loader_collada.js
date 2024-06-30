
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/051threeWebglloaderClladaSkinning
        // --loader_collada_skinning--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_loader_collada_skinning
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 25,
                near: 1, 
                far: 1000,
                position: [ 15, 10, - 15 ]
            },
            control: {
                minDistance: 5,
                maxDistance: 40,
                target: [0, 2, 0 ]
            },
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        let mixer;
        
        // 加载插件
        await vjmap3d.ResManager.loadExtensionLoader();
        init();
        
        async function init() {
        
        
            // collada
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
        
            let entity = await vjmap3d.ResManager.loadModel(assetsPath + './models/collada/stormtrooper/stormtrooper.dae')
            entity.addTo(app);
            entity.getModule(vjmap3d.AnimatorModule)?.getAnimator()?.play(); // 播放动画
        
            const gridHelper = new THREE.GridHelper( 10, 20, 0xc1c1c1, 0x8d8d8d );
            scene.add( gridHelper );
        
            //
        
            const ambientLight = new THREE.AmbientLight( 0xffffff, 0.6 );
            scene.add( ambientLight );
        
            const directionalLight = new THREE.DirectionalLight( 0xffffff, 3 );
            directionalLight.position.set( 1.5, 1, - 1.5 );
            scene.add( directionalLight );
        
        
        }
        
        
    }
    catch (e) {
        console.error(e);
    }
};