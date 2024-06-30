
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/030threeWebglinstancingRaycast
        // --instancing_raycast--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_instancing_raycast
        const amount = parseInt( window.location.search.slice( 1 ) ) || 10;
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 60,
                near: 0.1, 
                far: 100,
                position: [amount, amount, amount ],
                lookAt: [0, 0, 0]
            },
            control: {
                target: [0, 0, 0]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        let mesh;
        
        const count = Math.pow( amount, 3 );
        
        const color = new THREE.Color();
        const white = new THREE.Color().setHex( 0xffffff );
        
        init();
        
        function init() {
           
            const light = new THREE.HemisphereLight( 0xffffff, 0x888888, 3 );
            light.position.set( 0, 1, 0 );
            scene.add( light );
        
            const geometry = new THREE.IcosahedronGeometry( 0.5, 3 );
            const material = new THREE.MeshPhongMaterial( { color: 0xffffff } );
        
            mesh = new THREE.InstancedMesh( geometry, material, count );
        
            let i = 0;
            const offset = ( amount - 1 ) / 2;
        
            const matrix = new THREE.Matrix4();
        
            for ( let x = 0; x < amount; x ++ ) {
        
                for ( let y = 0; y < amount; y ++ ) {
        
                    for ( let z = 0; z < amount; z ++ ) {
        
                        matrix.setPosition( offset - x, offset - y, offset - z );
        
                        mesh.setMatrixAt( i, matrix );
                        mesh.setColorAt( i, color );
        
                        i ++;
        
                    }
        
                }
        
            }
        
            scene.add( mesh );
        
            //
        
            const gui = new GUI();
            gui.add( mesh, 'count', 0, count );
        
            let entity = vjmap3d.Entity.attchObject(mesh);
            entity.pointerEvents = true;
            entity.signal.onMouseMove.add(e => {
                const instanceId = e.intersection.instanceId;
        
                mesh.getColorAt( instanceId, color );
        
                if ( color.equals( white ) ) {
        
                    mesh.setColorAt( instanceId, color.setHex( Math.random() * 0xffffff ) );
        
                    mesh.instanceColor.needsUpdate = true;
        
                }
            })
        
        }
        
    }
    catch (e) {
        console.error(e);
    }
};