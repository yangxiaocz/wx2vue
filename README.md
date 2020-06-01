# wx2vue
将微信小程序代码转换成基于vue的网页代码
简介：
使用各种正则加hack的办法，把小程序代码转换为vue的代码。在当年确实实现了低成本的转化为预览性质的网页，但是随着微信小程序功能越来越多，新的语法层出不穷，越来越难以hack，而本人水平有限，代码写的不优雅也做不到wepy那种重写runtime，所以我放弃了这个项目。为了不浪费当年花费的时间和精力，所以放到网上，有需要或是兴趣的，随意取用

使用：
在package.json中加入目标项目的路径

vue的不兼容问题：
定义页面变量或者组件属性的时候不可以使用
1.data，因为访问变量的时候vue用this.xx但微信用this.data.xx,为了兼容，我定义了vue的data属性做转接，因此不能再使用data作为属性名
2.case，因为js语法关键词与vue的模板渲染不兼容
3.以_为前标的变量名比如_nav，因为vue对每个变量都会生成一个_前标的变量用来做get，set语法，变量名本身带_会无法赋值，方法名也一样，比如_init这个方法vue已占用
4.变量名和方法名不能一样，因为不管变量还是方法,vue都是使用this.xx来访问的
