
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/026threeWebglGeometryGeometryTextStroke
        // --geometry_text_stroke--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_geometry_text_stroke
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                background: 0xf0f0f0,
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 45,
                near: 1, 
                far: 10000,
                position: [ 0, - 400, 600 ]
            },
            control: {
                target: [ 0, 0, 0]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        init();
        
        function init( ) {
        
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
            const loader = new FontLoader();
            // 如使用中文，需要中文字体请使用此工具把字体转成相应的json文件 https://gero3.github.io/facetype.js/
            loader.load(assetsPath + 'fonts/helvetiker_regular.typeface.json', function ( font ) {
        
                const color = new THREE.Color( 0x006699 );
        
                const matDark = new THREE.MeshBasicMaterial( {
                    color: color,
                    side: THREE.DoubleSide
                } );
        
                const matLite = new THREE.MeshBasicMaterial( {
                    color: color,
                    transparent: true,
                    opacity: 0.4,
                    side: THREE.DoubleSide
                } );
        
                const message = '   Three.js\nStroke text.';
        
                const shapes = font.generateShapes( message, 100 );
        
                const geometry = new THREE.ShapeGeometry( shapes );
        
                geometry.computeBoundingBox();
        
                const xMid = - 0.5 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x );
        
                geometry.translate( xMid, 0, 0 );
        
                // make shape ( N.B. edge view not visible )
        
                const text = new THREE.Mesh( geometry, matLite );
                text.position.z = - 150;
                scene.add( text );
        
                // make line shape ( N.B. edge view remains visible )
        
                const holeShapes = [];
        
                for ( let i = 0; i < shapes.length; i ++ ) {
        
                    const shape = shapes[ i ];
        
                    if ( shape.holes && shape.holes.length > 0 ) {
        
                        for ( let j = 0; j < shape.holes.length; j ++ ) {
        
                            const hole = shape.holes[ j ];
                            holeShapes.push( hole );
        
                        }
        
                    }
        
                }
        
                shapes.push.apply( shapes, holeShapes );
        
                const style = SVGLoader.getStrokeStyle( 5, color.getStyle() );
        
                const strokeText = new THREE.Group();
        
                for ( let i = 0; i < shapes.length; i ++ ) {
        
                    const shape = shapes[ i ];
        
                    const points = shape.getPoints();
        
                    const geometry = SVGLoader.pointsToStroke( points, style );
        
                    geometry.translate( xMid, 0, 0 );
        
                    const strokeMesh = new THREE.Mesh( geometry, matDark );
                    strokeText.add( strokeMesh );
        
                }
        
                scene.add( strokeText );
        
        
            } ); //end load function
        
            
        
        } // end init
    }
    catch (e) {
        console.error(e);
    }
};