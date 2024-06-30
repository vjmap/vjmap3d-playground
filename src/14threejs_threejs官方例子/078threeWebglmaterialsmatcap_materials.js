
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/078threeWebglmaterialsmatcap
        // --materials_matcap--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_materials_matcap
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
                far: 100,
                position: [  0, 0, 13 ]
            },
            postProcess: {
                enable: false
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        let mesh;
        
        const API = {
            color: 0xffffff, // sRGB
            exposure: 1.0
        };
        
        init();
        
        function init() {
        
            // tone mapping
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.toneMappingExposure = API.exposure;
        
            // manager
            const manager = new THREE.LoadingManager(  );
        
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
            // matcap
            const loaderEXR = new EXRLoader( manager );
            const matcap = loaderEXR.load(assetsPath + 'textures/matcaps/040full.exr' );
        
            // normalmap
            const loader = new THREE.TextureLoader( manager );
        
            const normalmap = loader.load(assetsPath + 'models/gltf/LeePerrySmith/Infinite-Level_02_Tangent_SmoothUV.jpg' );
        
            // model
            vjmap3d.ResManager.loadRes(assetsPath + 'models/gltf/LeePerrySmith/LeePerrySmith.glb', false).then(( gltf ) => {
        
                mesh = gltf.scene.children[ 0 ];
                mesh.position.y = - 0.25;
        
                mesh.material = new THREE.MeshMatcapMaterial( {
        
                    color: new THREE.Color().setHex( API.color ).convertSRGBToLinear(),
                    matcap: matcap,
                    normalMap: normalmap
        
                } );
        
                scene.add( mesh );
        
            } );
        
            // gui
            const gui = new GUI();
        
            gui.addColor( API, 'color' )
                .listen()
                .onChange( function () {
        
                    mesh.material.color.set( API.color ).convertSRGBToLinear();
        
                } );
        
            gui.add( API, 'exposure', 0, 2 )
                .onChange( function () {
        
                    renderer.toneMappingExposure = API.exposure;
        
                } );
        
            gui.domElement.style.webkitUserSelect = 'none';
        
            // drag 'n drop
            initDragAndDrop();
        
        }
        
        
        //
        // drag and drop anywhere in document
        //
        
        function updateMatcap( texture ) {
        
            if ( mesh.material.matcap ) {
        
                mesh.material.matcap.dispose();
        
            }
        
            mesh.material.matcap = texture;
        
            texture.needsUpdate = true;
        
            mesh.material.needsUpdate = true; // because the color space can change
        
        
        }
        
        function handleJPG( event ) { // PNG, WebP, AVIF, too
        
            function imgCallback( event ) {
        
                const texture = new THREE.Texture( event.target );
        
                texture.colorSpace = THREE.SRGBColorSpace;
        
                updateMatcap( texture );
        
            }
        
            const img = new Image();
        
            img.onload = imgCallback;
        
            img.src = event.target.result;
        
        }
        
        function handleEXR( event ) {
        
            const contents = event.target.result;
        
            const loader = new EXRLoader();
        
            loader.setDataType( THREE.HalfFloatType );
        
            const texData = loader.parse( contents );
        
            const texture = new THREE.DataTexture();
        
            texture.image.width = texData.width;
            texture.image.height = texData.height;
            texture.image.data = texData.data;
        
            texture.format = texData.format;
            texture.type = texData.type;
            texture.colorSpace = THREE.LinearSRGBColorSpace;
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.generateMipmaps = false;
            texture.flipY = false;
        
            updateMatcap( texture );
        
        }
        
        function loadFile( file ) {
        
            const filename = file.name;
            const extension = filename.split( '.' ).pop().toLowerCase();
        
            if ( extension === 'exr' ) {
        
                const reader = new FileReader();
        
                reader.addEventListener( 'load', function ( event ) {
        
                    handleEXR( event );
        
                } );
        
                reader.readAsArrayBuffer( file );
        
            } else { // 'jpg', 'png'
        
                const reader = new FileReader();
        
                reader.addEventListener( 'load', function ( event ) {
        
                    handleJPG( event );
        
                } );
        
                reader.readAsDataURL( file );
        
            }
        
        }
        
        function initDragAndDrop() {
        
            document.addEventListener( 'dragover', function ( event ) {
        
                event.preventDefault();
                event.dataTransfer.dropEffect = 'copy';
        
            } );
        
            document.addEventListener( 'drop', function ( event ) {
        
                event.preventDefault();
        
                loadFile( event.dataTransfer.files[ 0 ] );
        
            } );
        
        }
    }
    catch (e) {
        console.error(e);
    }
};