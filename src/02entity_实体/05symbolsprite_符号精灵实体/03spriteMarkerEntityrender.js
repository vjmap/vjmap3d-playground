
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/entity/symbolsprite/03spriteMarkerEntityrender
        // --渲染材质绘制创建精灵标记实体--
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                gridHelper: { visible: true } // 是否显示坐标网格
            },
            camera: {  // 相机设置
                viewHelper: { enable: true, position: "leftBottom" } // 是否显示视角指示器
            }
        })
        let image = await vjmap3d.loadImage(env.assetsPath + "image/imgbg.png")
        // 通过渲染材质绘制
        let spriteMarker = new vjmap3d.SpriteMarkerEntity(
        {
            position: [-2, 0, 1], // 位置 
            sizeAttenuation: false, // 固定像素大小，不随相机变化
            anchorX: "center",  // x对齐方式
            anchorY: "bottom", // y对齐方式
            renderTexture: {
                autoCanvasSize: false,
                canvasWidth: 80, // 像素宽，这里是根据底图的像素宽高定的
                canvasHeight: 80, // 像素高，这里是根据底图的像素宽高定的
                sharedCanvas: false,
                elements: [
                    new vjmap3d.render2d.Image({
                        style: {
                            x: 0,
                            y: 0,
                            image: image,
                            width: 80, // 像素宽，这里是图片像素宽高定的
                            height: 80 // 像素高，这里是图片像素宽高定的
                        }
                    }),
                    new vjmap3d.render2d.Text({
                        style: {
                            x: 40,
                            y: 20,
                            text: '唯杰',
                            fill: "#0ff",
                            font: '30px Arial',
                            verticalAlign: "top",
                            align: "center",
                            //backgroundColor: vjmap3d.render2d.color.random(),
                            //borderColor: vjmap3d.render2d.color.random(),
                            //borderWidth: 2,
                            //borderRadius: 5,
                            // textShadowBlur: 2,
                            // textShadowColor: '#893e95',
                            // textShadowOffsetX: 2,
                            // textShadowOffsetY: 4,
                        }
                    })
                ]
            }
        });
        spriteMarker.addTo(app)
        // 再创建一个随相机尺寸大小变化的精灵标记实体
        let spriteMarker2 = new vjmap3d.SpriteMarkerEntity(
            {
                position: [2, 0, 1], // 位置 
                sizeAttenuation: true, // 固定像素大小，不随相机变化
                width: 1, // 世界坐标宽度
                anchorX: "center",  // x对齐方式
                anchorY: "bottom", // y对齐方式
                renderTexture: {
                    autoCanvasSize: false,
                    canvasWidth: 80, // 像素宽，这里是根据底图的像素宽高定的
                    canvasHeight: 80, // 像素高，这里是根据底图的像素宽高定的
                    sharedCanvas: false,
                    elements: [
                        new vjmap3d.render2d.Image({
                            style: {
                                x: 0,
                                y: 0,
                                image: image,
                                width: 80, // 像素宽，这里是图片像素宽高定的
                                height: 80 // 像素高，这里是图片像素宽高定的
                            }
                        }),
                        new vjmap3d.render2d.Text({
                            style: {
                                x: 40,
                                y: 20,
                                text: '唯杰',
                                fill: "#0ff",
                                font: '30px Arial',
                                verticalAlign: "top",
                                align: "center"
                            }
                        })
                    ]
                }
            });
            spriteMarker2.addTo(app)
    }
    catch (e) {
        console.error(e);
    }
};