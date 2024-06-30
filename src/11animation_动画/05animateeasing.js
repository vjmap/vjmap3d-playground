
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/animation/05animateeasing
        // --动画缓动函数--
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                gridHelper: { visible: true } // 是否显示坐标网格
            },
            camera: {  // 相机设置
                viewHelper: { enable: true, position: "leftBottom" } // 是否显示视角指示器
            },
            control: { leftButtonPan: true } // 设置为左键用于旋转 (同时右键将用于平移) 和地图2d使用习惯一样
        })
        let image = await vjmap3d.loadImage(env.assetsPath + "image/imgbg2.png");
        let easingCurve = vjmap3d.render2d.Path.extend({
            type: "easingCurve",
            shape: {
                x: 0,
                y: 0,
                width: 0,
                height: 0
            },
            buildPath(ctx, shape) {
                let x = shape.x;
                let y = shape.y;
                let height = shape.height;
                let width = shape.width;
                ctx.moveTo(x, y + height);
                ctx.lineTo(x + width, y + height);
                ctx.moveTo(x, y);
                ctx.lineTo(x, y + height);
                ctx.moveTo(x, y);
                for(let n = 0; n < height; n++) {
                    let py = y + height - vjmap3d.Easings[this.easing](n / height) * height
                    let px = x + n;
                    ctx.lineTo(px, py);
                }
            }
        });
        const createEasingCurve = (method, position) => {
            let curve = new easingCurve({
                shape: {
                    x: 60,
                    y: 60,
                    width: 140,
                    height: 100
                },
                style: {
                    stroke: "#0ff"
                }
            })
            curve.easing = method;
            let spriteMarker = new vjmap3d.SpriteMarkerEntity(
            {
                position: position, // 位置 
                sizeAttenuation: false, // 固定像素大小，不随相机变化
                anchorX: "center",  // x对齐方式
                anchorY: "bottom", // y对齐方式
                allowOverlap: true,
                renderTexture: {
                    autoCanvasSize: false,
                    canvasWidth: 270, // 像素宽，这里是根据底图的像素宽高定的
                    canvasHeight: 250, // 像素高，这里是根据底图的像素宽高定的
                    sharedCanvas: false,
                    elements: [
                        new vjmap3d.render2d.Image({
                            style: {
                                x: 0,
                                y: 0,
                                image: image,
                                width: 270, // 像素宽，这里是图片像素宽高定的
                                height: 250 // 像素高，这里是图片像素宽高定的
                            }
                        }),
                        new vjmap3d.render2d.Text({
                            style: {
                                x: 138,
                                y: 20,
                                text: method,
                                fill: "#0ff",
                                font: '30px Arial',
                                verticalAlign: "top",
                                align: "center",
                            }
                        }),
                        curve
                    ]
                }
            });
            spriteMarker.addTo(app)
        }
        const easingsMethods = Object.getOwnPropertyNames(vjmap3d.Easings)
        .filter(prop => typeof vjmap3d.Easings[prop] === 'function');
        // 绘制
        for(let i = 0; i < easingsMethods.length; i++) {
            let len = 30;
            let pos = [i * len/ easingsMethods.length - len / 2, 0, 0]
            createEasingCurve(easingsMethods[i], pos);
        }
        app.cameraControl.loadState({
            cameraTarget: new THREE.Vector3(-14.64345295429849,-1.108395354581628e-17, -1.4500183140945189),
        	cameraPosition: new THREE.Vector3(-14.643168396143746,0.6458405918854697, 1.0255224852778935)
        })
        
        
    }
    catch (e) {
        console.error(e);
    }
};