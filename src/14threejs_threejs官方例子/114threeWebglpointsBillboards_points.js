
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/114threeWebglpointsBillboards
        // --points_billboards--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_points_billboards
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            camera: {
                fov: 75,
                near: 1,
                far: 1100
            },
            control: {
                // 只允许旋转，不允许 平移和缩放
                mouseButtons: {
                    left: vjmap3d.CameraControls.ACTION.ROTATE,
                    middle: vjmap3d.CameraControls.ACTION.NONE,
                    right: vjmap3d.CameraControls.ACTION.NONE,
                    wheel:  vjmap3d.CameraControls.ACTION.NONE,
                },
                touches: {
                    one: vjmap3d.CameraControls.ACTION.TOUCH_ROTATE,
                    two: vjmap3d.CameraControls.ACTION.NONE,
                    three: vjmap3d.CameraControls.ACTION.NONE,
                },
                dblClickSetToCenter:false
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        let isUserInteracting = false,
        lon = 0, 
        lat = 0, 
        phi = 0, theta = 0;
        
        init();
        
        function init() {
        
        
        const geometry = new THREE.SphereGeometry( 500, 60, 40 );
        // invert the geometry on the x-axis so that all of the faces point inward
        geometry.scale( - 1, 1, 1 );
        
        let assetsPath = "https://vjmap.com/map3d/resources/three/"
        const texture = new THREE.TextureLoader().load( assetsPath + 'textures/2294472375_24a3b8ef46_o.jpg' );
        texture.colorSpace = THREE.SRGBColorSpace;
        const material = new THREE.MeshBasicMaterial( { map: texture } );
        
        const mesh = new THREE.Mesh( geometry, material );
        
        scene.add( mesh );
        
        
        
        //
        
        document.addEventListener( 'dragover', function ( event ) {
        
            event.preventDefault();
            event.dataTransfer.dropEffect = 'copy';
        
        } );
        
        document.addEventListener( 'dragenter', function () {
        
            document.body.style.opacity = 0.5;
        
        } );
        
        document.addEventListener( 'dragleave', function () {
        
            document.body.style.opacity = 1;
        
        } );
        
        document.addEventListener( 'drop', function ( event ) {
        
            event.preventDefault();
        
            const reader = new FileReader();
            reader.addEventListener( 'load', function ( event ) {
        
                material.map.image.src = event.target.result;
                material.map.needsUpdate = true;
        
            } );
            reader.readAsDataURL( event.dataTransfer.files[ 0 ] );
        
            document.body.style.opacity = 1;
        
        } );
        
        //
        app.signal.onAppRender.add(animate)
        
        }
        
        
        
        function animate() {
        
            if ( isUserInteracting === false ) {
        
                lon += 0.1;
        
            }
        
            lat = Math.max( - 85, Math.min( 85, lat ) );
            phi = THREE.MathUtils.degToRad( 90 - lat );
            theta = THREE.MathUtils.degToRad( lon );
        
            const x = 500 * Math.sin( phi ) * Math.cos( theta );
            const y = 500 * Math.cos( phi );
            const z = 500 * Math.sin( phi ) * Math.sin( theta );
        
            camera.lookAt( x, y, z );
        
          
        
        }
        
        
        
    }
    catch (e) {
        console.error(e);
    }
};