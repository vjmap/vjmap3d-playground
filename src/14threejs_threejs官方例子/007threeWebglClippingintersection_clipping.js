
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/007threeWebglClippingintersection
        // --clipping_intersection--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_clipping_intersection
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
                far: 200,
                position: [ - 1.5, 2.5, 3.0  ]
            },
            control: {
                minDistance: 1,
                maxDistance: 10,
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        renderer.localClippingEnabled = true;
        
        const params = {
            clipIntersection: true,
            planeConstant: 0,
            showHelpers: false,
            alphaToCoverage: true,
        };
        
        const clipPlanes = [
            new THREE.Plane( new THREE.Vector3( 1, 0, 0 ), 0 ),
            new THREE.Plane( new THREE.Vector3( 0, - 1, 0 ), 0 ),
            new THREE.Plane( new THREE.Vector3( 0, 0, - 1 ), 0 )
        ];
        
        init();
        
        
        function init() {
        
            const light = new THREE.HemisphereLight( 0xffffff, 0x080808, 4.5 );
            light.position.set( - 1.25, 1, 1.25 );
            scene.add( light );
        
            //
        
            const group = new THREE.Group();
        
            for ( let i = 1; i <= 30; i += 2 ) {
        
                const geometry = new THREE.SphereGeometry( i / 30, 48, 24 );
        
                const material = new THREE.MeshPhongMaterial( {
        
                    color: new THREE.Color().setHSL( Math.random(), 0.5, 0.5, THREE.SRGBColorSpace ),
                    side: THREE.DoubleSide,
                    clippingPlanes: clipPlanes,
                    clipIntersection: params.clipIntersection,
                    alphaToCoverage: true,
        
                } );
        
                group.add( new THREE.Mesh( geometry, material ) );
        
            }
        
            scene.add( group );
        
            // helpers
        
            const helpers = new THREE.Group();
            helpers.add( new THREE.PlaneHelper( clipPlanes[ 0 ], 2, 0xff0000 ) );
            helpers.add( new THREE.PlaneHelper( clipPlanes[ 1 ], 2, 0x00ff00 ) );
            helpers.add( new THREE.PlaneHelper( clipPlanes[ 2 ], 2, 0x0000ff ) );
            helpers.visible = false;
            scene.add( helpers );
        
            // gui
        
            const gui = new GUI();
        
            gui.add( params, 'alphaToCoverage' ).onChange( function ( value ) {
        
                group.children.forEach( c => {
        
                    c.material.alphaToCoverage = Boolean( value );
                    c.material.needsUpdate = true;
        
                } );
             
        
            } );
        
            gui.add( params, 'clipIntersection' ).name( 'clip intersection' ).onChange( function ( value ) {
        
                const children = group.children;
        
                for ( let i = 0; i < children.length; i ++ ) {
        
                    children[ i ].material.clipIntersection = value;
        
                }
        
        
            } );
        
            gui.add( params, 'planeConstant', - 1, 1 ).step( 0.01 ).name( 'plane constant' ).onChange( function ( value ) {
        
                for ( let j = 0; j < clipPlanes.length; j ++ ) {
        
                    clipPlanes[ j ].constant = value;
        
                }
        
                
            } );
        
            gui.add( params, 'showHelpers' ).name( 'show helpers' ).onChange( function ( value ) {
        
                helpers.visible = value;
        
               
        
            } );
        
          
        
        }
    }
    catch (e) {
        console.error(e);
    }
};