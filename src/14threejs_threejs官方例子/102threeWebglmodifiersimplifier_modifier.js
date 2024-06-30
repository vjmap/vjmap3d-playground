
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/102threeWebglmodifiersimplifier
        // --modifier_simplifier--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_modifier_simplifier
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 40,
                near: 1,
                far: 1000,
                position: [0, 0, 15 ]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        init();
        
        function init() {
        
            scene.add( new THREE.AmbientLight( 0xffffff, 0.6 ) );
        
            const light = new THREE.PointLight( 0xffffff, 400 );
            camera.add( light );
            scene.add( camera );
        
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
            vjmap3d.ResManager.loadRes(assetsPath + 'models/gltf/LeePerrySmith/LeePerrySmith.glb', false).then( ( gltf ) => {
        
                const mesh = gltf.scene.children[ 0 ];
                mesh.position.x = - 3;
                mesh.rotation.y = Math.PI / 2;
                scene.add( mesh );
        
                const modifier = new SimplifyModifier();
        
                const simplified = mesh.clone();
                simplified.material = simplified.material.clone();
                simplified.material.flatShading = true;
                const count = Math.floor( simplified.geometry.attributes.position.count * 0.875 ); // number of vertices to remove
                simplified.geometry = modifier.modify( simplified.geometry, count );
        
                simplified.position.x = 3;
                simplified.rotation.y = - Math.PI / 2;
                scene.add( simplified );
        
        
            } );
        
        
        }
        
        
    }
    catch (e) {
        console.error(e);
    }
};