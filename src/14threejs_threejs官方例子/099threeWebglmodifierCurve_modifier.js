
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/099threeWebglmodifierCurve
        // --modifier_curve--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_modifier_curve
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 40,
                near: 1,
                far: 1000,
                position: [2, 2, 4 ]
            },
            control: {
                enable: false
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        let control
        const ACTION_SELECT = 1, ACTION_NONE = 0;
        const curveHandles = [];
        const mouse = new THREE.Vector2();
        
        let rayCaster,
            flow,
            action = ACTION_NONE;
        
        init();
        
        function init() {
        
        
            camera.lookAt( scene.position );
        
            const initialPoints = [
                { x: 1, y: 0, z: - 1 },
                { x: 1, y: 0, z: 1 },
                { x: - 1, y: 0, z: 1 },
                { x: - 1, y: 0, z: - 1 },
            ];
        
            const boxGeometry = new THREE.BoxGeometry( 0.1, 0.1, 0.1 );
            const boxMaterial = new THREE.MeshBasicMaterial();
        
            for ( const handlePos of initialPoints ) {
        
                const handle = new THREE.Mesh( boxGeometry, boxMaterial );
                handle.position.copy( handlePos );
                curveHandles.push( handle );
                scene.add( handle );
        
            }
        
            const curve = new THREE.CatmullRomCurve3(
                curveHandles.map( ( handle ) => handle.position )
            );
            curve.curveType = 'centripetal';
            curve.closed = true;
        
            const points = curve.getPoints( 50 );
            const line = new THREE.LineLoop(
                new THREE.BufferGeometry().setFromPoints( points ),
                new THREE.LineBasicMaterial( { color: 0x00ff00 } )
            );
        
            scene.add( line );
        
            //
        
            const light = new THREE.DirectionalLight( 0xffaa33, 3 );
            light.position.set( - 10, 10, 10 );
            scene.add( light );
        
            const light2 = new THREE.AmbientLight( 0x003973, 3 );
            scene.add( light2 );
        
            //
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
            const loader = new FontLoader();
            loader.load(assetsPath + 'fonts/helvetiker_regular.typeface.json', function ( font ) {
        
                const geometry = new TextGeometry( 'Hello three.js!', {
                    font: font,
                    size: 0.2,
                    depth: 0.05,
                    curveSegments: 12,
                    bevelEnabled: true,
                    bevelThickness: 0.02,
                    bevelSize: 0.01,
                    bevelOffset: 0,
                    bevelSegments: 5,
                } );
        
                geometry.rotateX( Math.PI );
        
                const material = new THREE.MeshStandardMaterial( {
                    color: 0x99ffff
                } );
        
                const objectToCurve = new THREE.Mesh( geometry, material );
        
                flow = new Flow( objectToCurve );
                flow.updateCurve( 0, curve );
                scene.add( flow.object3D );
        
            } );
        
            //
        
            renderer.domElement.addEventListener( 'pointerdown', onPointerDown );
        
            rayCaster = new THREE.Raycaster();
            control = new TransformControls( camera, renderer.domElement );
            control.addEventListener( 'dragging-changed', function ( event ) {
        
                if ( ! event.value ) {
        
                    const points = curve.getPoints( 50 );
                    line.geometry.setFromPoints( points );
                    flow.updateCurve( 0, curve );
        
                }
        
            } );
        
           
            app.signal.onAppUpdate.add(animate)
        
        }
        
        
        function onPointerDown( event ) {
        
            action = ACTION_SELECT;
            mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
            mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
        
        }
        
        function animate() {
        
            if ( action === ACTION_SELECT ) {
        
                rayCaster.setFromCamera( mouse, camera );
                action = ACTION_NONE;
                const intersects = rayCaster.intersectObjects( curveHandles, false );
                if ( intersects.length ) {
        
                    const target = intersects[ 0 ].object;
                    control.attach( target );
                    scene.add( control );
        
                }
        
            }
        
            if ( flow ) {
        
                flow.moveAlongCurve( 0.001 );
        
            }
        
        
        
        }
        
        
        
    }
    catch (e) {
        console.error(e);
    }
};