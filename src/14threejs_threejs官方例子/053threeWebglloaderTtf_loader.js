
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/053threeWebglloaderTtf
        // --loader_ttf--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_loader_ttf
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                background: 0x000000,
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 30,
                near: 1, 
                far: 1500,
                position: [  0, 400, 700 ]
            },
            control: {
                target: [0, 100, 0]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        let group, textMesh1, textMesh2, textGeo, material;
        let cameraTarget;
        let text = 'three.js';
        const depth = 20,
            size = 70,
            hover = 30,
            curveSegments = 4,
            bevelThickness = 2,
            bevelSize = 1.5;
        
        let font = null;
        const mirror = true;
        
        
        init();
        
        function init() {
        
            cameraTarget = new THREE.Vector3( 0, 150, 0 );
        
            scene.fog = new THREE.Fog( 0x000000, 250, 1400 );
        
            // LIGHTS
        
            const dirLight1 = new THREE.DirectionalLight( 0xffffff, 0.4 );
            dirLight1.position.set( 0, 0, 1 ).normalize();
            scene.add( dirLight1 );
        
            const dirLight2 = new THREE.DirectionalLight( 0xffffff, 2 );
            dirLight2.position.set( 0, hover, 10 ).normalize();
            dirLight2.color.setHSL( Math.random(), 1, 0.5, THREE.SRGBColorSpace );
            scene.add( dirLight2 );
        
            material = new THREE.MeshPhongMaterial( { color: 0xffffff, flatShading: true } );
        
            group = new THREE.Group();
            group.position.y = 100;
        
            scene.add( group );
        
            const loader = new TTFLoader();
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
        
            loader.load( assetsPath + 'fonts/ttf/kenpixel.ttf', function ( json ) {
        
                font = new Font( json );
                createText();
        
            } );
        
            const plane = new THREE.Mesh(
                new THREE.PlaneGeometry( 10000, 10000 ),
                new THREE.MeshBasicMaterial( { color: 0xffffff, opacity: 0.5, transparent: true } )
            );
            plane.position.y = 100;
            plane.rotation.x = - Math.PI / 2;
            scene.add( plane );
        
        
        
        }
        
        
        
        function createText() {
        
            textGeo = new TextGeometry( text, {
        
                font: font,
        
                size: size,
                depth: depth,
                curveSegments: curveSegments,
        
                bevelThickness: bevelThickness,
                bevelSize: bevelSize,
                bevelEnabled: true
        
            } );
        
            textGeo.computeBoundingBox();
            textGeo.computeVertexNormals();
        
            const centerOffset = - 0.5 * ( textGeo.boundingBox.max.x - textGeo.boundingBox.min.x );
        
            textMesh1 = new THREE.Mesh( textGeo, material );
        
            textMesh1.position.x = centerOffset;
            textMesh1.position.y = hover;
            textMesh1.position.z = 0;
        
            textMesh1.rotation.x = 0;
            textMesh1.rotation.y = Math.PI * 2;
        
            group.add( textMesh1 );
        
            if ( mirror ) {
        
                textMesh2 = new THREE.Mesh( textGeo, material );
        
                textMesh2.position.x = centerOffset;
                textMesh2.position.y = - hover;
                textMesh2.position.z = depth;
        
                textMesh2.rotation.x = Math.PI;
                textMesh2.rotation.y = Math.PI * 2;
        
                group.add( textMesh2 );
        
            }
        
        }
        
        
        
    }
    catch (e) {
        console.error(e);
    }
};