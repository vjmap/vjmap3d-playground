
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/120threeWebglraycastertexture
        // --raycaster_texture--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_raycaster_texture
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                background: 0xeeeeee,
                defaultLights: false
            },
            camera: {
                fov: 45,
                near: 1,
                far: 1000,
                position: [ - 30, 40, 50 ]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        const WRAPPING = {
            'RepeatWrapping': THREE.RepeatWrapping,
            'ClampToEdgeWrapping': THREE.ClampToEdgeWrapping,
            'MirroredRepeatWrapping': THREE.MirroredRepeatWrapping
        };
        
        const params = {
            wrapS: THREE.RepeatWrapping,
            wrapT: THREE.RepeatWrapping,
            offsetX: 0,
            offsetY: 0,
            repeatX: 1,
            repeatY: 1,
            rotation: 0,
        };
        
        let assetsPath = "https://vjmap.com/map3d/resources/three/"
        function CanvasTexture( parentTexture ) {
        
            this._canvas = document.createElement( 'canvas' );
            this._canvas.width = this._canvas.height = 1024;
            this._context2D = this._canvas.getContext( '2d' );
        
            if ( parentTexture ) {
        
                this._parentTexture.push( parentTexture );
                parentTexture.image = this._canvas;
        
            }
        
            const that = this;
            this._background = document.createElement( 'img' );
            this._background.addEventListener( 'load', function () {
        
                that._canvas.width = that._background.naturalWidth;
                that._canvas.height = that._background.naturalHeight;
        
                that._crossRadius = Math.ceil( Math.min( that._canvas.width, that._canvas.height / 30 ) );
                that._crossMax = Math.ceil( 0.70710678 * that._crossRadius );
                that._crossMin = Math.ceil( that._crossMax / 10 );
                that._crossThickness = Math.ceil( that._crossMax / 10 );
        
                that._draw();
        
            } );
            this._background.crossOrigin = '';
            this._background.src = assetsPath + 'textures/uv_grid_opengl.jpg';
        
            this._draw();
        
        }
        
        
        CanvasTexture.prototype = {
        
            constructor: CanvasTexture,
        
            _canvas: null,
            _context2D: null,
            _xCross: 0,
            _yCross: 0,
        
            _crossRadius: 57,
            _crossMax: 40,
            _crossMin: 4,
            _crossThickness: 4,
        
            _parentTexture: [],
        
            addParent: function ( parentTexture ) {
        
                if ( this._parentTexture.indexOf( parentTexture ) === - 1 ) {
        
                    this._parentTexture.push( parentTexture );
                    parentTexture.image = this._canvas;
        
                }
        
            },
        
            setCrossPosition: function ( x, y ) {
        
                this._xCross = x * this._canvas.width;
                this._yCross = y * this._canvas.height;
        
                this._draw();
        
            },
        
            _draw: function () {
        
                if ( ! this._context2D ) return;
        
                this._context2D.clearRect( 0, 0, this._canvas.width, this._canvas.height );
        
                // Background.
                this._context2D.drawImage( this._background, 0, 0 );
        
                // Yellow cross.
                this._context2D.lineWidth = this._crossThickness * 3;
                this._context2D.strokeStyle = '#FFFF00';
        
                this._context2D.beginPath();
                this._context2D.moveTo( this._xCross - this._crossMax - 2, this._yCross - this._crossMax - 2 );
                this._context2D.lineTo( this._xCross - this._crossMin, this._yCross - this._crossMin );
        
                this._context2D.moveTo( this._xCross + this._crossMin, this._yCross + this._crossMin );
                this._context2D.lineTo( this._xCross + this._crossMax + 2, this._yCross + this._crossMax + 2 );
        
                this._context2D.moveTo( this._xCross - this._crossMax - 2, this._yCross + this._crossMax + 2 );
                this._context2D.lineTo( this._xCross - this._crossMin, this._yCross + this._crossMin );
        
                this._context2D.moveTo( this._xCross + this._crossMin, this._yCross - this._crossMin );
                this._context2D.lineTo( this._xCross + this._crossMax + 2, this._yCross - this._crossMax - 2 );
        
                this._context2D.stroke();
        
                for ( let i = 0; i < this._parentTexture.length; i ++ ) {
        
                    this._parentTexture[ i ].needsUpdate = true;
        
                }
        
            }
        
        };
        
        
        let canvas, container;
        let planeTexture, cubeTexture, circleTexture;
        
        
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        const onClickPosition = new THREE.Vector2();
        
        init();
        
        function init() {
            container = document.getElementById( 'map' );
            camera.lookAt( scene.position );
            // A cube, in the middle.
            cubeTexture = new THREE.Texture( undefined, THREE.UVMapping, THREE.RepeatWrapping, THREE.RepeatWrapping );
            cubeTexture.colorSpace = THREE.SRGBColorSpace;
            canvas = new CanvasTexture( cubeTexture );
            const cubeMaterial = new THREE.MeshBasicMaterial( { map: cubeTexture } );
            const cubeGeometry = new THREE.BoxGeometry( 20, 20, 20 );
            let uvs = cubeGeometry.attributes.uv.array;
            // Set a specific texture mapping.
            for ( let i = 0; i < uvs.length; i ++ ) {
        
                uvs[ i ] *= 2;
        
            }
        
            const cube = new THREE.Mesh( cubeGeometry, cubeMaterial );
            cube.position.x = 4;
            cube.position.y = - 5;
            cube.position.z = 0;
            scene.add( cube );
        
            // A plane on the left
        
            planeTexture = new THREE.Texture( undefined, THREE.UVMapping, THREE.MirroredRepeatWrapping, THREE.MirroredRepeatWrapping );
            planeTexture.colorSpace = THREE.SRGBColorSpace;
            canvas.addParent( planeTexture );
            const planeMaterial = new THREE.MeshBasicMaterial( { map: planeTexture } );
            const planeGeometry = new THREE.PlaneGeometry( 25, 25, 1, 1 );
            uvs = planeGeometry.attributes.uv.array;
        
            // Set a specific texture mapping.
        
            for ( let i = 0; i < uvs.length; i ++ ) {
        
                uvs[ i ] *= 2;
        
            }
        
            const plane = new THREE.Mesh( planeGeometry, planeMaterial );
            plane.position.x = - 16;
            plane.position.y = - 5;
            plane.position.z = 0;
            scene.add( plane );
        
            // A circle on the right.
        
            circleTexture = new THREE.Texture( undefined, THREE.UVMapping, THREE.RepeatWrapping, THREE.RepeatWrapping );
            circleTexture.colorSpace = THREE.SRGBColorSpace;
            canvas.addParent( circleTexture );
            const circleMaterial = new THREE.MeshBasicMaterial( { map: circleTexture } );
            const circleGeometry = new THREE.CircleGeometry( 25, 40, 0, Math.PI * 2 );
            uvs = circleGeometry.attributes.uv.array;
        
            // Set a specific texture mapping.
        
            for ( let i = 0; i < uvs.length; i ++ ) {
        
                uvs[ i ] = ( uvs[ i ] - 0.25 ) * 2;
        
            }
        
            const circle = new THREE.Mesh( circleGeometry, circleMaterial );
            circle.position.x = 24;
            circle.position.y = - 5;
            circle.position.z = 0;
            scene.add( circle );
        
            container.addEventListener( 'mousemove', onMouseMove );
        
            //
        
            const gui = new GUI();
            gui.title( 'Circle Texture Settings' );
        
            gui.add( params, 'wrapS', WRAPPING ).onChange( setwrapS );
            gui.add( params, 'wrapT', WRAPPING ).onChange( setwrapT );
            gui.add( params, 'offsetX', 0, 5 );
            gui.add( params, 'offsetY', 0, 5 );
            gui.add( params, 'repeatX', 0, 5 );
            gui.add( params, 'repeatY', 0, 5 );
            gui.add( params, 'rotation', 0, 2 * Math.PI );
            gui.open();
        
            app.signal.onAppUpdate.add(animate)
        }
        
        
        function onMouseMove( evt ) {
        
            evt.preventDefault();
        
            const array = getMousePosition( container, evt.clientX, evt.clientY );
            onClickPosition.fromArray( array );
        
            const intersects = getIntersects( onClickPosition, scene.children );
        
            if ( intersects.length > 0 && intersects[ 0 ].uv ) {
        
                const uv = intersects[ 0 ].uv;
                intersects[ 0 ].object.material.map.transformUv( uv );
                canvas.setCrossPosition( uv.x, uv.y );
        
            }
        
        }
        
        function getMousePosition( dom, x, y ) {
        
            const rect = dom.getBoundingClientRect();
            return [ ( x - rect.left ) / rect.width, ( y - rect.top ) / rect.height ];
        
        }
        
        function getIntersects( point, objects ) {
        
            mouse.set( ( point.x * 2 ) - 1, - ( point.y * 2 ) + 1 );
        
            raycaster.setFromCamera( mouse, camera );
        
            return raycaster.intersectObjects( objects, false );
        
        }
        
        function animate() {
        
            // update texture parameters
        
            circleTexture.offset.x = params.offsetX;
            circleTexture.offset.y = params.offsetY;
            circleTexture.repeat.x = params.repeatX;
            circleTexture.repeat.y = params.repeatY;
            circleTexture.rotation = params.rotation;
        
        
        }
        
        function setwrapS( value ) {
        
            circleTexture.wrapS = value;
            circleTexture.needsUpdate = true;
        
        }
        
        function setwrapT( value ) {
        
            circleTexture.wrapT = value;
            circleTexture.needsUpdate = true;
        
        }
        
        
        
        
        
    }
    catch (e) {
        console.error(e);
    }
};