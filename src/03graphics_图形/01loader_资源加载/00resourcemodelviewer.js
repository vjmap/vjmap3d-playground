
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/graphics/loader/00resourcemodelviewer
        // --模型查看器--请选择模型拖放至场景中查看模型
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                gridHelper: { visible: true }, // 是否显示坐标网格
            },
            stat: {
                show: true,
                left: "0"
            },
            camera: {  // 相机设置
                viewHelper: { enable: true, position: "leftBottom" } // 是否显示视角指示器
            }
        })
        // 加载插件
        await vjmap3d.ResManager.loadExtensionLoader();
        await vjmap3d.ResManager.loadExtensionIfcLoader();
        
        // 支持拖放
        const dropZone = document.getElementById('map');
        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, preventDefaults, false);
        });
        
        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        // Highlight drop area when item is dragged over it
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.add('dragover');
            }, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.remove('dragover');
            }, false);
        });
        
        // Handle dropped files
        dropZone.addEventListener('drop', handleDrop, false);
        
        app.logInfo("拖动模型至场景中,W 键平移模式, E 键旋转模式, R 键缩放模式, X Y Z 键对轴显示或隐藏；按右键或回车结束", "success", 30000)
        async function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;
        
            // 获取文件类型后缀
            let ext = files[0].name.substring(files[0].name.indexOf(".") + 1).toLowerCase()
            // Only handle the first file for this example
            if (files.length > 0) {
                const file = files[0];
                const url = URL.createObjectURL(file);
                
                let ent = await vjmap3d.ResManager.loadModel(url, {
                    splitSubEntity: true,
                    size:  5,
                    //anchor: "front-bottom",
                    position: app.unproject(e.x, e.y), // 当前拖放的位置
                    fileType: ext
                });
                ent.addTo(app);
        
                // 属性面板
                const ui = await app.getConfigPane()
                ui.setVisible(true);
                let config = vjmap3d.makeObject3DUiConfig(ent.node)
                ui.appendChild(config)
        
                // 编辑
                let options = {
                    target: ent.node,
                    clickNoSelfEntityExit: false,
                    clickNoEntityExit: false, 
                    rightClickConfirmExit: true // 右键退出编辑
                }
                await app.transformObject(options)
        
                ui.setVisible(false);
            }
        } 
        
        
    }
    catch (e) {
        console.error(e);
    }
};