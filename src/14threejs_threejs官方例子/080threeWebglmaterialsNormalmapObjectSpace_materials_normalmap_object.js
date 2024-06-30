
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/080threeWebglmaterialsNormalmapObjectSpace
        // --materials_normalmap_object_space--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_materials_normalmap_object_space
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                background: 0x000000,
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 40,
                near: 1,
                far: 1000,
                position: [ 0, 0, 120  ]
            },
            control: {
                minDistance: 50,
                maxDistance: 300
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        init();
        
        function init() {
        
        
            // ambient
            scene.add( new THREE.AmbientLight( 0xffffff, 0.6 ) );
        
            // light
            const light = new THREE.PointLight( 0xffffff, 4.5, 0, 0 );
            camera.add( light );
        
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
            // model
            vjmap3d.ResManager.loadRes(assetsPath + 'models/gltf/Nefertiti/Nefertiti.glb', false).then( ( gltf ) => {
        
                gltf.scene.traverse( function ( child ) {
        
                    if ( child.isMesh ) {
        
                        // glTF currently supports only tangent-space normal maps.
                        // this model has been modified to demonstrate the use of an object-space normal map.
        
                        child.material.normalMapType = THREE.ObjectSpaceNormalMap;
        
                        // attribute normals are not required with an object-space normal map. remove them.
        
                        child.geometry.deleteAttribute( 'normal' );
        
                        //
        
                        child.material.side = THREE.DoubleSide;
        
                        child.scale.multiplyScalar( 0.5 );
        
                        // recenter
        
                        new THREE.Box3().setFromObject( child ).getCenter( child.position ).multiplyScalar( - 1 );
        
                        scene.add( child );
        
                    }
        
                } );
        
        
            } );
        
        
        }
        
    }
    catch (e) {
        console.error(e);
    }
};