
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/137threeWebgltestWideGamut
        // --test_wide_gamut--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_test_wide_gamut
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            render: {
                renderUpdate: false
            },
            scene: {
                background: 0xffffff,
                defaultLights: false
            },
            camera: {
                fov: 35,
                near: 0.1,
                far: 100,
                position: [ 0, 0, 6   ]
            },
            postProcess: {
                enable: false
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        let sceneL, sceneR, textureL, textureR,  loader;
        
        let sliderPos = app.containerSize.width / 2;
        
        const isP3Context = WebGL.isColorSpaceAvailable( THREE.DisplayP3ColorSpace );
        
        if ( isP3Context ) {
        
            THREE.ColorManagement.workingColorSpace = THREE.LinearDisplayP3ColorSpace;
        
        }
        
        init();
        
        function init() {
        
            app.container.appendChild(vjmap3d.DOM.createStyledDiv(`
            <div class="slider"></div>
            <p class="label" style="left: 1em;">sRGB</p>
            <p class="label" style="right: 1em;">Display P3</p>
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
        }
        
        .label {
            position: fixed;
            top: calc(50% - 1em);
            height: 2em;
            line-height: 2em;
            background: rgba(0, 0, 0, 0.5);
            margin: 0;
            padding: 0.2em 0.5em;
            border-radius: 4px;
            font-size: 14px;
            user-select: none;
            -webkit-user-select: none;
        }`))
        
            sceneL = scene;
        	sceneR = new THREE.Scene();
        
            loader = new THREE.TextureLoader();
        
            initTextures();
            initSlider();
        
            renderer.setScissorTest( true );
        
            if ( isP3Context && window.matchMedia( '( color-gamut: p3 )' ).matches ) {
        
                renderer.outputColorSpace = THREE.DisplayP3ColorSpace;
        
            }
        
          
            window.matchMedia( '( color-gamut: p3 )' ).addEventListener( 'change', onGamutChange );
        
            app.signal.onContainerSizeChange.add(onWindowResize)
            app.signal.onAppRender.add(animate)
        
        }
        
        async function initTextures() {
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
            const path = assetsPath + 'textures/wide_gamut/logo_{colorSpace}.png';
        
            textureL = await loader.loadAsync( path.replace( '{colorSpace}', 'srgb' ) );
            textureR = await loader.loadAsync( path.replace( '{colorSpace}', 'p3' ) );
        
            textureL.colorSpace = THREE.SRGBColorSpace;
            textureR.colorSpace = THREE.DisplayP3ColorSpace;
        
            sceneL.background = containTexture( app.containerSize.width / app.containerSize.height, textureL );
            sceneR.background = containTexture( app.containerSize.width / app.containerSize.height, textureR );
        
        }
        
        function initSlider() {
        
            const slider = document.querySelector( '.slider' );
        
            function onPointerDown() {
        
                if ( event.isPrimary === false ) return;
        
                window.addEventListener( 'pointermove', onPointerMove );
                window.addEventListener( 'pointerup', onPointerUp );
        
            }
        
            function onPointerUp() {
        
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
        
        }
        
        function onWindowResize() {
        
        
            containTexture( app.containerSize.width / app.containerSize.height, sceneL.background );
            containTexture( app.containerSize.width / app.containerSize.height, sceneR.background );
        
        }
        
        function onGamutChange( { matches } ) {
        
            renderer.outputColorSpace = isP3Context && matches ? THREE.DisplayP3ColorSpace : THREE.SRGBColorSpace;
        
            textureL.needsUpdate = true;
            textureR.needsUpdate = true;
        
        }
        
        function containTexture( aspect, target ) {
        
            // Sets the matrix uv transform so the texture image is contained in a region having the specified aspect ratio,
            // and does so without distortion. Akin to CSS object-fit: contain.
            // Source: https://github.com/mrdoob/three.js/pull/17199
        
            var imageAspect = ( target.image && target.image.width ) ? target.image.width / target.image.height : 1;
        
            if ( aspect > imageAspect ) {
        
                target.matrix.setUvTransform( 0, 0, aspect / imageAspect, 1, 0, 0.5, 0.5 );
        
            } else {
        
                target.matrix.setUvTransform( 0, 0, 1, imageAspect / aspect, 0, 0.5, 0.5 );
        
            }
        
            target.matrixAutoUpdate = false;
        
            return target;
        
        }
        
        function animate() {
        
            renderer.setScissor( 0, 0, sliderPos, app.containerSize.height );
            renderer.render( sceneL, camera );
        
            renderer.setScissor( sliderPos, 0, app.containerSize.width, app.containerSize.height );
            renderer.render( sceneR, camera );
        
        }
        
        
        
    }
    catch (e) {
        console.error(e);
    }
};