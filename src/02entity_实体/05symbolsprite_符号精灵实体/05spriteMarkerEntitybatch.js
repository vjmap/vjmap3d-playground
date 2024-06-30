
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/entity/symbolsprite/05spriteMarkerEntitybatch
        // --批量创建精灵标记实体--
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
        let imgEle = new vjmap3d.render2d.Image({
            style: {
                x: 0,
                y: 0,
                image: image,
                width: 80, // 像素宽，这里是图片像素宽高定的
                height: 80 // 像素高，这里是图片像素宽高定的
            }
        })
        for(let i = 0; i < 20; i++) {
            for(let j = 0; j < 20; j++) {
                let positon = [i * 5 - 50, 0, j * 5 - 50];
                let idx = `${j * 20 + i}`
                let spriteMarker = new vjmap3d.SpriteMarkerEntity(
                {
                    position: positon, // 位置 
                    sizeAttenuation: false, // 固定像素大小，不随相机变化
                    allowOverlap: false,
                    anchorX: "center",  // x对齐方式
                    anchorY: "bottom", // y对齐方式
                    renderTexture: {
                        autoCanvasSize: true,
                        sharedCanvas: true, // 提高效率共享一个canvas
                        canvasWidth: 80, // 像素宽，这里是根据底图的像素宽高定的
                        canvasHeight: 80, // 像素高，这里是根据底图的像素宽高定的
                        elements: [
                            imgEle,
                            new vjmap3d.render2d.Text({
                                style: {
                                    x: 40,
                                    y: 20,
                                    text: idx,
                                    fill: vjmap3d.render2d.color.random(),
                                    font: '30px Arial',
                                    verticalAlign: "top",
                                    align: "center"
                                }
                            })
                        ]
                    }
                });
                // 增加spriteMarker至应用
                spriteMarker.addTo(app);
                spriteMarker.add(vjmap3d.EventModule, {
                    clickHighlight: true,
                    highlightOpacity: 0.2,
                    hoverSelect: true,
                    hoverHtmlText: `ID: ${idx}`,
                    popupOptions: {
                        anchor: "bottom",
                        offset: [0, -80]
                    },
                    clickCallback: (ent, isClick) => {
                        if (isClick) app.logInfo("您点击的ID是: " + idx, 2000)
                    }
                });
        }
        }
        
        
    }
    catch (e) {
        console.error(e);
    }
};