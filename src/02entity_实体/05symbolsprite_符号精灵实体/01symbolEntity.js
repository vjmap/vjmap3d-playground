
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/entity/symbolsprite/01symbolEntity
        // --创建符号实体--创建、修改、删除符号实体
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
        let data = [];
        data.push({
            position: [-2, 3, 4],
            color: "#0ff",
            borderColor: "#ff0",
            size: 20
        })
        data.push({
            position: [2, 4, 3],
            color: "#0f0",
            borderColor: "#ff0",
            size: 25
        })
        let symbol = new vjmap3d.SymbolEntity({ //SymbolEntity
            data: data,
            pixelRaycasting: true, // 像素大小拾取
            style: {
                shape: "circle",
                transparent: true,
                //fadeDistance: 500,
                borderWidth: 2,
                sizeAttenuation: false
            }
        })
        symbol.addTo(app);
        symbol.symbolObject.userData.RaycasterThreshold = 15; // 可设置像素捕捉的距离，默认为6
        // 允许事件
        symbol.pointerEvents = true;
        symbol.on("mouseover", e => {
            if (e.intersection.index >= 0) {
                let pointsData = symbol.getData();
                app.setCursor("pointer");
                pointsData[e.intersection.index].highlightColor = "#f00";
                pointsData[e.intersection.index].highlightSize =
                    (pointsData[e.intersection.index].size ?? 3) + 5;
                symbol.setData(pointsData)
                app.popup2d.setText(`id: ${pointsData[e.intersection.index].id}`)
                app.popup2d.setPosition(pointsData[e.intersection.index].position)
                // app.popup2d.setPosition(e?.intersection?.point, true)
                app.popup2d.show();
            }
        });
        symbol.on("mouseout", e => {
            if (e.intersection.index >= 0) {
                app.setCursor("");
                // 取消高亮
                let pointsData = symbol.getData();
                delete pointsData[e.intersection.index].highlightColor;
                delete pointsData[e.intersection.index].highlightSize;
                symbol.setData(pointsData)
                app.popup2d.hide();
            }
        });
        //
        let mod = symbol.getModule(vjmap3d.SymbolModule);
        const ui = await app.getConfigPane({ title: "设置", style: { width: "250px", overflow: "hidden"}});
        let cfg = [
            {
                type: 'button',
                label: '增加一个点符号',
                value: ()=> {
                    data.push({
                        position: vjmap3d.randPoint3D(),
                        color: vjmap3d.randColor(),
                        borderColor: vjmap3d.randColor(),
                        size: vjmap3d.randInt(10, 20)
                    })
                    symbol.setData(data)
                }
            },
            {
                type: 'button',
                label: '修改第一个符号颜色',
                value: ()=> {
                    if (data.length > 0) {
                        data[0].color = vjmap3d.randColor()
                    }
                    symbol.setData(data)
                }
            },
            {
                type: 'button',
                label: '删除第一个符号',
                value: ()=> {
                    if (data.length == 0) {
                        return
                    }
                    data.splice(0, 1)
                    symbol.setData(data)
                }
            },
            {
                type: 'dropdown',
                label: '形状',
                property: [mod.style, 'shape'],
                children: [
                    {
                        label: "正方形",
                        value: "square",
                    },
                    {
                        label: "圆",
                        value: "circle",
                    },
                    {
                        label: "三角形",
                        value: "triangle",
                    }
                ],
                onChange: () => {
                    symbol.updateStyle(mod.style)
                }
            }
        ]
        cfg.forEach(c => ui.appendChild(c));
    }
    catch (e) {
        console.error(e);
    }
};