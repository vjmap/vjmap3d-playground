
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/interaction/01interactioninput
        // --获取当前输入状态--
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
        app.on("click", e => app.logInfo("您点击了下!", "success" , 1000))
        //
        //app.signal.onMouseClick.add(e => app.logInfo("您点击了下!", "success" , 1000))
        let cfg = [
            {
                type: 'checkbox',
                label: '允许输入',
                getValue: ()=> app.Input.enabled(),
                setValue: v => app.Input.setEnable(v)
            },
            {
                type: 'number',
                label: '当前鼠标X',
                getValue: () => app.Input.x(),
                readOnly: true
            },
            {
                type: 'number',
                label: '当前鼠标Y',
                getValue: () => app.Input.y(),
                readOnly: true
            },
            {
                type: 'number',
                label: '当前鼠标移动X',
                getValue: () => app.Input.movementX(),
                readOnly: true
            },
            {
                type: 'number',
                label: '当前鼠标移动Y',
                getValue: () => app.Input.movementY(),
                readOnly: true
            },
            {
                type: 'checkbox',
                label: '鼠标移动',
                getValue: () => app.Input.isMoving(),
                readOnly: true
            },
            {
                type: 'checkbox',
                label: '鼠标拖动',
                getValue: () => app.Input.isDragging(),
                readOnly: true
            },
            {
                type: 'checkbox',
                label: '左键按下',
                getValue: () => app.Input.isLeftButtonDown(),
                readOnly: true
            },
            {
                type: 'checkbox',
                label: '左键按住',
                getValue: () => app.Input.isLeftButtonPressed(),
                readOnly: true
            },
            {
                type: 'checkbox',
                label: '左键抬起',
                getValue: () => app.Input.isLeftButtonUp(),
                readOnly: true
            },
            {
                type: 'checkbox',
                label: '中键按下',
                getValue: () => app.Input.isMidButtonDown(),
                readOnly: true
            },
            {
                type: 'checkbox',
                label: '中键按住',
                getValue: () => app.Input.isMidButtonPressed(),
                readOnly: true
            },
            {
                type: 'checkbox',
                label: '中键抬起',
                getValue: () => app.Input.isMidButtonUp(),
                readOnly: true
            },
            {
                type: 'checkbox',
                label: '右键按下',
                getValue: () => app.Input.isRightButtonDown(),
                readOnly: true
            },
            {
                type: 'checkbox',
                label: '右键按住',
                getValue: () => app.Input.isRightButtonPressed(),
                readOnly: true
            },
            {
                type: 'checkbox',
                label: '右键抬起',
                getValue: () => app.Input.isRightButtonUp(),
                readOnly: true
            },
            {
                type: 'checkbox',
                label: '按住Shift键',
                getValue: () => !!(app.Input.getKeyPressed("ShiftLeft") || app.Input.getKeyPressed("ShiftRight")),
                readOnly: true
            },
            {
                type: 'checkbox',
                label: '按住Ctrl键',
                getValue: () => !!(app.Input.getKeyPressed("ControlLeft") || app.Input.getKeyPressed("ControlRight")),
                readOnly: true
            },
            {
                type: 'checkbox',
                label: '按住Alt键',
                getValue: () => !!(app.Input.getKeyPressed("AltLeft") || app.Input.getKeyPressed("AltRight")),
                readOnly: true
            }
        ]
        const ui = await app.getConfigPane({ title: "输入参数", style: { width: "250px"}});
        cfg.forEach(c => ui.appendChild(c));
    }
    catch (e) {
        console.error(e);
    }
};