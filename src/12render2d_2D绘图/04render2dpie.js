
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/render2d/04render2dpie
        // --2D绘制饼状图--
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                gridHelper: { visible: true } // 是否显示坐标网格
            },
            camera: {  // 相机设置
                viewHelper: { enable: true, position: "leftBottom" } // 是否显示视角指示器
            },
            control: { leftButtonPan: true } // 设置为左键用于旋转 (同时右键将用于平移) 和地图2d使用习惯一样
        })
        
        for(let c = 0; c < 5; c++) {
            let elements = [];
            // 数据
            let data = [
               { name: 'A', value: 40 - c * 6 },
               { name: 'B', value: 20  + c * 6},
               { name: 'C', value: 25 + c * 2},
               { name: 'D', value: 15 - c * 2}
           ];
           
           // 计算总值
           let totalValue = data.reduce(function (sum, item) {
               return sum + item.value;
           }, 0);
           
           // 饼图起始角度
           let startAngle = 0;
           
           // 颜色数组
           let colors = ['#ff9999', '#66b3ff', '#99ff99', '#ffcc99'];
           
           // 创建饼图部分
           data.forEach(function (item, index) {
               let value = item.value;
               let endAngle = startAngle + (value / totalValue) * 360;
               let percentage = ((value / totalValue) * 100).toFixed(2) + '%';
           
               // 创建饼图部分
               let sector = new vjmap3d.render2d.Sector({
                   shape: {
                       cx: 400, // 中心 x 坐标
                       cy: 400, // 中心 y 坐标
                       r: 300, // 外半径
                       r0: 0, // 内半径
                       startAngle: startAngle * Math.PI / 180,
                       endAngle: endAngle * Math.PI / 180,
                       clockwise: true
                   },
                   style: {
                       fill: colors[index],
                       shadowBlur: 10,
                       shadowColor: 'rgba(0, 0, 0, 0.5)',
                       transition: 'all 0.3s'
                   },
                   z2: 2
               });
           
               elements.push(sector);
           
               // 标签文字
               let midAngle = (startAngle + endAngle) / 2;
               let x = 400 + 180 * Math.cos(midAngle * Math.PI / 180);
               let y = 400 + 180 * Math.sin(midAngle * Math.PI / 180);
           
               let text = new vjmap3d.render2d.Text({
                   style: {
                       text: percentage,
                       x: x,
                       y: y,
                       textAlign: 'center',
                       textVerticalAlign: 'middle',
                       fontSize: 30,
                       fill: '#fff',
                       fontWeight: 'bold'
                   },
                   z2: 3
               });
           
               elements.push(text);
           
               // 鼠标悬停效果
               sector.on('mouseover', function () {
                   sector.animateTo({
                       shape: {
                           r: 320
                       },
                       style: {
                           shadowBlur: 20,
                           shadowColor: 'rgba(0, 0, 0, 0.8)'
                       }
                   }, {
                       duration: 300,
                       during: () => {
                           refreshTexture()
                       }
                   });
               });
           
               sector.on('mouseout', function () {
                   sector.animateTo({
                       shape: {
                           r: 300
                       },
                       style: {
                           shadowBlur: 10,
                           shadowColor: 'rgba(0, 0, 0, 0.5)'
                       }
                   }, {
                       duration: 300,
                       during: (p) => {
                         refreshTexture()
                       }
                   });
               });
               sector.on('mouseup',  () => {
                   app.logInfo('click value is ' + value, "success")
                });
               startAngle = endAngle;
           });
           // 做为2d绘图渲染材质使用
           let renderTexture = vjmap3d.createRender2dTexture({
               autoCanvasSize: false, // 是否根据绘制的内容计算渲染的大小
               sharedCanvas: false, // 是否为了提高效率共享一个canvas
               canvasWidth: 800, // 像素宽，这里是根据底图的像素宽高定的
               canvasHeight: 800, // 像素高，这里是根据底图的像素宽高定的
               elements: elements,
           });
           let geoW = 2, geoH = 2;
           let geom = new THREE.PlaneGeometry(geoW, geoH);
           let mat = new THREE.MeshStandardMaterial({
               map: renderTexture.texture(),
               transparent: true
           })
           let mesh = new THREE.Mesh(geom, mat);
           mesh.position.set(c * 2 - 6, 0, 0);
           mesh.rotateX(-Math.PI / 2)
           let meshEntity = vjmap3d.Entity.fromObject3d(mesh);
           meshEntity.addTo(app);
           
           meshEntity.pointerEvents = true; // 允许事件交互
           // 响应相关事件，并且向RenderTexture的元素进行派发事件
           meshEntity.on("mousemove", e => {
               renderTexture.dispatchEvent("mousemove", e?.intersection?.uv);
           });
           meshEntity.on("mouseup", e => {
               renderTexture.dispatchEvent("mouseup", e?.intersection?.uv);
           });
           meshEntity.on("mouseout", e => {
               renderTexture.dispatchEvent("mouseout");
           });
           // 刷新材质
           const refreshTexture = vjmap3d.throttle(() => {
               let texture = renderTexture.texture();
               texture.needsUpdate = true;
               mesh.material.map.dispose();
               mesh.material.map = texture;
           }, 10);
               
        }
        
            
            
            
    }
    catch (e) {
        console.error(e);
    }
};