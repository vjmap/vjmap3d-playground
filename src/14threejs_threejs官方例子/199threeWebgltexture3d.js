
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/199threeWebgltexture3d
        // --texture3d--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_texture3d
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        const h = 512; // frustum height
        const aspect = window.innerWidth / window.innerHeight;
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                isOrthographicCamera: true,
                left: - h * aspect / 2,
                right: h * aspect / 2,//h * aspect / 2 , h / 2, - h / 2, 1, 1000 
                top: h / 2,
                bottom: - h / 2,
                near: 1,
                far: 1000,
                position: [- 64, - 64, 128]
            },
            control: {
                target: [ 64, 64, 128],
                minZoom: 0.5,
                maxZoom: 4,
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        let material,
            volconfig,
            cmtextures;
        
        init();
        
        function init() {
        
            camera.up.set( 0, 0, 1 ); // In our data, z is up
        
        
            // The gui for interaction
            volconfig = { clim1: 0, clim2: 1, renderstyle: 'iso', isothreshold: 0.15, colormap: 'viridis' };
            const gui = new GUI();
            gui.add( volconfig, 'clim1', 0, 1, 0.01 ).onChange( updateUniforms );
            gui.add( volconfig, 'clim2', 0, 1, 0.01 ).onChange( updateUniforms );
            gui.add( volconfig, 'colormap', { gray: 'gray', viridis: 'viridis' } ).onChange( updateUniforms );
            gui.add( volconfig, 'renderstyle', { mip: 'mip', iso: 'iso' } ).onChange( updateUniforms );
            gui.add( volconfig, 'isothreshold', 0, 1, 0.01 ).onChange( updateUniforms );
        
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
            // Load the data ...
            new NRRDLoader().load(assetsPath + 'models/nrrd/stent.nrrd', function ( volume ) {
        
                // Texture to hold the volume. We have scalars, so we put our data in the red channel.
                // THREEJS will select R32F (33326) based on the THREE.RedFormat and THREE.FloatType.
                // Also see https://www.khronos.org/registry/webgl/specs/latest/2.0/#TEXTURE_TYPES_FORMATS_FROM_DOM_ELEMENTS_TABLE
                // TODO: look the dtype up in the volume metadata
                const texture = new THREE.Data3DTexture( volume.data, volume.xLength, volume.yLength, volume.zLength );
                texture.format = THREE.RedFormat;
                texture.type = THREE.FloatType;
                texture.minFilter = texture.magFilter = THREE.LinearFilter;
                texture.unpackAlignment = 1;
                texture.needsUpdate = true;
        
                // Colormap textures
                cmtextures = {
                    viridis: new THREE.TextureLoader().load(assetsPath + 'textures/cm_viridis.png' ),
                    gray: new THREE.TextureLoader().load(assetsPath +  'textures/cm_gray.png' )
                };
        
                // Material
                const shader = VolumeRenderShader1;
        
                const uniforms = THREE.UniformsUtils.clone( shader.uniforms );
        
                uniforms[ 'u_data' ].value = texture;
                uniforms[ 'u_size' ].value.set( volume.xLength, volume.yLength, volume.zLength );
                uniforms[ 'u_clim' ].value.set( volconfig.clim1, volconfig.clim2 );
                uniforms[ 'u_renderstyle' ].value = volconfig.renderstyle == 'mip' ? 0 : 1; // 0: MIP, 1: ISO
                uniforms[ 'u_renderthreshold' ].value = volconfig.isothreshold; // For ISO renderstyle
                uniforms[ 'u_cmdata' ].value = cmtextures[ volconfig.colormap ];
        
                material = new THREE.ShaderMaterial( {
                    uniforms: uniforms,
                    vertexShader: shader.vertexShader,
                    fragmentShader: shader.fragmentShader,
                    side: THREE.BackSide // The volume shader uses the backface as its "reference point"
                } );
        
                // THREE.Mesh
                const geometry = new THREE.BoxGeometry( volume.xLength, volume.yLength, volume.zLength );
                geometry.translate( volume.xLength / 2 - 0.5, volume.yLength / 2 - 0.5, volume.zLength / 2 - 0.5 );
        
                const mesh = new THREE.Mesh( geometry, material );
                scene.add( mesh );
        
            } );
        
           app.signal.onAppUpdate.add(updateUniforms)
           app.signal.onContainerSizeChange.add(onWindowResize)
        }
        
        function updateUniforms() {
            if (!material) return
            material.uniforms[ 'u_clim' ].value.set( volconfig.clim1, volconfig.clim2 );
            material.uniforms[ 'u_renderstyle' ].value = volconfig.renderstyle == 'mip' ? 0 : 1; // 0: MIP, 1: ISO
            material.uniforms[ 'u_renderthreshold' ].value = volconfig.isothreshold; // For ISO renderstyle
            material.uniforms[ 'u_cmdata' ].value = cmtextures[ volconfig.colormap ];
        
        }
        
        function onWindowResize() {
           
        
            const aspect = app.containerSize.width / app.containerSize.height;
        
            const frustumHeight = camera.top - camera.bottom;
        
            camera.left = - frustumHeight * aspect / 2;
            camera.right = frustumHeight * aspect / 2;
        
            camera.updateProjectionMatrix();
        
        
        }
        
        
    }
    catch (e) {
        console.error(e);
    }
};