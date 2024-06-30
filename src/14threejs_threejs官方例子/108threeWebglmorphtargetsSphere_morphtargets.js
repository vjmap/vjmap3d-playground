
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/108threeWebglmorphtargetsSphere
        // --morphtargets_sphere--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_morphtargets_sphere
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 45,
                near: 0.2,
                far: 100,
                position: [0, 5, 5]
            },
            control: {
              minDistance: 1,
              maxDistance: 20
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        let mesh;
        
        let sign = 1;
        const speed = 0.5;
        
        init();
        
        function init() {
        
        
            const light1 = new THREE.PointLight( 0xff2200, 50000 );
            light1.position.set( 100, 100, 100 );
            scene.add( light1 );
        
            const light2 = new THREE.PointLight( 0x22ff00, 10000 );
            light2.position.set( - 100, - 100, - 100 );
            scene.add( light2 );
        
            scene.add( new THREE.AmbientLight( 0x111111 ) );
        
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
            vjmap3d.ResManager.loadRes( assetsPath + 'models/gltf/AnimatedMorphSphere/glTF/AnimatedMorphSphere.gltf', false).then( ( gltf ) => {
        
                mesh = gltf.scene.getObjectByName( 'AnimatedMorphSphere' );
                mesh.rotation.z = Math.PI / 2;
                scene.add( mesh );
        
                //
        
                const pointsMaterial = new THREE.PointsMaterial( {
                    size: 10,
                    sizeAttenuation: false,
                    map: new THREE.TextureLoader().load(assetsPath +  'textures/sprites/disc.png' ),
                    alphaTest: 0.5
                } );
        
                const points = new THREE.Points( mesh.geometry, pointsMaterial );
                points.morphTargetInfluences = mesh.morphTargetInfluences;
                points.morphTargetDictionary = mesh.morphTargetDictionary;
                mesh.add( points );
        
            } );
        
            app.signal.onAppUpdate.add(e => render(e))
        
        }
        
        
        function render(e) {
        
            const delta = e.deltaTime;
        
            if ( mesh !== undefined ) {
        
                const step = delta * speed;
        
                mesh.rotation.y += step;
        
                mesh.morphTargetInfluences[ 1 ] = mesh.morphTargetInfluences[ 1 ] + step * sign;
        
                if ( mesh.morphTargetInfluences[ 1 ] <= 0 || mesh.morphTargetInfluences[ 1 ] >= 1 ) {
        
                    sign *= - 1;
        
                }
        
            }
        
        }
        
    }
    catch (e) {
        console.error(e);
    }
};