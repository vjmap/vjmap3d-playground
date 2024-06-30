
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/049threeWebgllinesFat
        // --lines_fat--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_lines_fat
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
                far: 1000,
                position: [ - 40, 0, 60 ]
            },
            control: {
                minDistance: 10,
                maxDistance: 500
            },
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        let line,  camera2;
        let line1;
        let matLine, matLineBasic, matLineDashed;
        let stats, gpuPanel;
        let gui;
        
        // @ts-ignore
        stats = app.getModule(vjmap3d.StatModule)._stats;
        // viewport
        let insetWidth;
        let insetHeight;
        
        init();
        
        function init() {
        
            renderer.setClearColor( 0x000000, 0.0 );
        
            camera2 = new THREE.PerspectiveCamera( 40, 1, 1, 1000 );
            camera2.position.copy( camera.position );
        
            // Position and THREE.Color Data
        
            const positions = [];
            const colors = [];
        
            const points = GeometryUtils.hilbert3D( new THREE.Vector3( 0, 0, 0 ), 20.0, 1, 0, 1, 2, 3, 4, 5, 6, 7 );
        
            const spline = new THREE.CatmullRomCurve3( points );
            const divisions = Math.round( 12 * points.length );
            const point = new THREE.Vector3();
            const color = new THREE.Color();
        
            for ( let i = 0, l = divisions; i < l; i ++ ) {
        
                const t = i / l;
        
                spline.getPoint( t, point );
                positions.push( point.x, point.y, point.z );
        
                color.setHSL( t, 1.0, 0.5, THREE.SRGBColorSpace );
                colors.push( color.r, color.g, color.b );
        
            }
        
        
            // Line2 ( LineGeometry, LineMaterial )
        
            const geometry = new LineGeometry();
            geometry.setPositions( positions );
            geometry.setColors( colors );
        
            matLine = new LineMaterial( {
        
                color: 0xffffff,
                linewidth: 5, // in world units with size attenuation, pixels otherwise
                vertexColors: true,
        
                dashed: false,
                alphaToCoverage: true,
        
            } );
        
            line = new Line2( geometry, matLine );
            line.computeLineDistances();
            line.scale.set( 1, 1, 1 );
            scene.add( line );
        
        
            // THREE.Line ( THREE.BufferGeometry, THREE.LineBasicMaterial ) - rendered with gl.LINE_STRIP
        
            const geo = new THREE.BufferGeometry();
            geo.setAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
            geo.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
        
            matLineBasic = new THREE.LineBasicMaterial( { vertexColors: true } );
            matLineDashed = new THREE.LineDashedMaterial( { vertexColors: true, scale: 2, dashSize: 1, gapSize: 1 } );
        
            line1 = new THREE.Line( geo, matLineBasic );
            line1.computeLineDistances();
            line1.visible = false;
            scene.add( line1 );
        
            gpuPanel = new GPUStatsPanel( renderer.getContext() );
            stats.addPanel( gpuPanel );
            stats.showPanel( 0 );
        
            initGui();
        
            app.signal.onContainerSizeChange.add(() => {
                camera2.aspect = app.containerSize.width / app.containerSize.height;
                camera2.updateProjectionMatrix();
            })
        
            app.signal.onAppBeforeRender.add(animate)
        
        }
        function animate() {
        
            // main scene
        
            renderer.setClearColor( 0x000000, 0 );
        
            renderer.setViewport( 0, 0, window.innerWidth, window.innerHeight );
        
        
            gpuPanel.startQuery();
            renderer.render( scene, camera );
            gpuPanel.endQuery();
        
            // inset scene
        
            renderer.setClearColor( 0x222222, 1 );
        
            renderer.clearDepth(); // important!
        
            renderer.setScissorTest( true );
        
            insetWidth = app.containerSize.height / 4; // square
        	insetHeight = app.containerSize.height / 4;
            renderer.setScissor( 20, 20, insetWidth, insetHeight );
        
            renderer.setViewport( 20, 20, insetWidth, insetHeight );
        
            camera2.position.copy( camera.position );
            camera2.quaternion.copy( camera.quaternion );
        
            renderer.render( scene, camera2 );
        
            renderer.setScissorTest( false );
        
        }
        
        //
        
        function initGui() {
        
            gui = new GUI();
        
            const param = {
                'line type': 0,
                'world units': false,
                'width': 5,
                'alphaToCoverage': true,
                'dashed': false,
                'dash scale': 1,
                'dash / gap': 1
            };
        
            gui.add( param, 'line type', { 'LineGeometry': 0, 'gl.LINE': 1 } ).onChange( function ( val ) {
        
                switch ( val ) {
        
                    case 0:
                        line.visible = true;
        
                        line1.visible = false;
        
                        break;
        
                    case 1:
                        line.visible = false;
        
                        line1.visible = true;
        
                        break;
        
                }
        
            } );
        
            gui.add( param, 'world units' ).onChange( function ( val ) {
        
                matLine.worldUnits = val;
                matLine.needsUpdate = true;
        
            } );
        
            gui.add( param, 'width', 1, 10 ).onChange( function ( val ) {
        
                matLine.linewidth = val;
        
            } );
        
            gui.add( param, 'alphaToCoverage' ).onChange( function ( val ) {
        
                matLine.alphaToCoverage = val;
        
            } );
        
            gui.add( param, 'dashed' ).onChange( function ( val ) {
        
                matLine.dashed = val;
                line1.material = val ? matLineDashed : matLineBasic;
        
            } );
        
            gui.add( param, 'dash scale', 0.5, 2, 0.1 ).onChange( function ( val ) {
        
                matLine.dashScale = val;
                matLineDashed.scale = val;
        
            } );
        
            gui.add( param, 'dash / gap', { '2 : 1': 0, '1 : 1': 1, '1 : 2': 2 } ).onChange( function ( val ) {
        
                switch ( val ) {
        
                    case 0:
                        matLine.dashSize = 2;
                        matLine.gapSize = 1;
        
                        matLineDashed.dashSize = 2;
                        matLineDashed.gapSize = 1;
        
                        break;
        
                    case 1:
                        matLine.dashSize = 1;
                        matLine.gapSize = 1;
        
                        matLineDashed.dashSize = 1;
                        matLineDashed.gapSize = 1;
        
                        break;
        
                    case 2:
                        matLine.dashSize = 1;
                        matLine.gapSize = 2;
        
                        matLineDashed.dashSize = 1;
                        matLineDashed.gapSize = 2;
        
                        break;
        
                }
        
            } );
        
        }
        
        
        
        
        
    }
    catch (e) {
        console.error(e);
    }
};