
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/050threeWebgllinesFatRaycasting
        // --lines_fat_raycasting--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_lines_fat_raycasting
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
        
        let line, thresholdLine, segments, thresholdSegments;
        let sphereInter, sphereOnLine;
        let stats, gpuPanel;
        let gui;
        
        const color = new THREE.Color();
        
        const pointer = new THREE.Vector2( Infinity, Infinity );
        
        const raycaster = new THREE.Raycaster();
        
        raycaster.params.Line2 = {};
        raycaster.params.Line2.threshold = 0;
        
        const matLine = new LineMaterial( {
        
            color: 0xffffff,
            linewidth: 1, // in world units with size attenuation, pixels otherwise
            worldUnits: true,
            vertexColors: true,
        
            alphaToCoverage: true,
        
        } );
        
        const matThresholdLine = new LineMaterial( {
        
            color: 0xffffff,
            linewidth: matLine.linewidth, // in world units with size attenuation, pixels otherwise
            worldUnits: true,
            // vertexColors: true,
            transparent: true,
            opacity: 0.2,
            depthTest: false,
            visible: false,
        
        } );
        
        const params = {
        
            'line type': 0,
            'world units': matLine.worldUnits,
            'visualize threshold': matThresholdLine.visible,
            'width': matLine.linewidth,
            'alphaToCoverage': matLine.alphaToCoverage,
            'threshold': raycaster.params.Line2.threshold,
            'translation': raycaster.params.Line2.threshold,
            'animate': true
        
        };
        
        init();
        
        function init() {
        
            renderer.setClearColor( 0x000000, 0.0 );
        
            const sphereGeometry = new THREE.SphereGeometry( 0.25, 8, 4 );
            const sphereInterMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, depthTest: false } );
            const sphereOnLineMaterial = new THREE.MeshBasicMaterial( { color: 0x00ff00, depthTest: false } );
        
            sphereInter = new THREE.Mesh( sphereGeometry, sphereInterMaterial );
            sphereOnLine = new THREE.Mesh( sphereGeometry, sphereOnLineMaterial );
            sphereInter.visible = false;
            sphereOnLine.visible = false;
            sphereInter.renderOrder = 10;
            sphereOnLine.renderOrder = 10;
            scene.add( sphereInter );
            scene.add( sphereOnLine );
        
            // Position and THREE.Color Data
        
            const positions = [];
            const colors = [];
            const points = [];
            for ( let i = - 50; i < 50; i ++ ) {
        
                const t = i / 3;
                points.push( new THREE.Vector3( t * Math.sin( 2 * t ), t, t * Math.cos( 2 * t ) ) );
        
            }
        
            const spline = new THREE.CatmullRomCurve3( points );
            const divisions = Math.round( 3 * points.length );
            const point = new THREE.Vector3();
            const color = new THREE.Color();
        
            for ( let i = 0, l = divisions; i < l; i ++ ) {
        
                const t = i / l;
        
                spline.getPoint( t, point );
                positions.push( point.x, point.y, point.z );
        
                color.setHSL( t, 1.0, 0.5, THREE.SRGBColorSpace );
                colors.push( color.r, color.g, color.b );
        
            }
        
            const lineGeometry = new LineGeometry();
            lineGeometry.setPositions( positions );
            lineGeometry.setColors( colors );
        
            const segmentsGeometry = new LineSegmentsGeometry();
            segmentsGeometry.setPositions( positions );
            segmentsGeometry.setColors( colors );
        
            segments = new LineSegments2( segmentsGeometry, matLine );
            segments.computeLineDistances();
            segments.scale.set( 1, 1, 1 );
            scene.add( segments );
            segments.visible = false;
        
            thresholdSegments = new LineSegments2( segmentsGeometry, matThresholdLine );
            thresholdSegments.computeLineDistances();
            thresholdSegments.scale.set( 1, 1, 1 );
            scene.add( thresholdSegments );
            thresholdSegments.visible = false;
        
            line = new Line2( lineGeometry, matLine );
            line.computeLineDistances();
            line.scale.set( 1, 1, 1 );
            scene.add( line );
        
            thresholdLine = new Line2( lineGeometry, matThresholdLine );
            thresholdLine.computeLineDistances();
            thresholdLine.scale.set( 1, 1, 1 );
            scene.add( thresholdLine );
        
            const geo = new THREE.BufferGeometry();
            geo.setAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
            geo.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
        
            //
           
            stats = app.getModule(vjmap3d.StatModule)._stats;
        
            gpuPanel = new GPUStatsPanel( renderer.getContext() );
            stats.addPanel( gpuPanel );
            stats.showPanel( 0 );
            initGui();
        
            app.signal.onAppUpdate.add(e =>  animate(e))
            app.signal.onAppBeforeRender.add(() =>  gpuPanel.startQuery());
            app.signal.onAppAfterRender.add(() =>  gpuPanel.endQuery());
        }
        
        
        function animate(e) {
        
            const delta = e.deltaTime;
        
            pointer.x = (app.Input.x() / window.innerWidth ) * 2 - 1;
            pointer.y = - ( app.Input.y() / window.innerHeight ) * 2 + 1;
        
            const obj = line.visible ? line : segments;
            thresholdLine.position.copy( line.position );
            thresholdLine.quaternion.copy( line.quaternion );
            thresholdSegments.position.copy( segments.position );
            thresholdSegments.quaternion.copy( segments.quaternion );
        
            if ( params.animate ) {
        
                line.rotation.y += delta * 0.1;
        
                segments.rotation.y = line.rotation.y;
        
            }
        
            raycaster.setFromCamera( pointer, camera );
        
            const intersects = raycaster.intersectObject( obj );
        
            if ( intersects.length > 0 ) {
        
                sphereInter.visible = true;
                sphereOnLine.visible = true;
        
                sphereInter.position.copy( intersects[ 0 ].point );
                sphereOnLine.position.copy( intersects[ 0 ].pointOnLine );
        
                const index = intersects[ 0 ].faceIndex;
                const colors = obj.geometry.getAttribute( 'instanceColorStart' );
        
                color.fromBufferAttribute( colors, index );
        
                sphereInter.material.color.copy( color ).offsetHSL( 0.3, 0, 0 );
                sphereOnLine.material.color.copy( color ).offsetHSL( 0.7, 0, 0 );
        
                renderer.domElement.style.cursor = 'crosshair';
        
            } else {
        
                sphereInter.visible = false;
                sphereOnLine.visible = false;
                renderer.domElement.style.cursor = '';
        
            }
        
           
           
        
        }
        
        //
        
        function switchLine( val ) {
        
            switch ( val ) {
        
                case 0:
                    line.visible = true;
                    thresholdLine.visible = true;
        
                    segments.visible = false;
                    thresholdSegments.visible = false;
        
                    break;
        
                case 1:
                    line.visible = false;
                    thresholdLine.visible = false;
        
                    segments.visible = true;
                    thresholdSegments.visible = true;
        
                    break;
        
            }
        
        }
        
        function initGui() {
        
            gui = new GUI();
        
            gui.add( params, 'line type', { 'LineGeometry': 0, 'LineSegmentsGeometry': 1 } ).onChange( function ( val ) {
        
                switchLine( val );
        
            } ).setValue( 1 );
        
            gui.add( params, 'world units' ).onChange( function ( val ) {
        
                matLine.worldUnits = val;
                matLine.needsUpdate = true;
        
                matThresholdLine.worldUnits = val;
                matThresholdLine.needsUpdate = true;
        
            } );
        
            gui.add( params, 'visualize threshold' ).onChange( function ( val ) {
        
                matThresholdLine.visible = val;
        
            } );
        
            gui.add( params, 'width', 1, 10 ).onChange( function ( val ) {
        
                matLine.linewidth = val;
                matThresholdLine.linewidth = matLine.linewidth + raycaster.params.Line2.threshold;
        
            } );
        
            gui.add( params, 'alphaToCoverage' ).onChange( function ( val ) {
        
                matLine.alphaToCoverage = val;
        
            } );
        
            gui.add( params, 'threshold', 0, 10 ).onChange( function ( val ) {
        
                raycaster.params.Line2.threshold = val;
                matThresholdLine.linewidth = matLine.linewidth + raycaster.params.Line2.threshold;
        
            } );
        
            gui.add( params, 'translation', 0, 10 ).onChange( function ( val ) {
        
                line.position.x = val;
                segments.position.x = val;
        
            } );
        
            gui.add( params, 'animate' );
        
        }
        
        
        
        
    }
    catch (e) {
        console.error(e);
    }
};