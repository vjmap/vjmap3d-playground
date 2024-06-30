
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/086threeWebglmaterialsmaterialsTextureCanvas
        // --materials_texture_canvas--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_materials_texture_canvas
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 50,
                near: 1,
                far: 2000,
                position: [ 0, 0, 500]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        let mesh, material;
        const drawStartPos = new THREE.Vector2();
        
        document.body.appendChild(vjmap3d.DOM.createStyledDiv(`<canvas id="drawing-canvas" height="128" width="128"></canvas>`, `
        #drawing-canvas {
            position: absolute;
            background-color: #000000;
            top: 0px;
            right: 0px;
            z-index: 3000;
            cursor: crosshair;
            touch-action: none;
        }
        `))
        init();
        setupCanvasDrawing();
        
        function init() {
        
            material = new THREE.MeshBasicMaterial();
        
            mesh = new THREE.Mesh( new THREE.BoxGeometry( 200, 200, 200 ), material );
            scene.add( mesh );
        
        
            vjmap3d.Entity.attchObject(mesh).addAction(() => {
                
                mesh.rotation.x += 0.01;
                mesh.rotation.y += 0.01;
            })
        }
        
        // Sets up the drawing canvas and adds it as the material map
        
        function setupCanvasDrawing() {
        
            // get canvas and context
        
            const drawingCanvas = document.getElementById( 'drawing-canvas' );
            const drawingContext = drawingCanvas.getContext( '2d' );
        
            // draw white background
        
            drawingContext.fillStyle = '#FFFFFF';
            drawingContext.fillRect( 0, 0, 128, 128 );
        
            // set canvas as material.map (this could be done to any map, bump, displacement etc.)
        
            material.map = new THREE.CanvasTexture( drawingCanvas );
        
            // set the variable to keep track of when to draw
        
            let paint = false;
        
            // add canvas event listeners
            drawingCanvas.addEventListener( 'pointerdown', function ( e ) {
        
                paint = true;
                drawStartPos.set( e.offsetX, e.offsetY );
        
            } );
        
            drawingCanvas.addEventListener( 'pointermove', function ( e ) {
        
                if ( paint ) draw( drawingContext, e.offsetX, e.offsetY );
        
            } );
        
            drawingCanvas.addEventListener( 'pointerup', function () {
        
                paint = false;
        
            } );
        
            drawingCanvas.addEventListener( 'pointerleave', function () {
        
                paint = false;
        
            } );
        
        }
        
        function draw( drawContext, x, y ) {
        
            drawContext.moveTo( drawStartPos.x, drawStartPos.y );
            drawContext.strokeStyle = '#000000';
            drawContext.lineTo( x, y );
            drawContext.stroke();
            // reset drawing start position to current position.
            drawStartPos.set( x, y );
            // need to flag the map as needing updating.
            material.map.needsUpdate = true;
        
        }
        
        
        
    }
    catch (e) {
        console.error(e);
    }
};