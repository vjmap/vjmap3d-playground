
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/entity/symbolsprite/07spriteImagesEntity
        // --创建精灵图像实体--
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
        let data = [];
        for(let i = 0; i < 20; i++) {
            for(let j = 0; j < 20; j++) {
                data.push({
                    position: [i * 5 - 50, 0, j * 5 - 50],
                    icon: env.assetsPath + `image/sensor${(i % 5) + 1}.png`,
                    highlightOpacity: 0.6,
                    id: j * 20 + i
                });
            }
        }
        let ent = new vjmap3d.SpriteImagesEntity({
            data: data,
            sizeAttenuation: false,
            allowOverlap: false,
        });
        ent.addTo(app);
        //
        ent.pointerEvents = true
        ent.on("mouseover", e => {
            let index = e?.intersection?.object?.userData.objectDataIndex
            if (index !== undefined) {
                ent.setItemHighlight(index, true);
                app.popup2d.show();
                app.popup2d.setOffset([0, -40]);
                app.popup2d.setHTML(`
        ID:${data[index].id}
        `)
                app.popup2d.setPosition(data[index].position)
            }
        })
        ent.on("mouseout", e => {
            let index = e?.intersection?.object?.userData.objectDataIndex
            if (index !== undefined) {
                ent.setItemHighlight(index, false)
                app.popup2d.hide()
            }
        })
        ent.on("click", e => {
            let index = e?.intersection?.object?.userData.objectDataIndex
            if (index !== undefined) {
                app.logInfo(`您点击了ID:${data[index].id}`)
            }
        })
        const ui = await app.getConfigPane({ title: "设置", style: { width: "250px", overflow: "hidden"}});
        let cfg = [
            {
                type: 'checkbox',
                label: '允许重叠',
                property: [ent.getOptions(), "allowOverlap"],
                onChange: () => {
                    ent.update()
                }
            },
            {
                type: 'slider',
                label: '消退距离',
                bounds: [0, 5000],
                stepSize: 1,
                getValue: () => ent.getOptions().fadeDistance ?? 0,
                setValue: (v) => {
                    ent.getOptions().fadeDistance = v;
                    ent.update()
                }
            },
            {
                type: 'button',
                label: '再增加一个',
                value: ()=> {
                    data.push({
                        position: vjmap3d.randPoint3D(),
                        icon: env.assetsPath + `image/sensor${vjmap3d.randInt(1, 5)}.png`,
                        highlightOpacity: 0.6,
                        id: data.length + 1
                    })
                    ent.setData(data)
                }
            },
            {
                type: 'button',
                label: '修改第一个图标',
                value: ()=> {
                    if (data.length > 0) {
                        let icon = env.assetsPath + `image/sensor${vjmap3d.randInt(1, 5)}.png`
                        data[0].icon = icon;
                        data[0].highlightIcon = icon;
                    }
                    ent.setData(data)
                }
            },
            {
                type: 'button',
                label: '删除第一个',
                value: ()=> {
                    if (data.length == 0) {
                        return
                    }
                    data.splice(0, 1)
                    ent.setData(data)
                }
            }
        ]
        cfg.forEach(c => ui.appendChild(c));
        
    }
    catch (e) {
        console.error(e);
    }
};