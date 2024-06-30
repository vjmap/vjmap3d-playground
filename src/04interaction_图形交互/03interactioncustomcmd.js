
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/interaction/03interactioncustomcmd
        // --自定义命令--
        // 增加对象命令
        class MyAddObject3DCommand extends vjmap3d.BaseCommand {
        	constructor (object) {
        		super();
                this.object = object;
        	}
        	execute () {
                if (!this.object && this.json) {
                    //  如果是redo过来的
                    let loader = new THREE.ObjectLoader();
                    this.object = loader.parse(this.json);
                }
                if (this.object) {
                    this.app.scene.add(this.object);
                }
        	}
        	undo () {
        		if (this.object) {
                    this.json = this.object.toJSON(); // 保存对象的json
                    this.object.parent.remove(this.object)
                    this.object = null;
                }
        	}
        	redo () {
        		this.execute();
        	}
        }
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            stat: { show: true, left: "0" },
            scene: {
                gridHelper: { visible: true } // 是否显示坐标网格
            },
            camera: {  // 相机设置
                viewHelper: { enable: true, position: "leftBottom" } // 是否显示视角指示器
            },
            control: { leftButtonPan: true } // 设置为左键用于旋转 (同时右键将用于平移) 和地图2d使用习惯一样
        })
        const ui = await app.getConfigPane({ title: "输入参数", style: { width: "250px"}});
        let gui = new vjmap3d.UiPanelJsonConfig();
        gui.addButton("增加实体", () => {
            let box = new THREE.BoxGeometry(Math.random() * 3 + 0.5, Math.random() * 3 + 0.5, Math.random() * 3 + 0.5)
            const material = new THREE.MeshStandardMaterial({
                color: vjmap3d.randColor()
            });
            let mesh = new THREE.Mesh(box, material);
            mesh.position.copy(vjmap3d.toVector3(vjmap3d.randPoint3D({maxX: 5, maxY: 2, maxZ: 5, minX: -5, minY: -2, minZ: -5})))
            app.executeCommand(new MyAddObject3DCommand(mesh));
            // 上面的语句等同行下面的两句（可以先mesh加进场景）
            //app.scene.add(mesh);
            //app.addCommand(new MyAddObject3DCommand(mesh));
        })
        gui.addButton("撤销", () => {
            app.undo()
        })
        gui.addButton("重做", () => {
            app.redo()
        })
        gui.addButton("清空命令", () => {
            app.clearCommands()
        })
        gui.toJson().forEach(c => ui.appendChild(c));
    }
    catch (e) {
        console.error(e);
    }
};