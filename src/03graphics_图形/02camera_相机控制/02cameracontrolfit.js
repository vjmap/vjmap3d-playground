
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/graphics/camera/02cameracontrolfit
        // --相机适应包围盒大小--
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                showAxesHelper: true, // 绘制坐标轴辅助对象
                gridHelper: { visible: false } // 是否显示坐标网格
            },
            camera: {  // 相机设置
                viewHelper: { enable: true, position: "leftBottom" }, // 是否显示视角指示器
                position: new THREE.Vector3(0, 0, 5)
            }
        })
        // 绘制像素刻度
        const drawRuler = () => {
            // 创建一个屏幕位置空间的实体对象
            let sse = vjmap3d.createScreenSpaceEntity(app);
            let width = Math.ceil(app.containerSize.width / 50) * 50
            for(let n = 50; n < width; n += 50) {
                let lineLabel = vjmap3d.createLabel({
                    lineHeight: sse.pixelHeightToLength(10),
                    color: "#00ffff",
                    anchorPoint: [0.5, 0],
                    transparent: true,
                    text: "1"
                });
                sse.addObject(lineLabel, [n, 10])
                
                let textLabel = vjmap3d.createLabel({
                    lineHeight: sse.pixelHeightToLength(20),
                    color: "#00ffff",
                    anchorPoint: [0.5, 0],
                    transparent: true,
                    text: n + ''
                });
                sse.addObject(textLabel, [n, 30])
            }
        
        
            let height = Math.ceil(app.containerSize.height / 50) * 50
            for(let n = 50; n < height; n += 50) {
                let lineLabel = vjmap3d.createLabel({
                    lineHeight: sse.pixelHeightToLength(10),
                    color: "#00ffff",
                    anchorPoint: [1, 0.5],
                    transparent: true,
                    text: "-"
                });
                sse.addObject(lineLabel, [10, n])
                
                let textLabel = vjmap3d.createLabel({
                    lineHeight: sse.pixelHeightToLength(20),
                    color: "#00ffff",
                    anchorPoint: [0.5, 0.5],
                    transparent: true,
                    text: n + ''
                });
                sse.addObject(textLabel, [30, n])
            }
            return sse;
        }
        
        let sse = drawRuler();
        // 大小变化时重新生成刻度
        app.signal.onContainerSizeChange.add(() => {
            sse.dispose();
            sse = drawRuler();
        })
        
        
        const mesh = new THREE.Mesh(
        	new THREE.BoxGeometry( 2, 2, 1 ),
        	new THREE.MeshBasicMaterial( { color: 0x00ffff, wireframe: true } )
        );
        app.scene.add( mesh );
        
        const gridHelper = new THREE.GridHelper( 50, 50 );
        gridHelper.rotation.x = - Math.PI / 2;
        gridHelper.position.z = 0.5;
        app.scene.add( gridHelper );
        
        const DEG90 = Math.PI * 0.5;
        const DEG180 = Math.PI;
        
        let cameraControls = app.cameraControl;
        const paddingInCssPixel = ( top, right, bottom, left ) => {
        
        	const fov = app.camera.fov * THREE.MathUtils.DEG2RAD;
        	const rendererHeight = app.renderer.getSize( new THREE.Vector2() ).height;
        
        	const boundingBox = new THREE.Box3().setFromObject( mesh );
        	const size = boundingBox.getSize( new THREE.Vector3() );
        	const boundingWidth  = size.x;
        	const boundingHeight = size.y;
        	const boundingDepth  = size.z;
        
        	var distanceToFit = cameraControls.getDistanceToFitBox( boundingWidth, boundingHeight, boundingDepth );
        	var paddingTop = 0;
        	var paddingBottom = 0;
        	var paddingLeft = 0;
        	var paddingRight = 0;
        
        	// 循环寻找最近的点
        	for ( var i = 0; i < 10; i ++ ) {
        
        		const depthAt = distanceToFit - boundingDepth * 0.5;
        		const cssPixelToUnit = ( 2 * Math.tan( fov * 0.5 ) * Math.abs( depthAt ) ) / rendererHeight;
        		paddingTop = top * cssPixelToUnit;
        		paddingBottom = bottom * cssPixelToUnit;
        		paddingLeft = left * cssPixelToUnit;
        		paddingRight = right * cssPixelToUnit;
        
        		distanceToFit = cameraControls.getDistanceToFitBox(
        			boundingWidth + paddingLeft + paddingRight,
        			boundingHeight + paddingTop + paddingBottom,
        			boundingDepth
        		);
        
        	}
        
        	cameraControls.fitToBox( mesh, true, { paddingLeft: paddingLeft, paddingRight: paddingRight, paddingBottom: paddingBottom, paddingTop: paddingTop } );
        }
        
        const rotateTo = ( side ) => {
        
        	switch ( side ) {
        
        		case 'front':
        			cameraControls.rotateTo( 0, DEG90, true );
                    gridHelper.position.set(0, 0, 0.5);
                    gridHelper.rotation.set(- DEG90,  0, 0)
        			break;
        
        		case 'back':
        			cameraControls.rotateTo( DEG180, DEG90, true );
                    gridHelper.position.set(0, 0, -0.5);
                    gridHelper.rotation.set(- DEG90,  0, 0)
        			break;
        
        		case 'up':
        			cameraControls.rotateTo( 0, 0, true );
                    gridHelper.position.set(0, 1, 0);
                    gridHelper.rotation.set(0,  0, 0)
        			break;
        
        		case 'down':
        			cameraControls.rotateTo( 0, DEG180, true );
                    gridHelper.position.set(0,-1, 0);
                    gridHelper.rotation.set(0,  0, 0)
        			break;
        
        		case 'right':
        			cameraControls.rotateTo( DEG90, DEG90, true );
                    gridHelper.position.set(1,0, 0);
                    gridHelper.rotation.set(- DEG90,  0,  DEG90)
        			break;
        
        		case 'left':
        			cameraControls.rotateTo( - DEG90, DEG90, true );
                    gridHelper.position.set(- 1,0, 0);
                    gridHelper.rotation.set(- DEG90,  0,  DEG90)
        			break;
        
        	}
        
        }
        const ui = await app.getConfigPane({ title: "相机操作", style: { width: "300px"}});
        let gui = new vjmap3d.UiPanelJsonConfig();
        gui.addButton('reset' , () => {
            rotateTo( 'front' )
            cameraControls.reset( true )
        });
        gui.addButton('fit front side of the mesh' , () => {
            rotateTo( 'front' )
            cameraControls.fitToBox( mesh, true )
        });
        gui.addButton('fill (cover) front side of the mesh' , () => {
            rotateTo( 'front' )
            cameraControls.fitToBox( mesh, true, { cover: true } )
        });
        gui.addButton('fit back side with padding(top: 2unit, bottom: 1unit )' , () => {
            rotateTo( 'back' )
            cameraControls.fitToBox( mesh, true, { paddingLeft: 0, paddingRight: 0, paddingBottom: 1, paddingTop: 2 } )
        });
        gui.addButton('fit up side with padding(top: 2unit, bottom: 0.5unit )' , () => {
            rotateTo( 'up' )
            cameraControls.fitToBox( mesh, true, { paddingLeft: 0, paddingRight: 0, paddingBottom: 0.5, paddingTop: 2 } )
        });
        gui.addButton('fit down side with padding(top: 4unit, bottom: 4unit, left: 4unit, right: 4unit )' , () => {
            rotateTo( 'down' )
            cameraControls.fitToBox( mesh, true, { paddingLeft: 4, paddingRight: 4, paddingBottom: 4, paddingTop: 4 } )
        });
        gui.addButton('fit right side with padding(left: 1unit, right: 0unit )' , () => {
            rotateTo( 'right' )
            cameraControls.fitToBox( mesh, true, { paddingLeft: 1, paddingRight: 0 } )
        });
        gui.addButton('fit left side with padding in pixel( top:100px,right:100px bottom: 200px,right:100px)' , () => {
            rotateTo( 'left' )
            paddingInCssPixel( 100, 100, 200, 100 )
        });
        gui.toJson().forEach(c => ui.appendChild(c));
        
    }
    catch (e) {
        console.error(e);
    }
};