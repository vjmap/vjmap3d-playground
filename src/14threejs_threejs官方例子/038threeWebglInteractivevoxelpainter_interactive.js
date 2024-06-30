
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/038threeWebglInteractivevoxelpainter
        // --interactive_voxelpainter--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_interactive_voxelpainter
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                background: 0xf0f0f0,
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 45,
                near: 1, 
                far: 10000,
                position: [ 500, 800, 1300 ],
                lookAt: [0, 0, 0 ]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        let plane;
        let pointer, raycaster;
        
        let rollOverMesh, rollOverMaterial;
        let cubeGeo, cubeMaterial;
        
        
        init();
        
        function init() {
        
            // roll-over helpers
        
            const rollOverGeo = new THREE.BoxGeometry( 50, 50, 50 );
            rollOverMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, opacity: 0.5, transparent: true } );
            rollOverMesh = new THREE.Mesh( rollOverGeo, rollOverMaterial );
            scene.add( rollOverMesh );
        
            // cubes
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
        
            const map = vjmap3d.ResManager.loadTexture(assetsPath +  'textures/square-outline-textured.png', true );
            map.colorSpace = THREE.SRGBColorSpace;
            cubeGeo = new THREE.BoxGeometry( 50, 50, 50 );
            cubeMaterial = new THREE.MeshLambertMaterial( { color: 0xfeb74c, map: map } );
        
            // grid
        
            const gridHelper = new THREE.GridHelper( 1000, 20 );
            scene.add( gridHelper );
        
            //
        
            raycaster = new THREE.Raycaster();
            pointer = new THREE.Vector2();
        
            const geometry = new THREE.PlaneGeometry( 1000, 1000 );
            geometry.rotateX( - Math.PI / 2 );
        
            plane = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { visible: false } ) );
            scene.add( plane );
           
        
            // lights
        
            const ambientLight = new THREE.AmbientLight( 0x606060, 3 );
            scene.add( ambientLight );
        
            const directionalLight = new THREE.DirectionalLight( 0xffffff, 3 );
            directionalLight.position.set( 1, 0.75, 0.5 ).normalize();
            scene.add( directionalLight );
        
           
            let planeEntity = vjmap3d.Entity.attchObject(plane);
            planeEntity.pointerEvents = true; // 允许响应事件
            planeEntity.signal.onPointerMove.add(e => {
                if (!e?.intersection) {
                    return; // 如果没有相交或不在当前实体上
                } 
                 // 在当前实体上
                const intersect = e.intersection;
                rollOverMesh.position.copy( intersect.point ).add( intersect.face.normal );
                rollOverMesh.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );
            })
            // 使用 onPointerDownUp 不要使用 onPointerDown ，要不左键旋转时，会有影响 
            planeEntity.signal.onPointerDownUp.add(e => {
                if (!e?.intersection) {
                    return; // 如果没有相交或不在当前实体上
                } 
                // 在当前实体上
                const intersect = e.intersection;
                const voxel = new THREE.Mesh( cubeGeo, cubeMaterial );
                voxel.position.copy( intersect.point ).add( intersect.face.normal );
                voxel.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );
                let voxelEntity = vjmap3d.Entity.fromObject3d(voxel);
                voxelEntity.addTo(app);
                voxelEntity.addModule(vjmap3d.EventModule, {
                    clickCallback: (entity, isClick) => {
                        if (isClick &&  app.Input.getKeyPressed("ShiftLeft") ) {
                             // 如果shift按住了点击，则删除
                             // delete cube
                             entity.remove()
                        }
                    }
                })
        
            })
        
        
        }
    }
    catch (e) {
        console.error(e);
    }
};