
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/064threeWebglmaterialsbumpmap
        // --materials_bumpmap--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_materials_bumpmap
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                background: 0x060708,
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 27,
                near: 0.1,
                far: 100,
                position: [ 0, 0, 12 ]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        let mesh;
        
        let spotLight;
        
        
        init();
        
        function init() {
            // LIGHTS
        
            scene.add( new THREE.HemisphereLight( 0x8d7c7c, 0x494966, 3 ) );
        
            spotLight = new THREE.SpotLight( 0xffffde, 200 );
            spotLight.position.set( 3.5, 0, 7 );
            scene.add( spotLight );
        
            spotLight.castShadow = true;
        
            spotLight.shadow.mapSize.width = 2048;
            spotLight.shadow.mapSize.height = 2048;
        
            spotLight.shadow.camera.near = 2;
            spotLight.shadow.camera.far = 15;
        
            spotLight.shadow.camera.fov = 40;
        
            spotLight.shadow.bias = - 0.005;
        
            //
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
        
            const mapHeight = new THREE.TextureLoader().load(assetsPath +  'models/gltf/LeePerrySmith/Infinite-Level_02_Disp_NoSmoothUV-4096.jpg' );
        
            const material = new THREE.MeshPhongMaterial( {
                color: 0x9c6e49,
                specular: 0x666666,
                shininess: 25,
                bumpMap: mapHeight,
                bumpScale: 10
            } );
        
            vjmap3d.ResManager.loadRes(assetsPath +  'models/gltf/LeePerrySmith/LeePerrySmith.glb', false).then( ( gltf ) => {
        
                createScene( gltf.scene.children[ 0 ].geometry, 1, material );
        
            } );
        
            renderer.shadowMap.enabled = true;
        
        }
        
        function createScene( geometry, scale, material ) {
        
            mesh = new THREE.Mesh( geometry, material );
        
            mesh.position.y = - 0.5;
            mesh.scale.set( scale, scale, scale );
        
            mesh.castShadow = true;
            mesh.receiveShadow = true;
        
            scene.add( mesh );
        
        }
        
        
    }
    catch (e) {
        console.error(e);
    }
};