function isString(i) {
  return typeof i === "string";
}

function isNumber(i) {
  return !isNaN(i);
}

function isFunction(i) {
  return typeof i === "function";
}

function humpToStandard(klass) {
  return klass.replace(/[A-Z]/, (match) => "-" + match.toLowerCase());
}

function setAttribute(dom, attr, value) {
  if (attr === "className") {
    attr = "class";
  }
  if (attr.match(/on\w+/)) {
    // 处理事件的属性:
    const eventName = attr.toLowerCase().substr(2);
    dom.addEventListener(eventName, value);
  } else if (attr === "style") {
    // 处理样式的属性:
    let styleStr = "";
    let standardCss;
    for (let klass in value) {
      standardCss = humpToStandard(klass); // 处理驼峰样式为标准样式
      value[klass] = isNumber(+value[klass])
        ? value[klass] + "px"
        : value[klass]; // style={{ className: '20' || '20px' }}>
      styleStr += `${standardCss}: ${value[klass]};`;
    }
    dom.setAttribute(attr, styleStr);
  } else {
    // 其它属性
    dom.setAttribute(attr, value);
  }
}

// const vdom = {
//   attributes: { className: "title" },
//   children: [
//     "hello",
//     {
//       attributes: { className: "content" },
//       children: ["world!"],
//       nodeName: "span",
//     },
//   ],
//   nodeName: "div",
// };

function _render(component, container) {
  const vdom = component.render ? component.render() : component;
  if (isString(vdom) || isNumber(vdom)) {
    container.innerText = container.innerText + vdom;
    return;
  }
  const hasSetRoot = !!component.container;
  const dom = hasSetRoot
    ? component.container
    : document.createElement(vdom.nodeName);
  if (hasSetRoot) {
    component.container.innerHTML = null;
  }
  for (let attr in vdom.attributes) {
    setAttribute(dom, attr, vdom.attributes[attr]);
  }
  vdom.children.forEach((vdomChild) => render(vdomChild, dom));

  if (hasSetRoot) {
    return;
  }

  component.container = dom; // container?
  container.appendChild(dom);
}

function render(vdom, container) {
  let component;
  if (isFunction(vdom.nodeName)) {
    if (vdom.nodeName.prototype.render) {
      component = new vdom.nodeName(vdom.attributes);
    } else {
      component = vdom.nodeName(vdom.attributes); // 处理无状态组件: const A = (props) => <div>I'm {props.name}</div>
    }
  }
  component ? _render(component, container) : _render(vdom, container);
}

function createElement(tag, attr, ...child) {
  return {
    attributes: attr,
    children: child,
    key: undefined,
    nodeName: tag,
  };
}

const LightReact = {
  createElement,
  render,
};

function Component(props) {
  this.props = props;
  this.state = this.state || {
    count: 2,
  };
}

Component.prototype.setState = function (updateObj) {
  this.state = Object.assign({}, this.state, updateObj);
  console.log(this);
  _render(this); // 重新渲染
};
class A extends Component {
  render() {
    return (
      <div>
        <p>
          I'm {this.props.name} {this.state?.count}
        </p>
        <button
          onClick={() => {
            this.setState({
              count: 1,
            });
          }}
        >
          Add count
        </button>
      </div>
    );
  }
}

// 测试
const element = (
  <div className="title">
    hello
    <span
      className="content"
      style={{ color: "red", marginLeft: 20, display: "inline-block" }}
    >
      world!
    </span>
    <A name={"Hello react1"} />
  </div>
);

console.log(element);
console.log(JSON.stringify(element)); // 打印结果符合预期

LightReact.render(
  element, // 上文的 element, 即虚拟 dom
  document.getElementById("root")
);
