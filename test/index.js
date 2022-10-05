function isString(i){
  return typeof i === 'string'
}

function isNumber(i){
  return !isNaN(i)
}

function setAttribute(dom, attr, value) {
  if (attr === 'className') {
    attr = 'class'
  }
  if (attr.match(/on\w+/)) {   // 处理事件的属性:
    const eventName = attr.toLowerCase().substr(2)
    dom.addEventListener(eventName, value)
  } else if (attr === 'style') { // 处理样式的属性:
    let styleStr = ''
    let standardCss
    for (let klass in value) {
      standardCss = humpToStandard(klass) // 处理驼峰样式为标准样式
      value[klass] = isNumber(+value[klass]) ? value[klass] + 'px' : value[klass] // style={{ className: '20' || '20px' }}>
      styleStr += `${standardCss}: ${value[klass]};`
    }
    dom.setAttribute(attr, styleStr)
  } else {                       // 其它属性
    dom.setAttribute(attr, value)
  }
}

function render(vdom, container) {
  if (isString(vdom) || isNumber(vdom)) {
    container.innerText = container.innerText + vdom // fix <div>I'm {this.props.name}</div>
    return
  }
  const dom = document.createElement(vdom.nodeName)
  for (let attr in vdom.attributes) {
    setAttribute(dom, attr, vdom.attributes[attr])
  }
  vdom.children.forEach(vdomChild => render(vdomChild, dom))
  container.appendChild(dom)
}

function createElement(tag, attr, ...child) {
  return {
    attributes: attr,
    children: child,
    key: undefined,
    nodeName: tag,
  }
}

const LightReact = {
  createElement,
  render
}

// 测试
const element = (
  <div className="title">
    hello<span className="content">world!</span>
  </div>
)

console.log(element) // 打印结果符合预期

LightReact.render(
  element, // 上文的 element, 即虚拟 dom
  document.getElementById('root')
)