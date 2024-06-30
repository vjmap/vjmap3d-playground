
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/217miscControlsDrag
        // --misc_controls_drag--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#misc_controls_drag
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            camera: {
                fov: 70,
                near: 0.1,
                far: 500,
                position: [0, 0, 25]
            },
            control: {
                enable: false
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        let controls, group;
        let enableSelection = false;
        
        const objects = [];
        
        const mouse = new THREE.Vector2(), raycaster = new THREE.Raycaster();
        
        init();
        
        function init() {
        
            scene.background = new THREE.Color( 0xf0f0f0 );
        
            scene.add( new THREE.AmbientLight( 0xaaaaaa ) );
        
            const light = new THREE.SpotLight( 0xffffff, 10000 );
            light.position.set( 0, 25, 50 );
            light.angle = Math.PI / 9;
        
            light.castShadow = true;
            light.shadow.camera.near = 10;
            light.shadow.camera.far = 100;
            light.shadow.mapSize.width = 1024;
            light.shadow.mapSize.height = 1024;
        
            scene.add( light );
        
            group = new THREE.Group();
            scene.add( group );
        
            const geometry = new THREE.BoxGeometry();
        
            for ( let i = 0; i < 200; i ++ ) {
        
                const object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );
        
                object.position.x = Math.random() * 30 - 15;
                object.position.y = Math.random() * 15 - 7.5;
                object.position.z = Math.random() * 20 - 10;
        
                object.rotation.x = Math.random() * 2 * Math.PI;
                object.rotation.y = Math.random() * 2 * Math.PI;
                object.rotation.z = Math.random() * 2 * Math.PI;
        
                object.scale.x = Math.random() * 2 + 1;
                object.scale.y = Math.random() * 2 + 1;
                object.scale.z = Math.random() * 2 + 1;
        
                object.castShadow = true;
                object.receiveShadow = true;
        
                scene.add( object );
        
                objects.push( object );
        
            }
        
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFShadowMap;
        
            controls = new DragControls( [ ... objects ], camera, renderer.domElement );
            controls.rotateSpeed = 2;
        
            //
        
        
            document.addEventListener( 'click', onClick );
            window.addEventListener( 'keydown', onKeyDown );
            window.addEventListener( 'keyup', onKeyUp );
        
            
        
        }
        
        function onKeyDown( event ) {
        
            enableSelection = ( event.keyCode === 16 ) ? true : false;
            
            if ( event.keyCode === 77 ) {
        
                controls.mode = ( controls.mode === 'translate' ) ? 'rotate' : 'translate';
        
            }
        
        }
        
        function onKeyUp() {
        
            enableSelection = false;
        
        }
        
        function onClick( event ) {
        
            event.preventDefault();
        
            if ( enableSelection === true ) {
        
                const draggableObjects = controls.getObjects();
                draggableObjects.length = 0;
        
                mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
                mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
        
                raycaster.setFromCamera( mouse, camera );
        
                const intersections = raycaster.intersectObjects( objects, true );
        
                if ( intersections.length > 0 ) {
        
                    const object = intersections[ 0 ].object;
        
                    if ( group.children.includes( object ) === true ) {
        
                        object.material.emissive.set( 0x000000 );
                        scene.attach( object );
        
                    } else {
        
                        object.material.emissive.set( 0xaaaaaa );
                        group.attach( object );
        
                    }
        
                    controls.transformGroup = true;
                    draggableObjects.push( group );
        
                }
        
                if ( group.children.length === 0 ) {
        
                    controls.transformGroup = false;
                    draggableObjects.push( ...objects );
        
                }
        
            }
        
            
        
        }
        
        
    }
    catch (e) {
        console.error(e);
    }
};