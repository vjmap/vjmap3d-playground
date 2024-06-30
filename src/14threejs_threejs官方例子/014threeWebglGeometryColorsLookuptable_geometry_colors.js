
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/014threeWebglGeometryColorsLookuptable
        // --geometry_colors_lookuptable--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_geometry_colors_lookuptable
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                background: 0xffffff,
                defaultLights: true
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 60,
                near: 1,
                far: 100,
                position: [  0, 0, 10]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        let perpCamera = camera, orthoCamera, lut;
        
        let mesh, sprite;
        let uiScene;
        
        let params;
        
        init();
        
        function init() {
        
            uiScene = new THREE.Scene();
        
            lut = new Lut();
        
            orthoCamera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 1, 2 );
            orthoCamera.position.set( 0.5, 0, 1 );
        
            sprite = new THREE.Sprite( new THREE.SpriteMaterial( {
                map: new THREE.CanvasTexture( lut.createCanvas() )
            } ) );
            sprite.material.map.colorSpace = THREE.SRGBColorSpace;
            sprite.scale.x = 0.125;
            uiScene.add( sprite );
        
            mesh = new THREE.Mesh( undefined, new THREE.MeshLambertMaterial( {
                side: THREE.DoubleSide,
                color: 0xF5F5F5,
                vertexColors: true
            } ) );
            scene.add( mesh );
        
            params	= {
                colorMap: 'rainbow',
            };
            loadModel( );
        
            const pointLight = new THREE.PointLight( 0xffffff, 3, 0, 0 );
            perpCamera.add( pointLight );
        
            app.signal.onAppAfterRender.add(() => {
                renderer.render( uiScene, orthoCamera );
            })
        
            const gui = new GUI();
        
            gui.add( params, 'colorMap', [ 'rainbow', 'cooltowarm', 'blackbody', 'grayscale' ] ).onChange( function () {
        
                updateColors();
                
        
            } );
        
        }
        
        
        function loadModel( ) {
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
            const loader = new THREE.BufferGeometryLoader();
            loader.load( assetsPath + 'models/json/pressure.json', function ( geometry ) {
        
                geometry.center();
                geometry.computeVertexNormals();
        
                // default color attribute
                const colors = [];
        
                for ( let i = 0, n = geometry.attributes.position.count; i < n; ++ i ) {
        
                    colors.push( 1, 1, 1 );
        
                }
        
                geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
        
                mesh.geometry = geometry;
                updateColors();
        
        
            } );
        
        }
        
        function updateColors() {
        
            lut.setColorMap( params.colorMap );
        
            lut.setMax( 2000 );
            lut.setMin( 0 );
        
            const geometry = mesh.geometry;
            const pressures = geometry.attributes.pressure;
            const colors = geometry.attributes.color;
            const color = new THREE.Color();
        
            for ( let i = 0; i < pressures.array.length; i ++ ) {
        
                const colorValue = pressures.array[ i ];
        
                color.copy( lut.getColor( colorValue ) ).convertSRGBToLinear();
        
                colors.setXYZ( i, color.r, color.g, color.b );
        
            }
        
            colors.needsUpdate = true;
        
            const map = sprite.material.map;
            lut.updateCanvas( map.image );
            map.needsUpdate = true;
        
        }
    }
    catch (e) {
        console.error(e);
    }
};