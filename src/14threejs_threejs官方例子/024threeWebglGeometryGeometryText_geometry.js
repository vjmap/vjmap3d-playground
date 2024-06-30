
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/024threeWebglGeometryGeometryText
        // --geometry_text--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_geometry_text
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
                position: [ 0, 400, 700]
            },
            control: {
                target: [ 0, 100, 0]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        let cameraTarget;
        // 当 THREE.Cache.enabled 设置为 true 时，Three.js 会启用缓存机制，它会自动缓存加载的纹理、模型等资源数据。这可以提高性能和加载速度，因为在后续使用相同资源时，可以直接从缓存中获取，而不需要重新加载。
        // 当 THREE.Cache.enabled 设置为 false 时，缓存机制将被禁用，每次加载资源时都会重新加载。 默认为false
        THREE.Cache.enabled = true;
        
        let group, textMesh1, textMesh2, textGeo, materials;
        
        let firstLetter = true;
        
        let text = 'three.js',
        
            bevelEnabled = true,
        
            font = undefined,
        
            fontName = 'optimer', // helvetiker, optimer, gentilis, droid sans, droid serif
            fontWeight = 'bold'; // normal bold
        
        const depth = 20,
            size = 70,
            hover = 30,
        
            curveSegments = 4,
        
            bevelThickness = 2,
            bevelSize = 1.5;
        
        const mirror = true;
        
        const fontMap = {
        
            'helvetiker': 0,
            'optimer': 1,
            'gentilis': 2,
            'droid/droid_sans': 3,
            'droid/droid_serif': 4
        
        };
        
        const weightMap = {
        
            'regular': 0,
            'bold': 1
        
        };
        
        const reverseFontMap = [];
        const reverseWeightMap = [];
        
        for ( const i in fontMap ) reverseFontMap[ fontMap[ i ] ] = i;
        for ( const i in weightMap ) reverseWeightMap[ weightMap[ i ] ] = i;
        
        
        let fontIndex = 1;
        
        init();
        
        function init() {
        
            cameraTarget = new THREE.Vector3( 0, 150, 0 );
        
            // SCENE
            scene.fog = new THREE.Fog( 0x000000, 250, 1400 );
        
            // LIGHTS
        
            const dirLight = new THREE.DirectionalLight( 0xffffff, 0.4 );
            dirLight.position.set( 0, 0, 1 ).normalize();
            scene.add( dirLight );
        
            const pointLight = new THREE.PointLight( 0xffffff, 4.5, 0, 0 );
            pointLight.color.setHSL( Math.random(), 1, 0.5 );
            pointLight.position.set( 0, 100, 90 );
            scene.add( pointLight );
        
            materials = [
                new THREE.MeshPhongMaterial( { color: 0xffffff, flatShading: true } ), // front
                new THREE.MeshPhongMaterial( { color: 0xffffff } ) // side
            ];
        
            group = new THREE.Group();
            group.position.y = 100;
        
            scene.add( group );
        
            loadFont();
        
            const plane = new THREE.Mesh(
                new THREE.PlaneGeometry( 10000, 10000 ),
                new THREE.MeshBasicMaterial( { color: 0xffffff, opacity: 0.5, transparent: true } )
            );
            plane.position.y = 100;
            plane.rotation.x = - Math.PI / 2;
            scene.add( plane );
        
            
           
            document.addEventListener( 'keypress', onDocumentKeyPress );
            document.addEventListener( 'keydown', onDocumentKeyDown );
        
            //
        
            const params = {
                changeColor: function () {
        
                    pointLight.color.setHSL( Math.random(), 1, 0.5 );
        
                },
                changeFont: function () {
        
                    fontIndex ++;
        
                    fontName = reverseFontMap[ fontIndex % reverseFontMap.length ];
        
                    loadFont();
        
                },
                changeWeight: function () {
        
                    if ( fontWeight === 'bold' ) {
        
                        fontWeight = 'regular';
        
                    } else {
        
                        fontWeight = 'bold';
        
                    }
        
                    loadFont();
        
                },
                changeBevel: function () {
        
                    bevelEnabled = ! bevelEnabled;
        
                    refreshText();
        
                }
            };
        
            //
        
            const gui = new GUI();
        
            gui.add( params, 'changeColor' ).name( 'change color' );
            gui.add( params, 'changeFont' ).name( 'change font' );
            gui.add( params, 'changeWeight' ).name( 'change weight' );
            gui.add( params, 'changeBevel' ).name( 'change bevel' );
            gui.open();
        
          
        }
        
        //
        
        function onDocumentKeyDown( event ) {
        
            if ( firstLetter ) {
        
                firstLetter = false;
                text = '';
        
            }
        
            const keyCode = event.keyCode;
        
            // backspace
        
            if ( keyCode == 8 ) {
        
                event.preventDefault();
        
                text = text.substring( 0, text.length - 1 );
                refreshText();
        
                return false;
        
            }
        
        }
        
        function onDocumentKeyPress( event ) {
        
            const keyCode = event.which;
        
            // backspace
        
            if ( keyCode == 8 ) {
        
                event.preventDefault();
        
            } else {
        
                const ch = String.fromCharCode( keyCode );
                text += ch;
        
                refreshText();
        
            }
        
        }
        
        function loadFont() {
        
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
            const loader = new FontLoader();
            loader.load(assetsPath +  'fonts/' + fontName + '_' + fontWeight + '.typeface.json', function ( response ) {
        
                font = response;
        
                refreshText();
        
            } );
        
        }
        
        function createText() {
        
            textGeo = new TextGeometry( text, {
        
                font: font,
        
                size: size,
                depth: depth,
                curveSegments: curveSegments,
        
                bevelThickness: bevelThickness,
                bevelSize: bevelSize,
                bevelEnabled: bevelEnabled
        
            } );
        
            textGeo.computeBoundingBox();
        
            const centerOffset = - 0.5 * ( textGeo.boundingBox.max.x - textGeo.boundingBox.min.x );
        
            textMesh1 = new THREE.Mesh( textGeo, materials );
        
            textMesh1.position.x = centerOffset;
            textMesh1.position.y = hover;
            textMesh1.position.z = 0;
        
            textMesh1.rotation.x = 0;
            textMesh1.rotation.y = Math.PI * 2;
        
            group.add( textMesh1 );
        
            if ( mirror ) {
        
                textMesh2 = new THREE.Mesh( textGeo, materials );
        
                textMesh2.position.x = centerOffset;
                textMesh2.position.y = - hover;
                textMesh2.position.z = depth;
        
                textMesh2.rotation.x = Math.PI;
                textMesh2.rotation.y = Math.PI * 2;
        
                group.add( textMesh2 );
        
            }
        
        }
        
        function refreshText() {
        
            group.remove( textMesh1 );
            if ( mirror ) group.remove( textMesh2 );
        
            if ( ! text ) return;
        
            createText();
        
        }
        
    }
    catch (e) {
        console.error(e);
    }
};