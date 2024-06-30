
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/054threeWebglloadersvg
        // --loader_svg--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_loader_svg
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                background: 0xb0b0b0,
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 50,
                near: 1, 
                far: 1000,
                position: [  0, 0, 200]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        let gui, guiData;
        
        let assetsPath = "https://vjmap.com/map3d/resources/three/"
        
        init();
        
        //
        
        function init() {
        
        
            guiData = {
                currentURL: assetsPath + 'models/svg/tiger.svg',
                drawFillShapes: true,
                drawStrokes: true,
                fillShapesWireframe: false,
                strokesWireframe: false
            };
        
            loadSVG( guiData.currentURL );
        
            createGUI();
        
        }
        
        function createGUI() {
        
            if ( gui ) gui.destroy();
        
            gui = new GUI();
        
            gui.add( guiData, 'currentURL', {
        
                'Tiger': assetsPath + 'models/svg/tiger.svg',
                'Joins and caps': assetsPath + 'models/svg/lineJoinsAndCaps.svg',
                'Hexagon':assetsPath + 'models/svg/hexagon.svg',
                'Energy': assetsPath + 'models/svg/energy.svg',
                'Test 1': assetsPath + 'models/svg/tests/1.svg',
                'Test 2': assetsPath + 'models/svg/tests/2.svg',
                'Test 3': assetsPath + 'models/svg/tests/3.svg',
                'Test 4': assetsPath + 'models/svg/tests/4.svg',
                'Test 5': assetsPath + 'models/svg/tests/5.svg',
                'Test 6': assetsPath + 'models/svg/tests/6.svg',
                'Test 7': assetsPath + 'models/svg/tests/7.svg',
                'Test 8': assetsPath + 'models/svg/tests/8.svg',
                'Test 9': assetsPath + 'models/svg/tests/9.svg',
                'Units': assetsPath + 'models/svg/tests/units.svg',
                'Ordering': assetsPath + 'models/svg/tests/ordering.svg',
                'Defs': assetsPath + 'models/svg/tests/testDefs/Svg-defs.svg',
                'Defs2': assetsPath + 'models/svg/tests/testDefs/Svg-defs2.svg',
                'Defs3': assetsPath + 'models/svg/tests/testDefs/Wave-defs.svg',
                'Defs4': assetsPath + 'models/svg/tests/testDefs/defs4.svg',
                'Defs5': assetsPath + 'models/svg/tests/testDefs/defs5.svg',
                'Style CSS inside defs': assetsPath + 'models/svg/style-css-inside-defs.svg',
                'Multiple CSS classes': assetsPath + 'models/svg/multiple-css-classes.svg',
                'Zero Radius': assetsPath + 'models/svg/zero-radius.svg',
                'Styles in svg tag': assetsPath + 'models/svg/tests/styles.svg',
                'Round join': assetsPath + 'models/svg/tests/roundJoinPrecisionIssue.svg',
                'Ellipse Transformations': assetsPath + 'models/svg/tests/ellipseTransform.svg',
                'singlePointTest':assetsPath +  'models/svg/singlePointTest.svg',
                'singlePointTest2': assetsPath + 'models/svg/singlePointTest2.svg',
                'singlePointTest3':assetsPath +  'models/svg/singlePointTest3.svg',
                'emptyPath': assetsPath + 'models/svg/emptyPath.svg',
        
            } ).name( 'SVG File' ).onChange( update );
        
            gui.add( guiData, 'drawStrokes' ).name( 'Draw strokes' ).onChange( update );
        
            gui.add( guiData, 'drawFillShapes' ).name( 'Draw fill shapes' ).onChange( update );
        
            gui.add( guiData, 'strokesWireframe' ).name( 'Wireframe strokes' ).onChange( update );
        
            gui.add( guiData, 'fillShapesWireframe' ).name( 'Wireframe fill shapes' ).onChange( update );
        
            function update() {
        
                loadSVG( guiData.currentURL );
        
            }
        
        }
        
        function loadSVG( url ) {
        
            // 新建场景，并置为当前场景
            scene = new THREE.Scene();
        	scene.background = new THREE.Color( 0xb0b0b0 );
            app.setScene(scene)
        
            const helper = new THREE.GridHelper( 160, 10, 0x8d8d8d, 0xc1c1c1 );
            helper.rotation.x = Math.PI / 2;
            scene.add( helper );
        
            //
        
            vjmap3d.ResManager.loadRes( url, false).then(( data ) => {
        
                const group = new THREE.Group();
                group.scale.multiplyScalar( 0.25 );
                group.position.x = - 70;
                group.position.y = 70;
                group.scale.y *= - 1;
        
                let renderOrder = 0;
        
                for ( const path of data.paths ) {
        
                    const fillColor = path.userData.style.fill;
        
                    if ( guiData.drawFillShapes && fillColor !== undefined && fillColor !== 'none' ) {
        
                        const material = new THREE.MeshBasicMaterial( {
                            color: new THREE.Color().setStyle( fillColor ),
                            opacity: path.userData.style.fillOpacity,
                            transparent: true,
                            side: THREE.DoubleSide,
                            depthWrite: false,
                            wireframe: guiData.fillShapesWireframe
                        } );
        
                        const shapes = SVGLoader.createShapes( path );
        
                        for ( const shape of shapes ) {
        
                            const geometry = new THREE.ShapeGeometry( shape );
                            const mesh = new THREE.Mesh( geometry, material );
                            mesh.renderOrder = renderOrder ++;
        
                            group.add( mesh );
        
                        }
        
                    }
        
                    const strokeColor = path.userData.style.stroke;
        
                    if ( guiData.drawStrokes && strokeColor !== undefined && strokeColor !== 'none' ) {
        
                        const material = new THREE.MeshBasicMaterial( {
                            color: new THREE.Color().setStyle( strokeColor ),
                            opacity: path.userData.style.strokeOpacity,
                            transparent: true,
                            side: THREE.DoubleSide,
                            depthWrite: false,
                            wireframe: guiData.strokesWireframe
                        } );
        
                        for ( const subPath of path.subPaths ) {
        
                            const geometry = SVGLoader.pointsToStroke( subPath.getPoints(), path.userData.style );
        
                            if ( geometry ) {
        
                                const mesh = new THREE.Mesh( geometry, material );
                                mesh.renderOrder = renderOrder ++;
        
                                group.add( mesh );
        
                            }
        
                        }
        
                    }
        
                }
        
                scene.add( group );
            } );
        
        }
        
        
        
        
    }
    catch (e) {
        console.error(e);
    }
};