
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/222miscLookat
        // --misc_lookat--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#misc_lookat
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            camera: {
                fov: 40,
                near: 1,
                far: 15000,
                position: [ 0, 0, 3200]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        let sphere;
        
        
        
        init();
        
        function init() {
        
            scene.background = new THREE.Color( 0xffffff );
        
            sphere = new THREE.Mesh( new THREE.SphereGeometry( 100, 20, 20 ), new THREE.MeshNormalMaterial() );
            scene.add( sphere );
        
            const geometry = new THREE.CylinderGeometry( 0, 10, 100, 12 );
            geometry.rotateX( Math.PI / 2 );
        
            const material = new THREE.MeshNormalMaterial();
        
            for ( let i = 0; i < 1000; i ++ ) {
        
                const mesh = new THREE.Mesh( geometry, material );
                mesh.position.x = Math.random() * 4000 - 2000;
                mesh.position.y = Math.random() * 4000 - 2000;
                mesh.position.z = Math.random() * 4000 - 2000;
                mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 4 + 2;
                scene.add( mesh );
        
            }
        
            app.signal.onAppUpdate.add(render)
        
        }
        
        
        function render() {
        
            const time = Date.now() * 0.0005;
        
            sphere.position.x = Math.sin( time * 0.7 ) * 2000;
            sphere.position.y = Math.cos( time * 0.5 ) * 2000;
            sphere.position.z = Math.cos( time * 0.3 ) * 2000;
        
            for ( let i = 1, l = scene.children.length; i < l; i ++ ) {
        
                scene.children[ i ].lookAt( sphere.position );
        
            }
        
            camera.position.x += ( app.Input.x() - camera.position.x ) * .05;
            camera.position.y += ( - app.Input.y() - camera.position.y ) * .05;
            camera.lookAt( scene.position );
        
        }
        
        
    }
    catch (e) {
        console.error(e);
    }
};