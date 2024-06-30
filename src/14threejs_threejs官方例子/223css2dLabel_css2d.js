
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/223css2dLabel
        // --css2d_label--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#css2d_label
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            camera: {
                fov: 45,
                near: 0.1,
                far: 200,
                position: [10, 5, 20]
            },
            control: {
                minDistance: 5,
                maxDistance: 100
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        
        
        
        let gui;
        
        let labelRenderer;
        
        const layers = {
        
            'Toggle Name': function () {
        
                camera.layers.toggle( 0 );
        
            },
            'Toggle Mass': function () {
        
                camera.layers.toggle( 1 );
        
            },
            'Enable All': function () {
        
                camera.layers.enableAll();
        
            },
        
            'Disable All': function () {
        
                camera.layers.disableAll();
        
            }
        
        };
        
        const textureLoader = new THREE.TextureLoader();
        
        let moon;
        
        init();
        
        function init() {
        
            var style = document.createElement('style');
            style.type = 'text/css';
            style.innerHTML = `.label {
                color: #FFF;
                font-family: sans-serif;
                padding: 2px;
                background: rgba( 0, 0, 0, .6 );
            }`;
            document.head.appendChild(style);
            
            const EARTH_RADIUS = 1;
            const MOON_RADIUS = 0.27;
        
            camera.layers.enableAll();
        
        
            const dirLight = new THREE.DirectionalLight( 0xffffff, 3 );
            dirLight.position.set( 0, 0, 1 );
            dirLight.layers.enableAll();
            scene.add( dirLight );
        
            const axesHelper = new THREE.AxesHelper( 5 );
            axesHelper.layers.enableAll();
            scene.add( axesHelper );
        
            //
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
            const earthGeometry = new THREE.SphereGeometry( EARTH_RADIUS, 16, 16 );
            const earthMaterial = new THREE.MeshPhongMaterial( {
                specular: 0x333333,
                shininess: 5,
                map: textureLoader.load( assetsPath + 'textures/planets/earth_atmos_2048.jpg' ),
                specularMap: textureLoader.load(assetsPath + 'textures/planets/earth_specular_2048.jpg' ),
                normalMap: textureLoader.load(assetsPath + 'textures/planets/earth_normal_2048.jpg' ),
                normalScale: new THREE.Vector2( 0.85, 0.85 )
            } );
            earthMaterial.map.colorSpace = THREE.SRGBColorSpace;
            const earth = new THREE.Mesh( earthGeometry, earthMaterial );
            scene.add( earth );
        
            const moonGeometry = new THREE.SphereGeometry( MOON_RADIUS, 16, 16 );
            const moonMaterial = new THREE.MeshPhongMaterial( {
                shininess: 5,
                map: textureLoader.load(assetsPath + 'textures/planets/moon_1024.jpg' )
            } );
            moonMaterial.map.colorSpace = THREE.SRGBColorSpace;
            moon = new THREE.Mesh( moonGeometry, moonMaterial );
            scene.add( moon );
        
            //
        
            earth.layers.enableAll();
            moon.layers.enableAll();
        
            const earthDiv = document.createElement( 'div' );
            earthDiv.className = 'label';
            earthDiv.textContent = 'Earth';
            earthDiv.style.backgroundColor = 'transparent';
        
            const earthLabel = new CSS2DObject( earthDiv );
            earthLabel.position.set( 1.5 * EARTH_RADIUS, 0, 0 );
            earthLabel.center.set( 0, 1 );
            earth.add( earthLabel );
            earthLabel.layers.set( 0 );
        
            const earthMassDiv = document.createElement( 'div' );
            earthMassDiv.className = 'label';
            earthMassDiv.textContent = '5.97237e24 kg';
            earthMassDiv.style.backgroundColor = 'transparent';
        
            const earthMassLabel = new CSS2DObject( earthMassDiv );
            earthMassLabel.position.set( 1.5 * EARTH_RADIUS, 0, 0 );
            earthMassLabel.center.set( 0, 0 );
            earth.add( earthMassLabel );
            earthMassLabel.layers.set( 1 );
        
            const moonDiv = document.createElement( 'div' );
            moonDiv.className = 'label';
            moonDiv.textContent = 'Moon';
            moonDiv.style.backgroundColor = 'transparent';
        
            const moonLabel = new CSS2DObject( moonDiv );
            moonLabel.position.set( 1.5 * MOON_RADIUS, 0, 0 );
            moonLabel.center.set( 0, 1 );
            moon.add( moonLabel );
            moonLabel.layers.set( 0 );
        
            const moonMassDiv = document.createElement( 'div' );
            moonMassDiv.className = 'label';
            moonMassDiv.textContent = '7.342e22 kg';
            moonMassDiv.style.backgroundColor = 'transparent';
        
            const moonMassLabel = new CSS2DObject( moonMassDiv );
            moonMassLabel.position.set( 1.5 * MOON_RADIUS, 0, 0 );
            moonMassLabel.center.set( 0, 0 );
            moon.add( moonMassLabel );
            moonMassLabel.layers.set( 1 );
        
            //
        
           
        
            labelRenderer = new CSS2DRenderer();
            labelRenderer.setSize( window.innerWidth, window.innerHeight );
            labelRenderer.domElement.style.position = 'absolute';
            labelRenderer.domElement.style.top = '0px';
            document.body.appendChild( labelRenderer.domElement );
        
          
            //
        
            app.signal.onContainerSizeChange.add(() => {
                labelRenderer.setSize( app.containerSize.width, app.containerSize.height );
            })
        
            initGui();
        
            app.signal.onAppUpdate.add(animate)
            app.signal.onAppAfterRender.add(() => {
                labelRenderer.render( scene, camera );
            })
        }
        
        
        
        function animate(e) {
        
            const elapsed = e.elapsedTime;
        
            moon.position.set( Math.sin( elapsed ) * 5, 0, Math.cos( elapsed ) * 5 );
        
        }
        
        //
        
        function initGui() {
        
            gui = new GUI();
        
            gui.title( 'Camera Layers' );
        
            gui.add( layers, 'Toggle Name' );
            gui.add( layers, 'Toggle Mass' );
            gui.add( layers, 'Enable All' );
            gui.add( layers, 'Disable All' );
        
            gui.open();
        
        }
        
        
        
        
    }
    catch (e) {
        console.error(e);
    }
};