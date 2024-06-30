
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/110threeWebglmultipleScenesComparison
        // --multiple_scenes_comparison--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_multiple_scenes_comparison
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                background: 0xBCD48F,
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 35,
                near: 0.1,
                far: 100,
                position: [0, 0, 6]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        app.container.appendChild(vjmap3d.DOM.createStyledDiv(`<div class="slider"></div>
        `, `.slider {
            position: absolute;
            cursor: ew-resize;
        
            width: 40px;
            height: 40px;
            background-color: #F32196;
            opacity: 0.7;
            border-radius: 50%;
        
            top: calc(50% - 20px);
            left: calc(50% - 20px);
        }`))
        
        let sceneL, sceneR;
        let container;
        
        let sliderPos = app.containerSize.width / 2;
        
        init();
        
        function init() {
            renderer.setScissorTest( true );
            container = document.querySelector( '.map' );
        
            sceneL = scene;
        
            sceneR = new THREE.Scene();
            sceneR.background = new THREE.Color( 0x8FBCD4 );
        
            const light = new THREE.HemisphereLight( 0xffffff, 0x444444, 3 );
            light.position.set( - 2, 2, 2 );
            sceneL.add( light.clone() );
            sceneR.add( light.clone() );
        
            initMeshes();
            initSlider();
        
          
        
        }
        
        function initMeshes() {
        
            const geometry = new THREE.IcosahedronGeometry( 1, 3 );
        
            const meshL = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );
            sceneL.add( meshL );
        
            const meshR = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial( { wireframe: true } ) );
            sceneR.add( meshR );
        
        }
        
        function initSlider() {
        
            const slider = document.querySelector( '.slider' );
        
            function onPointerDown() {
        
                if ( event.isPrimary === false ) return;
        
                app.cameraControl.enabled = false;
        
                window.addEventListener( 'pointermove', onPointerMove );
                window.addEventListener( 'pointerup', onPointerUp );
        
            }
        
            function onPointerUp() {
        
                app.cameraControl.enabled = true;
        
                window.removeEventListener( 'pointermove', onPointerMove );
                window.removeEventListener( 'pointerup', onPointerUp );
        
            }
        
            function onPointerMove( e ) {
        
                if ( event.isPrimary === false ) return;
        
                sliderPos = Math.max( 0, Math.min( app.containerSize.width, e.pageX ) );
        
                slider.style.left = sliderPos - ( slider.offsetWidth / 2 ) + 'px';
        
            }
        
            slider.style.touchAction = 'none'; // disable touch scroll
            slider.addEventListener( 'pointerdown', onPointerDown );
        
            app.signal.onAppBeforeRender.add(() => {
               renderer.setScissor( 0, 0, sliderPos, app.containerSize.width );
            })
            app.signal.onAppAfterRender.add(() => {
                renderer.setScissor( sliderPos, 0, app.containerSize.width, app.containerSize.height );
                renderer.render( sceneR, camera );
            })
        }
        
        
        
        
        
    }
    catch (e) {
        console.error(e);
    }
};