
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/112threeWebglpanoramaCube
        // --panorama_cube--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_panorama_cube
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            camera: {
                fov: 90,
                near: 0.1,
                far: 100,
                position: [0, 0, 0.01]
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
        
        init();
        
        function init() {
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
        
            const textures = getTexturesFromAtlasFile(assetsPath + 'textures/cube/sun_temple_stripe.jpg', 6 );
        
            const materials = [];
        
            for ( let i = 0; i < 6; i ++ ) {
        
                materials.push( new THREE.MeshBasicMaterial( { map: textures[ i ] } ) );
        
            }
        
            const skyBox = new THREE.Mesh( new THREE.BoxGeometry( 1, 1, 1 ), materials );
            skyBox.geometry.scale( 1, 1, - 1 );
            scene.add( skyBox );
        
        
            app.cameraControl.zoomTo
        }
        
        function getTexturesFromAtlasFile( atlasImgUrl, tilesNum ) {
        
            const textures = [];
        
            for ( let i = 0; i < tilesNum; i ++ ) {
        
                textures[ i ] = new THREE.Texture();
        
            }
        
            new THREE.ImageLoader()
                .load( atlasImgUrl, ( image ) => {
        
                    let canvas, context;
                    const tileWidth = image.height;
        
                    for ( let i = 0; i < textures.length; i ++ ) {
        
                        canvas = document.createElement( 'canvas' );
                        context = canvas.getContext( '2d' );
                        canvas.height = tileWidth;
                        canvas.width = tileWidth;
                        context.drawImage( image, tileWidth * i, 0, tileWidth, tileWidth, 0, 0, tileWidth, tileWidth );
                        textures[ i ].colorSpace = THREE.SRGBColorSpace;
                        textures[ i ].image = canvas;
                        textures[ i ].needsUpdate = true;
        
                    }
        
                } );
        
            return textures;
        
        }
        
        
        
    }
    catch (e) {
        console.error(e);
    }
};