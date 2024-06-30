
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/096threeWebglmathOrientationTransform
        // --math_orientation_transform--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_math_orientation_transform
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 70,
                near: 0.01,
                far: 10,
                position: [ 0, 0, 5 ]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        let mesh, target;
        
        const spherical = new THREE.Spherical();
        const rotationMatrix = new THREE.Matrix4();
        const targetQuaternion = new THREE.Quaternion();
        const clock = new THREE.Clock();
        const speed = 2;
        
        init();
        
        function init() {
        
            const geometry = new THREE.ConeGeometry( 0.1, 0.5, 8 );
            geometry.rotateX( Math.PI * 0.5 );
            const material = new THREE.MeshNormalMaterial();
        
            mesh = new THREE.Mesh( geometry, material );
            scene.add( mesh );
        
            //
        
            const targetGeometry = new THREE.SphereGeometry( 0.05 );
            const targetMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
            target = new THREE.Mesh( targetGeometry, targetMaterial );
            scene.add( target );
        
            //
        
            const sphereGeometry = new THREE.SphereGeometry( 2, 32, 32 );
            const sphereMaterial = new THREE.MeshBasicMaterial( { color: 0xcccccc, wireframe: true, transparent: true, opacity: 0.3 } );
            const sphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
            scene.add( sphere );
        
            //
        
            generateTarget();
        
            app.signal.onAppUpdate.add(animate)
        }
        
        
        function animate() {
        
            const delta = clock.getDelta();
        
            if ( ! mesh.quaternion.equals( targetQuaternion ) ) {
        
                const step = speed * delta;
                mesh.quaternion.rotateTowards( targetQuaternion, step );
        
            }
        
        
        }
        
        function generateTarget() {
        
            // generate a random point on a sphere
        
            spherical.theta = Math.random() * Math.PI * 2;
            spherical.phi = Math.acos( ( 2 * Math.random() ) - 1 );
            spherical.radius = 2;
        
            target.position.setFromSpherical( spherical );
        
            // compute target rotation
        
            rotationMatrix.lookAt( target.position, mesh.position, mesh.up );
            targetQuaternion.setFromRotationMatrix( rotationMatrix );
        
            setTimeout( generateTarget, 2000 );
        
        }
        
        
    }
    catch (e) {
        console.error(e);
    }
};