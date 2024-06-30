
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/119threeWebglraycasterSprite
        // --raycaster_sprite--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_raycaster_sprite
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                background: 0xffffff,
                defaultLights: false
            },
            camera: {
                fov: 50,
                near: 1,
                far: 1000,
                position: [ 15, 15, 15 ]
            },
            control: {
                minDistance: 15,
                maxDistance: 250
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        let group;
        
        let selectedObject = null;
        const raycaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2();
        
        init();
        
        function init() {
        
            group = new THREE.Group();
            scene.add( group );
        
            // init camera
            camera.lookAt( scene.position );
        
            // add sprites
        
            const sprite1 = new THREE.Sprite( new THREE.SpriteMaterial( { color: '#69f' } ) );
            sprite1.position.set( 6, 5, 5 );
            sprite1.scale.set( 2, 5, 1 );
            group.add( sprite1 );
        
            const sprite2 = new THREE.Sprite( new THREE.SpriteMaterial( { color: '#69f', sizeAttenuation: false } ) );
            sprite2.material.rotation = Math.PI / 3 * 4;
            sprite2.position.set( 8, - 2, 2 );
            sprite2.center.set( 0.5, 0 );
            sprite2.scale.set( .1, .5, .1 );
            group.add( sprite2 );
        
            const group2 = new THREE.Object3D();
            group2.scale.set( 1, 2, 1 );
            group2.position.set( - 5, 0, 0 );
            group2.rotation.set( Math.PI / 2, 0, 0 );
            group.add( group2 );
        
            const sprite3 = new THREE.Sprite( new THREE.SpriteMaterial( { color: '#69f' } ) );
            sprite3.position.set( 0, 2, 5 );
            sprite3.scale.set( 10, 2, 3 );
            sprite3.center.set( - 0.1, 0 );
            sprite3.material.rotation = Math.PI / 3;
            group2.add( sprite3 );
        
          
            document.addEventListener( 'pointermove', onPointerMove );
        
        }
        
        
        
        function onPointerMove( event ) {
        
            if ( selectedObject ) {
        
                selectedObject.material.color.set( '#69f' );
                selectedObject = null;
        
            }
        
            pointer.x = ( event.clientX / app.containerSize.width ) * 2 - 1;
            pointer.y = - ( event.clientY / app.containerSize.height ) * 2 + 1;
        
            raycaster.setFromCamera( pointer, camera );
        
            const intersects = raycaster.intersectObject( group, true );
        
            if ( intersects.length > 0 ) {
        
                const res = intersects.filter( function ( res ) {
        
                    return res && res.object;
        
                } )[ 0 ];
        
                if ( res && res.object ) {
        
                    selectedObject = res.object;
                    selectedObject.material.color.set( '#f00' );
        
                }
        
            }
        
        }
        
        
    }
    catch (e) {
        console.error(e);
    }
};