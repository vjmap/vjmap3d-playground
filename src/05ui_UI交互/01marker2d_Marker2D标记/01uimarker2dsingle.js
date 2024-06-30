
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/ui/marker2d/01uimarker2dsingle
        // --创建Marker2D标记--
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            stat: { show: true, left: "0" },
            scene: {
                gridHelper: { visible: true } // 是否显示坐标网格
            },
            camera: {  // 相机设置
                viewHelper: { enable: true, position: "leftBottom" } // 是否显示视角指示器
            }
        })
        let marker2d = new vjmap3d.Marker2D({
            color: vjmap3d.randHtmlColor(),
            draggable: true,
            allowOverlap: false
        });
        marker2d.setPosition([2, 0, 1]);
        marker2d.addTo(app);
        marker2d.signal.dragstart.add(() => {
            app.logInfo("dragstart");
        });
        marker2d.signal.drag.add(() => {
            app.logInfo("drag");
        });
        marker2d.signal.dragend.add(() => {
            app.logInfo("dragend");
        });
        marker2d.signal.click.add(() => {
            app.logInfo("click");
        });
        marker2d.signal.occlusion.add(() => {
            app.logInfo("occlusion");
        });
        marker2d.signal.elementSizeReady.add(() => {
            app.logInfo("elementSizeReady");
        });
        marker2d.signal.onAdd.add(() => {
            app.logInfo("onAdd");
        });
        marker2d.signal.onRemove.add(() => {
            app.logInfo("onRemove");
        });
        marker2d.getElement().addEventListener("contextmenu", event => {
            // @ts-ignore
            if (event.button != 2) return;//不是右键
            // 阻止地图默认右键菜单触发
            event.preventDefault();
            event.stopPropagation();
            new vjmap3d.ContextMenu({
                event: event,
                theme: "dark", //light
                width: "250px",
                items: [
                    {type: 'custom', markup: `
        我是标注Marker的右键菜单
        `},
                    {
                        label: '删除Marker',
                        onClick: () => {
                            marker2d.remove()
                        }
                    }
                ]
            });
        })
            
            
    }
    catch (e) {
        console.error(e);
    }
};