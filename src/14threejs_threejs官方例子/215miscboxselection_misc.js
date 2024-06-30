
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/215miscboxselection
        // --misc_boxselection--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#misc_boxselection
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
                position: [0, 0, 50]
            },
            control: {
                enable: false
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        init();
        
        function init() {
        
            var style = document.createElement('style');
            style.type = 'text/css';
            style.innerHTML =  `.selectBox {
                border: 1px solid #55aaff;
                background-color: rgba(75, 160, 255, 0.3);
                position: fixed;
            }`;
        
            document.head.appendChild(style);
        
            scene.background = new THREE.Color( 0xf0f0f0 );
        
            scene.add( new THREE.AmbientLight( 0xaaaaaa ) );
        
            const light = new THREE.SpotLight( 0xffffff, 10000 );
            light.position.set( 0, 25, 50 );
            light.angle = Math.PI / 5;
        
            light.castShadow = true;
            light.shadow.camera.near = 10;
            light.shadow.camera.far = 100;
            light.shadow.mapSize.width = 1024;
            light.shadow.mapSize.height = 1024;
        
            scene.add( light );
        
            const geometry = new THREE.BoxGeometry();
        
            for ( let i = 0; i < 200; i ++ ) {
        
                const object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );
        
                object.position.x = Math.random() * 80 - 40;
                object.position.y = Math.random() * 45 - 25;
                object.position.z = Math.random() * 45 - 25;
        
                object.rotation.x = Math.random() * 2 * Math.PI;
                object.rotation.y = Math.random() * 2 * Math.PI;
                object.rotation.z = Math.random() * 2 * Math.PI;
        
                object.scale.x = Math.random() * 2 + 1;
                object.scale.y = Math.random() * 2 + 1;
                object.scale.z = Math.random() * 2 + 1;
        
                object.castShadow = true;
                object.receiveShadow = true;
        
                scene.add( object );
        
            }
        
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFShadowMap;
        
        
        }
        
        
        const selectionBox = new SelectionBox( camera, scene );
        const helper = new SelectionHelper( renderer, 'selectBox' );
        
        document.addEventListener( 'pointerdown', function ( event ) {
        
            for ( const item of selectionBox.collection ) {
        
                item.material.emissive.set( 0x000000 );
        
            }
        
            selectionBox.startPoint.set(
                ( event.clientX / window.innerWidth ) * 2 - 1,
                - ( event.clientY / window.innerHeight ) * 2 + 1,
                0.5 );
        
        } );
        
        document.addEventListener( 'pointermove', function ( event ) {
        
            if ( helper.isDown ) {
        
                for ( let i = 0; i < selectionBox.collection.length; i ++ ) {
        
                    selectionBox.collection[ i ].material.emissive.set( 0x000000 );
        
                }
        
                selectionBox.endPoint.set(
                    ( event.clientX / window.innerWidth ) * 2 - 1,
                    - ( event.clientY / window.innerHeight ) * 2 + 1,
                    0.5 );
        
                const allSelected = selectionBox.select();
        
                for ( let i = 0; i < allSelected.length; i ++ ) {
        
                    allSelected[ i ].material.emissive.set( 0xffffff );
        
                }
        
            }
        
        } );
        
        document.addEventListener( 'pointerup', function ( event ) {
        
            selectionBox.endPoint.set(
                ( event.clientX / window.innerWidth ) * 2 - 1,
                - ( event.clientY / window.innerHeight ) * 2 + 1,
                0.5 );
        
            const allSelected = selectionBox.select();
        
            for ( let i = 0; i < allSelected.length; i ++ ) {
        
                allSelected[ i ].material.emissive.set( 0xffffff );
        
            }
        
        } );
        
    }
    catch (e) {
        console.error(e);
    }
};