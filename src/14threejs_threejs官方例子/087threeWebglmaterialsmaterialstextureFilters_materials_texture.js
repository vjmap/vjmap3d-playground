
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/087threeWebglmaterialsmaterialstextureFilters
        // --materials_texture_filters--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_materials_texture_filters
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            render: {
                renderUpdate: false
            },
            scene: {
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 35,
                near: 1,
                far: 5000,
                position: [ 0, 0, 1500]
            },
            postProcess: {
                enable: false
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        const SCREEN_WIDTH = app.containerSize.width;
        const SCREEN_HEIGHT = app.containerSize.height;
        
        
        let scene2;
        
        let mouseX = 0, mouseY = 0;
        
        const windowHalfX = SCREEN_WIDTH / 2;
        const windowHalfY = SCREEN_HEIGHT / 2;
        
        document.body.appendChild(vjmap3d.DOM.createStyledDiv(
            `<div id="lbl_left" class="lbl">
            Floor <span class="g">(128x128)</span><br/>
            mag: <span class="c">Linear</span><br/>
            min: <span class="c">LinearMipmapLinear</span><br/>
            <br/>
            Painting <span class="g">(748x600)</span><br/>
            mag: <span class="c">Linear</span><br/>
            min: <span class="c">Linear</span>
            </div>
        
            <div id="lbl_right" class="lbl">
            Floor <br/>
            mag: <span class="c">Nearest</span><br/>
            min: <span class="c">Nearest</span><br/>
            <br/>
            Painting <br/>
            mag: <span class="c">Nearest</span><br/>
            min: <span class="c">Nearest</span>
            </div>`, 
            `.lbl { color:#fff; font-size:16px; font-weight:bold; position: absolute; bottom:0px; z-index:100; text-shadow:#000 1px 1px 1px; background-color:rgba(0,0,0,0.85); padding:1em }
            #lbl_left { text-align:left; left:0px }
            #lbl_right { text-align:left; right:0px }
        
            .g { color:#aaa }
            .c { color:#fa0 }`))
        init();
        
        function init() {
            scene.background = new THREE.Color( 0x000000 );
            scene.fog = new THREE.Fog( 0x000000, 1500, 4000 );
        
            scene2 = new THREE.Scene();
            scene2.background = new THREE.Color( 0x000000 );
            scene2.fog = new THREE.Fog( 0x000000, 1500, 4000 );
        
            // GROUND
        
            const imageCanvas = document.createElement( 'canvas' );
            const context = imageCanvas.getContext( '2d' );
        
            imageCanvas.width = imageCanvas.height = 128;
        
            context.fillStyle = '#444';
            context.fillRect( 0, 0, 128, 128 );
        
            context.fillStyle = '#fff';
            context.fillRect( 0, 0, 64, 64 );
            context.fillRect( 64, 64, 64, 64 );
        
            const textureCanvas = new THREE.CanvasTexture( imageCanvas );
            textureCanvas.colorSpace = THREE.SRGBColorSpace;
            textureCanvas.repeat.set( 1000, 1000 );
            textureCanvas.wrapS = THREE.RepeatWrapping;
            textureCanvas.wrapT = THREE.RepeatWrapping;
        
            const textureCanvas2 = textureCanvas.clone();
            textureCanvas2.magFilter = THREE.NearestFilter;
            textureCanvas2.minFilter = THREE.NearestFilter;
        
            const materialCanvas = new THREE.MeshBasicMaterial( { map: textureCanvas } );
            const materialCanvas2 = new THREE.MeshBasicMaterial( { color: 0xffccaa, map: textureCanvas2 } );
        
            const geometry = new THREE.PlaneGeometry( 100, 100 );
        
            const meshCanvas = new THREE.Mesh( geometry, materialCanvas );
            meshCanvas.rotation.x = - Math.PI / 2;
            meshCanvas.scale.set( 1000, 1000, 1000 );
        
            const meshCanvas2 = new THREE.Mesh( geometry, materialCanvas2 );
            meshCanvas2.rotation.x = - Math.PI / 2;
            meshCanvas2.scale.set( 1000, 1000, 1000 );
        
        
            // PAINTING
        
            const callbackPainting = function () {
        
                const image = texturePainting.image;
        
                texturePainting2.image = image;
                texturePainting2.needsUpdate = true;
        
                scene.add( meshCanvas );
                scene2.add( meshCanvas2 );
        
                const geometry = new THREE.PlaneGeometry( 100, 100 );
                const mesh = new THREE.Mesh( geometry, materialPainting );
                const mesh2 = new THREE.Mesh( geometry, materialPainting2 );
        
                addPainting( scene, mesh );
                addPainting( scene2, mesh2 );
        
                function addPainting( zscene, zmesh ) {
        
                    zmesh.scale.x = image.width / 100;
                    zmesh.scale.y = image.height / 100;
        
                    zscene.add( zmesh );
        
                    const meshFrame = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { color: 0x000000 } ) );
                    meshFrame.position.z = - 10.0;
                    meshFrame.scale.x = 1.1 * image.width / 100;
                    meshFrame.scale.y = 1.1 * image.height / 100;
                    zscene.add( meshFrame );
        
                    const meshShadow = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { color: 0x000000, opacity: 0.75, transparent: true } ) );
                    meshShadow.position.y = - 1.1 * image.height / 2;
                    meshShadow.position.z = - 1.1 * image.height / 2;
                    meshShadow.rotation.x = - Math.PI / 2;
                    meshShadow.scale.x = 1.1 * image.width / 100;
                    meshShadow.scale.y = 1.1 * image.height / 100;
                    zscene.add( meshShadow );
        
                    const floorHeight = - 1.117 * image.height / 2;
                    meshCanvas.position.y = meshCanvas2.position.y = floorHeight;
        
                }
        
        
            };
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
        
            const texturePainting = new THREE.TextureLoader().load( assetsPath  + 'textures/758px-Canestra_di_frutta_(Caravaggio).jpg', callbackPainting );
            const texturePainting2 = new THREE.Texture();
        
            const materialPainting = new THREE.MeshBasicMaterial( { color: 0xffffff, map: texturePainting } );
            const materialPainting2 = new THREE.MeshBasicMaterial( { color: 0xffccaa, map: texturePainting2 } );
        
            texturePainting.colorSpace = THREE.SRGBColorSpace;
            texturePainting2.colorSpace = THREE.SRGBColorSpace;
            texturePainting2.minFilter = texturePainting2.magFilter = THREE.NearestFilter;
            texturePainting.minFilter = texturePainting.magFilter = THREE.LinearFilter;
            texturePainting.mapping = THREE.UVMapping;
        
            renderer.autoClear = false;
        
            renderer.domElement.style.position = 'relative';
        
            document.addEventListener( 'mousemove', onDocumentMouseMove );
        
            app.signal.onAppRender.add(animate)
        }
        
        
        function onDocumentMouseMove( event ) {
        
            mouseX = ( event.clientX - windowHalfX );
            mouseY = ( event.clientY - windowHalfY );
        
        }
        
        
        function animate() {
        
            camera.position.x += ( mouseX - camera.position.x ) * .05;
            camera.position.y += ( - ( mouseY - 200 ) - camera.position.y ) * .05;
        
            camera.lookAt( scene.position );
        
            renderer.clear();
            renderer.setScissorTest( true );
        
            renderer.setScissor( 0, 0, SCREEN_WIDTH / 2 - 2, SCREEN_HEIGHT );
            renderer.render( scene, camera );
        
            renderer.setScissor( SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2 - 2, SCREEN_HEIGHT );
            renderer.render( scene2, camera );
        
            renderer.setScissorTest( false );
        
        }
        
        
        
        
        
    }
    catch (e) {
        console.error(e);
    }
};