
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/ui/contextmenu/02uicontextmenubutton
        // --按钮上下文菜单--
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
        const resetSettings = '<svg xmlns="http://www.w3.org/2000/svg" style="width:100%; height:100%;" fill="currentColor" viewBox="0 0 24 24">\n' +
            ' <path fill="currentColor" d="M19 8L15 12H18C18 15.31 15.31 18 12 18C11 18 10.03 17.75 9.2 17.3L7.74 18.76C8.97 19.54 10.43 20 12 20C16.42 20 20 16.42 20 12H23M6 12C6 8.69 8.69 6 12 6C13 6 13.97 6.25 14.8 6.7L16.26 5.24C15.03 4.46 13.57 4 12 4C7.58 4 4 7.58 4 12H1L5 16L9 12M14 12C14 13.11 13.11 14 12 14S10 13.11 10 12 10.9 10 12 10 14 10.9 14 12Z" />\n' +
            '</svg>'
        const trash = '<svg xmlns="http://www.w3.org/2000/svg" style="width:100%; height:100%;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">\n' +
            ' <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />\n' +
            '</svg>'
        let control = new vjmap3d.ButtonGroupControl({
            buttons: [
                {
                    id: 'reset-settings',
                    icon: resetSettings,
                    title: 'Reset All Settings',
                //    round: true,
                    onclick: async(e, element) => {
                        let rect = element.getBoundingClientRect()
                        let position = [rect.left - 6, rect.bottom + 8]
        
                    new vjmap3d.ContextMenu({
                        position,
                        theme: "dark", //light
                        width: "150px",
                        items: [
                            {
                                label: 'Menu1',
                                onClick: () => {
                                    app.logInfo("Menu1", "success");
                                }
                            },
                            {
                                label: 'Menu2',
                                onClick: () => {
                                    app.logInfo("Menu2", "success");
                                }
                            }
                        ]
                    });
                },
            },
            {
                id: 'clear-scene',
                icon: trash,
                title: 'Clear Scene',
                // checked: true,
                // toggle: true,
                //round: true,
                onclick: async(e, element) => {
                    let rect = element.getBoundingClientRect()
                    let position = [rect.left - 6, rect.bottom + 8]
                    
                    new vjmap3d.ContextMenu({
                        event: e,
                        position,
                        theme: "dark", //light
                        width: "150px",
                        items: [
                            {
                                label: '菜单一',
                                onClick: () => {
                                    app.logInfo("菜单一", "success");
                                }
                            },
                            {
                                label: '菜单二',
                                onClick: () => {
                                    app.logInfo("菜单二", "success");
                                }
                            }
                        ]
                    });
                },
            },
        ],
        direction: "row",
        barSelectMode: true,
        barCurSelectId: "reset-settings"
        //  lightTheme: true
        });
        app.addControl(control, "top-left")
        
    }
    catch (e) {
        console.error(e);
    }
};