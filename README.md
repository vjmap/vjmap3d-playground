
    
# 介绍
  此工程为[唯杰地图](https://vjmap.com/)   [VJMAP3D](https://vjmap.com/map3d)  示例的所有源代码。

  [在线示例查看地址:](https://vjmap.com/map3d/demo/) https://vjmap.com/map3d/demo/

  ![](https://vjmap.com/blogimages/202406301703728.png)
  
# 运行
  
  入口文件为`index.html`, 示例文件目录为 `src`，每个示例都是独立的例子，都能单独运行。

  由于`File协议`无法实现跨域，如果直接双击`index.html`会导致一些资源无法加载。所以需要以`http服务器`的方式运行。方法为
  
- 方法一(需要有`node`环境)：
```
npm install -g live-server
```
然后在命令行里进入当前目录，输入`live-server`即可。

- 方法二(vscode环境)

在`vscode`里面安装插件`Live Server`，安装成功后，打开此目录，选择一个html页面，右键选择`Open With Live Server`即可。


# 唯杰地图介绍

`唯杰地图VJMAP`为`CAD`图或`自定义地图格式`WebGIS`可视化`显示开发提供的一站式解决方案，支持的格式如常用的`AutoCAD`的`DWG`格式文件、`GeoJSON`等常用`GIS`文件格式，它使用WebGL`矢量图块`和`自定义样式`呈现交互式地图, 提供了全新的`大数据可视化`、`实时流数据`可视化功能，通过本产品可快速实现浏览器和移动端上美观、流畅的地图呈现与空间分析，可帮助您在网站中构建功能丰富、交互性强、可定制的地图应用。

[唯杰地图](https://vjmap.com/)官网地址：https://vjmap.com/

# 唯杰地图特点


- 完全兼容`AutoCAD`格式的`DWG`文件，无需转换

- 地图提供图形的放大、缩小、自由缩放、平移、显示全图等功能，支持鼠标/单指拖拽、上下左右按键进行地图平移，支持鼠标滚轮、双击、双指进行地图缩放，支持Shift+拉框放大；支持飞行、平移等运动特效，支持`地图比较`功能，能导出PNG、PDF、SVG等格式功能；

- 多视角模式：地图支持`2D`、`3D`视角，支持垂直视角、360度旋转视角；

- `CAD`与`GIS`完美结合；地图支持CAD图渲染成`栅格瓦片`和`矢量瓦片`这两种格式，能`自定义地图`样式; 能支持`WMS`格式；支持与`互联网地图叠加`显示;

- 能对地图进行交互操作,包括点击图形查看属性信息、图层开关显示等；能对GIS数据进行`空间查询`操作；

- 支持图形`版本控制`功能；同时提供`协同`更新图形功能，可通过不同部门上传的图形或图层创建协同图形，同时当依赖的图形更新时，协同图形能自动更新至最新版本；

- 支持在Web上进行`绘制图形`功能；可绘制点、线、面、圆等类型，同时能将绘制的图形保存成dwg文件；需支持对CAD图上的坐标进行`捕捉`绘制; 需提供测距、测角度、测面积等`测量`工具;

- 支持`覆盖物`绘制、`聚合`显示、`信息窗口`、`热力图`叠加等常见的地图功能，提供丰富的js接口;

- 绘图技术先进：采用`WebGL`技术；在CAD图叠加万个点以上的用户数据时，渲染不卡顿，支持`大数据可视化`。

- 服务部署`跨平台`支持(支持`windows`,`linux`); 支持`docker`部署，地图查看完全兼容`移动端`。


# 唯杰地图3D
[唯杰地图3D](https://vjmap.com/map3d) `VJMAP3D`是一款基于[threejs](https://threejs.org/)开发的三维可视化引擎框架。通过VJMAP3D提供的丰富的功能，可以在浏览器中创建出绚丽的3D可视化应用。

该框架既可做为一个单独的3D引擎用于数据可视化、产品展示、数字孪生、三维GIS等多个领域的可视化开发, 也可以结合`唯杰地图VJMAP`做为一个`3D`图层，能够在保留二维图形信息的直观性同时，融入三维空间的深度感知和交互性，为用户带来更丰富、立体和沉浸式的视觉体验及数据分析能力。

## 唯杰地图3D特点

- 完全兼容`AutoCAD`格式的`DWG`文件展示，无需转换
- 兼容`唯杰地图`，同一套框架，同一套代码，既兼容`VJMAP`的`3D`图层，又可单独做为三维引擎使用
- 基于`threejs`开发，兼容`threejs`写法。`threejs`拥有庞大的开发者社区和丰富的教程资源，能利用`threejs`生态资源
- 易用性高：学习门槛低，提供丰富的API接口，便于快速上手开发3D应用。
- 丰富的内置功能：提供了预设对象和材质，以及粒子系统、后期处理等高级特性，便于快速实现复杂视觉效果。
- 交互设计：提供丰富的交互组件和事件处理机制，增强用户体验和应用互动性。支持场景中的对象拾取与交互，简化了交互逻辑的实现。
- 扩展性强：基于模块化开发，支持自定义扩展，满足多样化开发需求。

    