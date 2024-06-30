
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/139threeWebglvideoPanoramaEquirectangular
        // --video_panorama_equirectangular--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_video_panorama_equirectangular
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            camera: {
                fov: 75,
                near: 0.25,
                far: 10,
                position: [  0, 0, 0  ]
            },
            control: {
                target: [0, 0, - 0.2 ]
            }
            
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        let isUserInteracting = false,
            lon = 0, lat = 0,
            phi = 0, theta = 0,
            onPointerDownPointerX = 0,
            onPointerDownPointerY = 0,
            onPointerDownLon = 0,
            onPointerDownLat = 0;
        
        const distance = .5;
        
        init();
        
        function init() {
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
            document.body.appendChild(vjmap3d.DOM.createStyledDiv(`
        <video id="video" loop muted crossOrigin="anonymous" playsinline style="display:none">
            <source src="${assetsPath}textures/pano.webm">
            <source src="${assetsPath}textures/pano.mp4">
        </video>
        `))
        
            const geometry = new THREE.SphereGeometry( 5, 60, 40 );
            // invert the geometry on the x-axis so that all of the faces point inward
            geometry.scale( - 1, 1, 1 );
        
            const video = document.getElementById( 'video' );
            video.play();
        
            const texture = new THREE.VideoTexture( video );
            texture.colorSpace = THREE.SRGBColorSpace;
            const material = new THREE.MeshBasicMaterial( { map: texture } );
        
            const mesh = new THREE.Mesh( geometry, material );
            scene.add( mesh );
        
        
            document.addEventListener( 'pointerdown', onPointerDown );
            document.addEventListener( 'pointermove', onPointerMove );
            document.addEventListener( 'pointerup', onPointerUp );
        
        
            app.signal.onAppUpdate.add(animate)
        }
        
        function onPointerDown( event ) {
        
            isUserInteracting = true;
        
            onPointerDownPointerX = event.clientX;
            onPointerDownPointerY = event.clientY;
        
            onPointerDownLon = lon;
            onPointerDownLat = lat;
        
        }
        
        function onPointerMove( event ) {
        
            if ( isUserInteracting === true ) {
        
                lon = ( onPointerDownPointerX - event.clientX ) * 0.1 + onPointerDownLon;
                lat = ( onPointerDownPointerY - event.clientY ) * 0.1 + onPointerDownLat;
        
            }
        
        }
        
        function onPointerUp() {
        
            isUserInteracting = false;
        
        }
        
        function animate() {
        
            lat = Math.max( - 85, Math.min( 85, lat ) );
            phi = THREE.MathUtils.degToRad( 90 - lat );
            theta = THREE.MathUtils.degToRad( lon );
        
            camera.position.x = distance * Math.sin( phi ) * Math.cos( theta );
            camera.position.y = distance * Math.cos( phi );
            camera.position.z = distance * Math.sin( phi ) * Math.sin( theta );
        
            camera.lookAt( 0, 0, 0 );
        
        }
        
        
        
    }
    catch (e) {
        console.error(e);
    }
};