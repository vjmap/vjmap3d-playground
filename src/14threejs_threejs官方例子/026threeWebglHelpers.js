
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/026threeWebglHelpers
        // --helpers--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_helpers
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 70,
                near: 1, 
                far: 1000,
                position: [ 0, 0 , 400 ]
            },
            control: {
                enable: false
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        let light;
        let vnh;
        let vth;
        
        init();
        
        function init() {
           
            light = new THREE.PointLight();
            light.position.set( 200, 100, 150 );
            scene.add( light );
        
            scene.add( new THREE.PointLightHelper( light, 15 ) );
        
            const gridHelper = new THREE.GridHelper( 400, 40, 0x0000ff, 0x808080 );
            gridHelper.position.y = - 150;
            gridHelper.position.x = - 150;
            scene.add( gridHelper );
        
            const polarGridHelper = new THREE.PolarGridHelper( 200, 16, 8, 64, 0x0000ff, 0x808080 );
            polarGridHelper.position.y = - 150;
            polarGridHelper.position.x = 200;
            scene.add( polarGridHelper );
        
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
        
            vjmap3d.ResManager.loadRes(assetsPath + 'models/gltf/LeePerrySmith/LeePerrySmith.glb', false).then(( gltf ) => {
        
                const mesh = gltf.scene.children[ 0 ];
        
                mesh.geometry.computeTangents(); // generates bad data due to degenerate UVs
        
                const group = new THREE.Group();
                group.scale.multiplyScalar( 50 );
                scene.add( group );
        
                // To make sure that the matrixWorld is up to date for the boxhelpers
                group.updateMatrixWorld( true );
        
                group.add( mesh );
        
                vnh = new VertexNormalsHelper( mesh, 5 );
                scene.add( vnh );
        
                vth = new VertexTangentsHelper( mesh, 5 );
                scene.add( vth );
        
                scene.add( new THREE.BoxHelper( mesh ) );
        
                const wireframe = new THREE.WireframeGeometry( mesh.geometry );
                let line = new THREE.LineSegments( wireframe );
                line.material.depthTest = false;
                line.material.opacity = 0.25;
                line.material.transparent = true;
                line.position.x = 4;
                group.add( line );
                scene.add( new THREE.BoxHelper( line ) );
        
                const edges = new THREE.EdgesGeometry( mesh.geometry );
                line = new THREE.LineSegments( edges );
                line.material.depthTest = false;
                line.material.opacity = 0.25;
                line.material.transparent = true;
                line.position.x = - 4;
                group.add( line );
                scene.add( new THREE.BoxHelper( line ) );
        
                scene.add( new THREE.BoxHelper( group ) );
                scene.add( new THREE.BoxHelper( scene ) );
        
        
            } );
            
        
            app.signal.onAppUpdate.add(animate)
        }
        
        
        
        function animate() {
        
            const time = - performance.now() * 0.0003;
        
            camera.position.x = 400 * Math.cos( time );
            camera.position.z = 400 * Math.sin( time );
            camera.lookAt( scene.position );
        
            light.position.x = Math.sin( time * 1.7 ) * 300;
            light.position.y = Math.cos( time * 1.5 ) * 400;
            light.position.z = Math.cos( time * 1.3 ) * 300;
        
            if ( vnh ) vnh.update();
            if ( vth ) vth.update();
        
        
        }
    }
    catch (e) {
        console.error(e);
    }
};