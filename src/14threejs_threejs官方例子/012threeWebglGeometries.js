
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/012threeWebglGeometries
        // --geometries--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_geometries
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 45,
                near: 1,
                far: 2000,
                position: [ 0, 400, 0  ]
            },
            control: {
                enable: false
            }
        })
        let scene = app.scene, camera = app.camera
        
        let assetsPath = "https://vjmap.com/map3d/resources/three/"
        init();
        
        function init() {
        
            let object;
        
            const ambientLight = new THREE.AmbientLight( 0xcccccc, 1.5 );
            scene.add( ambientLight );
        
            const pointLight = new THREE.PointLight( 0xffffff, 2.5, 0, 0 );
            camera.add( pointLight );
            scene.add( camera );
        
            const map = new THREE.TextureLoader().load( assetsPath + 'textures/uv_grid_opengl.jpg' );
            map.wrapS = map.wrapT = THREE.RepeatWrapping;
            map.anisotropy = 16;
            map.colorSpace = THREE.SRGBColorSpace;
        
            const material = new THREE.MeshPhongMaterial( { map: map, side: THREE.DoubleSide } );
        
            //
        
            object = new THREE.Mesh( new THREE.SphereGeometry( 75, 20, 10 ), material );
            object.position.set( - 300, 0, 200 );
            scene.add( object );
        
            object = new THREE.Mesh( new THREE.IcosahedronGeometry( 75, 1 ), material );
            object.position.set( - 100, 0, 200 );
            scene.add( object );
        
            object = new THREE.Mesh( new THREE.OctahedronGeometry( 75, 2 ), material );
            object.position.set( 100, 0, 200 );
            scene.add( object );
        
            object = new THREE.Mesh( new THREE.TetrahedronGeometry( 75, 0 ), material );
            object.position.set( 300, 0, 200 );
            scene.add( object );
        
            //
        
            object = new THREE.Mesh( new THREE.PlaneGeometry( 100, 100, 4, 4 ), material );
            object.position.set( - 300, 0, 0 );
            scene.add( object );
        
            object = new THREE.Mesh( new THREE.BoxGeometry( 100, 100, 100, 4, 4, 4 ), material );
            object.position.set( - 100, 0, 0 );
            scene.add( object );
        
            object = new THREE.Mesh( new THREE.CircleGeometry( 50, 20, 0, Math.PI * 2 ), material );
            object.position.set( 100, 0, 0 );
            scene.add( object );
        
            object = new THREE.Mesh( new THREE.RingGeometry( 10, 50, 20, 5, 0, Math.PI * 2 ), material );
            object.position.set( 300, 0, 0 );
            scene.add( object );
        
            //
        
            object = new THREE.Mesh( new THREE.CylinderGeometry( 25, 75, 100, 40, 5 ), material );
            object.position.set( - 300, 0, - 200 );
            scene.add( object );
        
            const points = [];
        
            for ( let i = 0; i < 50; i ++ ) {
        
                points.push( new THREE.Vector2( Math.sin( i * 0.2 ) * Math.sin( i * 0.1 ) * 15 + 50, ( i - 5 ) * 2 ) );
        
            }
        
            object = new THREE.Mesh( new THREE.LatheGeometry( points, 20 ), material );
            object.position.set( - 100, 0, - 200 );
            scene.add( object );
        
            object = new THREE.Mesh( new THREE.TorusGeometry( 50, 20, 20, 20 ), material );
            object.position.set( 100, 0, - 200 );
            scene.add( object );
        
            object = new THREE.Mesh( new THREE.TorusKnotGeometry( 50, 10, 50, 20 ), material );
            object.position.set( 300, 0, - 200 );
            scene.add( object );
        
            app.signal.onAppUpdate.add(render)
        }
        
        
        function render() {
        
            const timer = Date.now() * 0.0001;
        
            camera.position.x = Math.cos( timer ) * 800;
            camera.position.z = Math.sin( timer ) * 800;
        
            camera.lookAt( scene.position );
        
            scene.traverse( function ( object ) {
        
                if ( object.isMesh === true ) {
        
                    object.rotation.x = timer * 5;
                    object.rotation.y = timer * 2.5;
        
                }
        
            } );
        
          
        }
        
    }
    catch (e) {
        console.error(e);
    }
};