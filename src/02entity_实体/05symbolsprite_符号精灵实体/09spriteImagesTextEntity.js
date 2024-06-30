
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/entity/symbolsprite/09spriteImagesTextEntity
        // --精灵图像文本组合使用--
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            stat: { show: true, left: "0" },
            scene: {
                gridHelper: { visible: true,  } // 是否显示坐标网格
            },
            camera: {  // 相机设置
                viewHelper: { enable: true, position: "leftBottom" } // 是否显示视角指示器
            }
        })
        let image = await vjmap3d.loadImage(env.assetsPath + "image/imgbg.png")
        let textDatas = [];
        let imageDatas = [];
        for(let i = 0; i < 20; i++) {
            for(let j = 0; j < 20; j++) {
                let id = j * 20 + i;
                let position =  [i * 5 - 50, 0, j * 5 - 50]
                // 图片
                imageDatas.push({
                    position: position,
                    icon: env.assetsPath + `image/sensor${(i % 5) + 1}.png`,
                    highlightOpacity: 0.6,
                    id: id,
                    collideId: 'spriteImageText' + id,
                    collideZIndex: id,
                });
                // 文本
                textDatas.push({
                    position: position,
                    text: `ID: ${id}`,
                    style: {
                        fill: '#FF1285',
                        font: '20px sans-serif',
                        padding: [5, 5, 5, 5],
                        backgroundColor: '#FFFE91',
                        borderColor: '#FFFE91',
                        borderWidth: 2,
                        borderRadius: 5
                    },
                    id: id,
                    anchorX: "center",
                    anchorY: "top",
                    offsetY: 5,
                    collideZIndex: id,
                    collideId: 'spriteImageText' + id,
                });
            }
        }
        let entImage = new vjmap3d.SpriteImagesEntity({
            data: imageDatas,
            sizeAttenuation: false,
            allowOverlap: false,
        });
        entImage.addTo(app);
        //
        let entText = new vjmap3d.SpriteTextsEntity({
            data: textDatas,
            sizeAttenuation: false,
            allowOverlap: false,
        });
        entText.addTo(app);
        
    }
    catch (e) {
        console.error(e);
    }
};