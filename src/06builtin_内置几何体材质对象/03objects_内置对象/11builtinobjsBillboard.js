
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/builtin/objects/11builtinobjsBillboard
        // --公告板Billboard--
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
        const createTorusMesh = () => {
            const geometry = new THREE.TorusKnotGeometry(1, 0.35, 100, 32)
            const mat = new THREE.MeshStandardMaterial({
              roughness: 0,
              color: 0xffffff * Math.random(),
            })
            const torusMesh = new THREE.Mesh(geometry, mat)
            torusMesh.castShadow = true
            torusMesh.receiveShadow = true
            return torusMesh
        }
        // 正常的，用于对比
        let torusNormalEnt = new vjmap3d.MeshEntity(createTorusMesh())
        torusNormalEnt.position.set(0, 6, 0);
        torusNormalEnt.addTo(app);
        // 设置了公告板模式的
        let torusBillboardEnt = new vjmap3d.MeshEntity(createTorusMesh())
        torusBillboardEnt.position.set(1, 2, 0);
        torusBillboardEnt.addTo(app);
        let opts = {
            follow: true,
            lockX: false,
            lockZ: false,
            lockY: false,
            baseOnPreRotation: true,
        }
        torusBillboardEnt.add(vjmap3d.BillboardModule, opts);
        let mod = torusBillboardEnt.getModule(vjmap3d.BillboardModule);
        const ui = await app.getConfigPane()
        let gui = new vjmap3d.UiPanelJsonConfig();
        gui.add(opts, "follow").onChange(v => {
            mod.billboard.updateProps(opts)
        })
        gui.add(opts, "lockX").onChange(v => {
            mod.billboard.updateProps(opts)
        })
        gui.add(opts, "lockZ").onChange(v => {
            mod.billboard.updateProps(opts)
        })
        gui.add(opts, "lockY").onChange(v => {
            mod.billboard.updateProps(opts)
        })
        gui.add(opts, "baseOnPreRotation").onChange(v => {
            mod.billboard.updateProps(opts)
        })
        gui.toJson().forEach(c => ui.appendChild(c));
        
    }
    catch (e) {
        console.error(e);
    }
};