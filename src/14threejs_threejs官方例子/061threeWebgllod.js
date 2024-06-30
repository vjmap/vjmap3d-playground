
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/061threeWebgllod
        // --lod--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_lod
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
                far: 15000,
                position: [  0, 0, 1000 ]
            },
            control: {
                enable: false
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        let controls;
        init();
        
        function init() {
        
            scene.fog = new THREE.Fog( 0x000000, 1, 15000 );
        
            const pointLight = new THREE.PointLight( 0xff2200, 3, 0, 0 );
            pointLight.position.set( 0, 0, 0 );
            scene.add( pointLight );
        
            const dirLight = new THREE.DirectionalLight( 0xffffff, 3 );
            dirLight.position.set( 0, 0, 1 ).normalize();
            scene.add( dirLight );
        
            const geometry = [
        
                [ new THREE.IcosahedronGeometry( 100, 16 ), 50 ],
                [ new THREE.IcosahedronGeometry( 100, 8 ), 300 ],
                [ new THREE.IcosahedronGeometry( 100, 4 ), 1000 ],
                [ new THREE.IcosahedronGeometry( 100, 2 ), 2000 ],
                [ new THREE.IcosahedronGeometry( 100, 1 ), 8000 ]
        
            ];
        
            const material = new THREE.MeshLambertMaterial( { color: 0xffffff, wireframe: true } );
        
            for ( let j = 0; j < 1000; j ++ ) {
        
                const lod = new THREE.LOD();
        
                for ( let i = 0; i < geometry.length; i ++ ) {
        
                    const mesh = new THREE.Mesh( geometry[ i ][ 0 ], material );
                    mesh.scale.set( 1.5, 1.5, 1.5 );
                    mesh.updateMatrix();
                    mesh.matrixAutoUpdate = false;
                    lod.addLevel( mesh, geometry[ i ][ 1 ] );
        
                }
        
                lod.position.x = 10000 * ( 0.5 - Math.random() );
                lod.position.y = 7500 * ( 0.5 - Math.random() );
                lod.position.z = 10000 * ( 0.5 - Math.random() );
                lod.updateMatrix();
                lod.matrixAutoUpdate = false;
                scene.add( lod );
        
            }
        
        
            //
        
            controls = new FlyControls( camera, renderer.domElement );
            controls.movementSpeed = 1000;
            controls.rollSpeed = Math.PI / 10;
        
            app.signal.onAppUpdate.add(e => controls.update( e.deltaTime ))
        }
        
        
        
    }
    catch (e) {
        console.error(e);
    }
};