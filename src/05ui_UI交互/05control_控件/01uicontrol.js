
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/ui/control/01uicontrol
        // --默认控件--
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
        const controls = {
            showMousePositionControl: false,
            showFullscreenControl: false,
            showButtonGroupControl: false,
            showMiniMapControl: false
        }
        let mousePositionControl, fullscreenControl, buttonGroupControl, miniMapControl;
        const ui = await app.getConfigPane({ title: "工具", style: { width: "300px"}});
        let gui = new vjmap3d.UiPanelJsonConfig();
        gui.add(controls, "showMousePositionControl").label("鼠标位置控件").onChange(v => {
            if (v) {
                mousePositionControl = new vjmap3d.MousePositionControl({
                    UnProjectModes: [false, "depth"]
                });
                app.addControl(mousePositionControl);
            } else {
                app.removeControl(mousePositionControl);
            }
        })
        gui.add(controls, "showFullscreenControl").label("全屏控件").onChange(v => {
            if (v) {
                fullscreenControl = new vjmap3d.FullscreenControl({
                });
                app.addControl(fullscreenControl, "top-left");
            } else {
                app.removeControl(fullscreenControl);
            }
        })
        gui.add(controls, "showButtonGroupControl").label("按钮组控件").onChange(v => {
            if (v) {
                const resetSettings = '<svg xmlns="http://www.w3.org/2000/svg" style="width:100%; height:100%;" fill="currentColor" viewBox="0 0 24 24">\n' +
                ' <path fill="currentColor" d="M19 8L15 12H18C18 15.31 15.31 18 12 18C11 18 10.03 17.75 9.2 17.3L7.74 18.76C8.97 19.54 10.43 20 12 20C16.42 20 20 16.42 20 12H23M6 12C6 8.69 8.69 6 12 6C13 6 13.97 6.25 14.8 6.7L16.26 5.24C15.03 4.46 13.57 4 12 4C7.58 4 4 7.58 4 12H1L5 16L9 12M14 12C14 13.11 13.11 14 12 14S10 13.11 10 12 10.9 10 12 10 14 10.9 14 12Z" />\n' +
                '</svg>'
                const trash = '<svg xmlns="http://www.w3.org/2000/svg" style="width:100%; height:100%;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">\n' +
                ' <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />\n' +
                '</svg>'
                buttonGroupControl = new vjmap3d.ButtonGroupControl({
                    buttons: [
                        {
                            id: 'settings',
                            icon: resetSettings,
                            title: 'settings',
                           //    round: true,
                            onclick: async() => {
                                app.logInfo("settings", "success")
                            },
                        },
                        {
                            id: 'trash',
                            icon: trash,
                            title: 'trash',
                            checked: true,
                            // toggle: true,
                            //round: true,
                            onclick: async() => {
                                app.logInfo("trash", "success")
                            },
                        },
                    ],
                    direction: "column",
                    barSelectMode: true,
                    barCurSelectId: "settings"
                });
                app.addControl(buttonGroupControl, "top-left")
            } else {
                app.removeControl(buttonGroupControl);
            }
        })
        gui.add(controls, "showMiniMapControl").label("小地图控件").onChange(v => {
            if (v) {
                miniMapControl = new vjmap3d.MiniMapControl({
                });
                app.addControl(miniMapControl, "bottom-right")
            } else {
                app.removeControl(miniMapControl);
            }
        })
        gui.toJson().forEach(c => ui.appendChild(c));
    }
    catch (e) {
        console.error(e);
    }
};