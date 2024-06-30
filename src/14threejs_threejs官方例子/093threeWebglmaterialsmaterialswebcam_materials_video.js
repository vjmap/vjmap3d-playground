
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/093threeWebglmaterialsmaterialswebcam
        // --materials_video_webcam--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_materials_video_webcam
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            camera: {
                fov: 60,
                near: 0.1,
                far: 100,
                position: [ 0, 0, 0.01]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        
        let video;
        
        document.body.appendChild(vjmap3d.DOM.createStyledDiv(`<video id="video" style="display:none" autoplay playsinline></video>`, ''))
        init();
        
        function init() {
        
            video = document.getElementById( 'video' );
        
            const texture = new THREE.VideoTexture( video );
            texture.colorSpace = THREE.SRGBColorSpace;
        
            const geometry = new THREE.PlaneGeometry( 16, 9 );
            geometry.scale( 0.5, 0.5, 0.5 );
            const material = new THREE.MeshBasicMaterial( { map: texture } );
        
            const count = 128;
            const radius = 32;
        
            for ( let i = 1, l = count; i <= l; i ++ ) {
        
                const phi = Math.acos( - 1 + ( 2 * i ) / l );
                const theta = Math.sqrt( l * Math.PI ) * phi;
        
                const mesh = new THREE.Mesh( geometry, material );
                mesh.position.setFromSphericalCoords( radius, phi, theta );
                mesh.lookAt( camera.position );
                scene.add( mesh );
        
            }
        
          
            //
        
            if ( navigator.mediaDevices && navigator.mediaDevices.getUserMedia ) {
        
                const constraints = { video: { width: 1280, height: 720, facingMode: 'user' } };
        
                navigator.mediaDevices.getUserMedia( constraints ).then( function ( stream ) {
        
                    // apply the stream to the video element used in the texture
        
                    video.srcObject = stream;
                    video.play();
        
                } ).catch( function ( error ) {
        
                    console.error( 'Unable to access the camera/webcam.', error );
        
                } );
        
            } else {
        
                console.error( 'MediaDevices interface not available.' );
        
            }
        
        }
        
    }
    catch (e) {
        console.error(e);
    }
};