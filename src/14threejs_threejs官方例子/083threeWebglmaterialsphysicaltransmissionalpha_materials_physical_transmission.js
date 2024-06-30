
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/083threeWebglmaterialsphysicaltransmissionalpha
        // --materials_physical_transmission_alpha--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_materials_physical_transmission_alpha
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            render: {
                alpha: true,
                clearColorAlpha: 0,
            },
            scene: {
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 40,
                near: 1,
                far: 2000,
                position: [- 5, 0.5, 0]
            },
            control: {
                minDistance: 5,
                maxDistance: 20,
                target: [0, 0.5, 0]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        const params = {
            color: 0xffffff,
            transmission: 1,
            opacity: 1,
            metalness: 0,
            roughness: 0,
            ior: 1.5,
            thickness: 0.01,
            attenuationColor: 0xffffff,
            attenuationDistance: 1,
            specularIntensity: 1,
            specularColor: 0xffffff,
            envMapIntensity: 1,
            lightIntensity: 1,
            exposure: 1
        };
        
        
        let assetsPath = "https://vjmap.com/map3d/resources/three/"
        let mesh, material;
        
        const hdrEquirect = vjmap3d.LoadManager.hdrLoader
            .setPath(assetsPath + 'textures/equirectangular/' )
            .load( 'royal_esplanade_1k.hdr', function () {
        
                hdrEquirect.mapping = THREE.EquirectangularReflectionMapping;
        
                vjmap3d.LoadManager.gltfLoader
                    .setPath(assetsPath + 'models/gltf/' )
                    .load( 'DragonAttenuation.glb', function ( gltf ) {
        
                        gltf.scene.traverse( function ( child ) {
        
                            if ( child.isMesh && child.material.isMeshPhysicalMaterial ) {
        
                                mesh = child;
                                material = mesh.material;
        
                                const color = new THREE.Color();
        
                                params.color = color.copy( mesh.material.color ).getHex();
                                params.roughness = mesh.material.roughness;
                                params.metalness = mesh.material.metalness;
        
                                params.ior = mesh.material.ior;
                                params.specularIntensity = mesh.material.specularIntensity;
        
                                params.transmission = mesh.material.transmission;
                                params.thickness = mesh.material.thickness;
                                params.attenuationColor = color.copy( mesh.material.attenuationColor ).getHex();
                                params.attenuationDistance = mesh.material.attenuationDistance;
        
                            }
        
                        } );
        
                        init();
        
                        scene.add( gltf.scene );
        
                        scene.environment = hdrEquirect;
                        //scene.background = hdrEquirect;
        
                        
        
                    } );
        
            } );
        
        function init() {
           
            renderer.shadowMap.enabled = true;
        
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.toneMappingExposure = params.exposure;
        
            // accommodate CSS table
            renderer.domElement.style.position = 'absolute';
            renderer.domElement.style.top = 0;
        
         
            //
        
            const gui = new GUI();
        
            gui.addColor( params, 'color' )
                .onChange( function () {
        
                    material.color.set( params.color );
                    
        
                } );
        
            gui.add( params, 'transmission', 0, 1, 0.01 )
                .onChange( function () {
        
                    material.transmission = params.transmission;
                    
        
                } );
        
            gui.add( params, 'opacity', 0, 1, 0.01 )
                .onChange( function () {
        
                    material.opacity = params.opacity;
                    const transparent = params.opacity < 1;
        
                    if ( transparent !== material.transparent ) {
        
                        material.transparent = transparent;
                        material.needsUpdate = true;
        
                    }
        
                    
        
                } );
        
            gui.add( params, 'metalness', 0, 1, 0.01 )
                .onChange( function () {
        
                    material.metalness = params.metalness;
                    
        
                } );
        
            gui.add( params, 'roughness', 0, 1, 0.01 )
                .onChange( function () {
        
                    material.roughness = params.roughness;
                    
        
                } );
        
            gui.add( params, 'ior', 1, 2, 0.01 )
                .onChange( function () {
        
                    material.ior = params.ior;
                    
        
                } );
        
            gui.add( params, 'thickness', 0, 5, 0.01 )
                .onChange( function () {
        
                    material.thickness = params.thickness;
                    
        
                } );
        
            gui.addColor( params, 'attenuationColor' )
                .name( 'attenuation color' )
                .onChange( function () {
        
                    material.attenuationColor.set( params.attenuationColor );
                    
        
                } );
        
            gui.add( params, 'attenuationDistance', 0, 1, 0.01 )
                .onChange( function () {
        
                    material.attenuationDistance = params.attenuationDistance;
                    
        
                } );
        
            gui.add( params, 'specularIntensity', 0, 1, 0.01 )
                .onChange( function () {
        
                    material.specularIntensity = params.specularIntensity;
                    
        
                } );
        
            gui.addColor( params, 'specularColor' )
                .onChange( function () {
        
                    material.specularColor.set( params.specularColor );
                    
        
                } );
        
            gui.add( params, 'envMapIntensity', 0, 1, 0.01 )
                .name( 'envMap intensity' )
                .onChange( function () {
        
                    material.envMapIntensity = params.envMapIntensity;
                    
        
                } );
        
            gui.add( params, 'exposure', 0, 1, 0.01 )
                .onChange( function () {
        
                    renderer.toneMappingExposure = params.exposure;
                    
        
                } );
        
            gui.open();
        
        }
        
        let div= vjmap3d.DOM.createStyledDiv(`<table id="table">
        <tbody>
            <tr>
            <td id="block-ff0000">ff0000</td>
            <td id="block-00ff00">00ff00</td>
            <td id="block-0000ff">0000ff</td>
            <td id="block-000000">000000</td>
            </tr>
        </tbody>
        </table>`, `#table {
            margin-top: 100px;
            border-collapse: collapse;
            width: 100%;
        }
        #table td {
            margin: 0;
            padding: 0;
            font-size: 16px;
            text-align: center;
            vertical-align: center;
        }
        #table tr {
            height: 250px;
        }
        
        #block-ff0000 { background-color: #ff0000; color: white; }
        #block-00ff00 { background-color: #00ff00; color: black; }
        #block-0000ff { background-color: #0000ff; color: white; }
        #block-000000 { background-color: #000000; color: black; }
        `)
        
        app.container.parentNode?.appendChild(div)
        app.container.style.background = '#0000'
        
        
        
        
    }
    catch (e) {
        console.error(e);
    }
};