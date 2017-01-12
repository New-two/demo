/* Zepto v1.0-1-ga3cab6c - polyfill zepto detect event ajax form fx - zeptojs.com/license */
;(function(undefined) {
  if (String.prototype.trim === undefined) // fix for iOS 3.2
  String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, '')
  }

  // For iOS 3.x
  // from https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/reduce
  //������������þ�������һ���ۼƴ�������ã���ǰһ�����ݵĴ�����������һ�εĴ���
  //����[1,2,3,4,].reduce(function(x,y){ return x+y}); ==> ((1+2)+3)+4,

  if (Array.prototype.reduce === undefined) Array.prototype.reduce = function(fun) {
    if (this === void 0 || this === null) throw new TypeError()
    var t = Object(this),
      len = t.length >>> 0,
      k = 0,
      accumulator
    if (typeof fun != 'function') throw new TypeError()
    if (len == 0 && arguments.length == 1) throw new TypeError()
    //ȡ��ʼֵ  
    if (arguments.length >= 2) accumulator = arguments[1] //����������ȴ���2�����򽫵ڶ���������Ϊ��ʼֵ
    else do {
      if (k in t) {
        accumulator = t[k++] //��������ĵ�һ��������Ϊ����ֵ
        break
      }
      if (++k >= len) throw new TypeError() //ʲô����»�ִ�е�������������
    } while (true)
    //�������飬��ǰһ�εĽ�����봦���������ۼƴ���
    while (k < len) {
      if (k in t) accumulator = fun.call(undefined, accumulator, t[k], k, t)
      k++
    }
    return accumulator
  }

})()

var Zepto = (function() {
  var undefined, key, $, classList, emptyArray = [],
    slice = emptyArray.slice,
    filter = emptyArray.filter,
    document = window.document,
    elementDisplay = {}, classCache = {},
    getComputedStyle = document.defaultView.getComputedStyle,
    //����CSSʱ�����ü�px��λ������
    cssNumber = {
      'column-count': 1,
      'columns': 1,
      'font-weight': 1,
      'line-height': 1,
      'opacity': 1,
      'z-index': 1,
      'zoom': 1
    },
    //HTML����Ƭ�ϵ�����
    fragmentRE = /^\s*<(\w+|!)[^>]*>/,
    //ƥ��ǵ���һ���պϱ�ǩ�ı�ǩ�����ƽ�<div></div>д����<div/>
    tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
    //���ڵ�
    rootNodeRE = /^(?:body|html)$/i,

    //��Ҫ�ṩget��set�ķ�����
    // special attributes that should be get/set via method calls
    methodAttributes = ['val', 'css', 'html', 'text', 'data', 'width', 'height', 'offset'],
    //���ڽڵ��һЩ����
    adjacencyOperators = ['after', 'prepend', 'before', 'append'],
    table = document.createElement('table'),
    tableRow = document.createElement('tr'),
    //�������;�ǵ���Ҫ��tr,tbody,thead,tfoot,td,th����innerHTMl��ʱ����Ҫ���丸Ԫ����Ϊ������װ��HTML�ַ���
    containers = {
      'tr': document.createElement('tbody'),
      'tbody': table,
      'thead': table,
      'tfoot': table,
      'td': tableRow,
      'th': tableRow,
      '*': document.createElement('div')
    },
    //��DOM ready��ʱ��document������������״̬��һ��
    readyRE = /complete|loaded|interactive/,
    //classѡ����������
    classSelectorRE = /^\.([\w-]+)$/,
    //idѡ����������
    idSelectorRE = /^#([\w-]*)$/,
    //DOM��ǩ����
    tagSelectorRE = /^[\w-]+$/,
    class2type = {},
    toString = class2type.toString,
    zepto = {},
    camelize, uniq,
    tempParent = document.createElement('div');

  //�ж�һ��Ԫ���Ƿ�ƥ�������ѡ����
  zepto.matches = function(element, selector) {
    if (!element || element.nodeType !== 1) return false
    //����������ṩ��MatchesSelector����
    var matchesSelector = element.webkitMatchesSelector || element.mozMatchesSelector || element.oMatchesSelector || element.matchesSelector
    if (matchesSelector) return matchesSelector.call(element, selector);
    //����������֧��MatchesSelector�������򽫽ڵ����һ����ʱdiv�ڵ㣬
    //��ͨ��selector���������div�µĽڵ㼯�����жϸ�����element�Ƿ��ڽڵ㼯�У�����ڣ��򷵻�һ������(����false)������
    // fall back to performing a selector:
    var match, parent = element.parentNode,temp = !parent
    //��elementû�и��ڵ㣬��ô������뵽һ����ʱ��div����
    if (temp)(parent = tempParent).appendChild(element)
    //��parent��Ϊ�����ģ�������selector��ƥ����������ȡelement�ڽ������������������ʱΪ��1,��ͨ��~-1ת��0������ʱ����һ�������ֵ
    match = ~zepto.qsa(parent, selector).indexOf(element)
    //������Ľڵ�ɾ��
    temp && tempParent.removeChild(element)
    return match
  }

  //��ȡ�������� 

  function type(obj) {
    //objΪnull����undefinedʱ��ֱ�ӷ���'null'��'undefined'
    return obj == null ? String(obj) : class2type[toString.call(obj)] || "object"
  }

  function isFunction(value) {
    return type(value) == "function"
  }

  function isWindow(obj) {
    return obj != null && obj == obj.window
  }

  function isDocument(obj) {
    return obj != null && obj.nodeType == obj.DOCUMENT_NODE
  }

  function isObject(obj) {
    return type(obj) == "object"
  }
  //����ͨ������������Ķ����new Object�Ķ��󷵻�true��new Objectʱ�������ķ���false
  //�ɲο�http://snandy.iteye.com/blog/663245

  function isPlainObject(obj) {
    return isObject(obj) && !isWindow(obj) && obj.__proto__ == Object.prototype
  }

  function isArray(value) {
    return value instanceof Array
  }
  //�����飬����nodeList�����ֻ������򵥵��жϣ������һ��������һ��ֵΪ���ݵ�length���ԣ���ͬ���᷵��true

  function likeArray(obj) {
    return typeof obj.length == 'number'
  }

  //��������Ĳ����е�null��undefined��ע��0==null,'' == nullΪfalse

  function compact(array) {
    return filter.call(array, function(item) {
      return item != null
    })
  }
  //���Ƶõ�һ������ĸ���

  function flatten(array) {
    return array.length > 0 ? $.fn.concat.apply([], array) : array
  }
  //���ַ���ת���շ�ʽ�ĸ�ʽ
  camelize = function(str) {
    return str.replace(/-+(.)?/g, function(match, chr) {
      return chr ? chr.toUpperCase() : ''
    })
  }
  //���ַ�����ʽ����-ƴ�ӵ���ʽ,һ��������ʽ�����ϣ�����border-width

  function dasherize(str) {
    return str.replace(/::/g, '/') //�������滻��/
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2') //�ڴ�Сд�ַ�֮�����_,��д��ǰ������AAAbb,�õ�AA_Abb
    .replace(/([a-z\d])([A-Z])/g, '$1_$2') //�ڴ�Сд�ַ�֮�����_,Сд��������ǰ������bbbAaa,�õ�bbb_Aaa
    .replace(/_/g, '-') //��_�滻��-
    .toLowerCase() //ת��Сд
  }
  //����ȥ�أ�������������������е�λ����ѭ��������ֵ����ͬ����˵����������������ͬ��ֵ
  uniq = function(array) {
    return filter.call(array, function(item, idx) {
      return array.indexOf(item) == idx
    })
  }

  //�������Ĳ�����������

  function classRE(name) {
    //classCache,��������
    return name in classCache ? classCache[name] : (classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'))
  }
  //����Ҫ����ʽֵ�������'px'��λ������cssNumber�����ָ������Щ

  function maybeAddPx(name, value) {
    return (typeof value == "number" && !cssNumber[dasherize(name)]) ? value + "px" : value
  }
  //��ȡ�ڵ��Ĭ��display����

  function defaultDisplay(nodeName) {
    var element, display
    if (!elementDisplay[nodeName]) { //�����ﲻ����
      element = document.createElement(nodeName)
      document.body.appendChild(element)
      display = getComputedStyle(element, '').getPropertyValue("display")
      element.parentNode.removeChild(element)
      display == "none" && (display = "block") //��display����noneʱ��������ֵΪblock,�㲻��ΪëҪ����
      elementDisplay[nodeName] = display //����Ԫ�ص�Ĭ��display����
    }
    return elementDisplay[nodeName]
  }
  //��ȡָ��Ԫ�ص��ӽڵ�(�������ı��ڵ�),Firefox��֧��children������ֻ��ͨ��ɸѡchildNodes

  function children(element) {
    return 'children' in element ? slice.call(element.children) : $.map(element.childNodes, function(node) {
      if (node.nodeType == 1) return node
    })
  }

  // `$.zepto.fragment` takes a html string and an optional tag name
  // to generate DOM nodes nodes from the given html string.
  // The generated DOM nodes are returned as an array.
  // This function can be overriden in plugins for example to make
  // it compatible with browsers that don't support the DOM fully.
  zepto.fragment = function(html, name, properties) {
    //������<div class="test"/>�滻��<div class="test"></div>,����һ���޸���
    if (html.replace) html = html.replace(tagExpanderRE, "<$1></$2>")
    //��nameȡ��ǩ��
    if (name === undefined) name = fragmentRE.test(html) && RegExp.$1
    //����������ǩ�����������tr,tbody,thead,tfoot,td,th����������ǩ��Ϊdiv
    if (!(name in containers)) name = '*'

    var nodes, dom, container = containers[name] //��������
    container.innerHTML = '' + html //��html����Ƭ�Ϸ�������
    //ȡ�������ӽڵ㣬������ֱ�Ӱ��ַ���ת��DOM�ڵ���
    dom = $.each(slice.call(container.childNodes), function() {
      container.removeChild(this) //���ɾ��
    })
    //���properties�Ƕ���, ���䵱������������ӽ����Ľڵ��������
    if (isPlainObject(properties)) {
      nodes = $(dom) //��domת��zepto����Ϊ�˷����������zepto�ϵķ���
      //����������������
      $.each(properties, function(key, value) {
        //������õ���'val', 'css', 'html', 'text', 'data', 'width', 'height', 'offset'�������zepto�����Ӧ�ķ���
        if (methodAttributes.indexOf(key) > -1) nodes[key](value)
        else nodes.attr(key, value)
      })
    }
    //���ؽ��ַ���ת�ɵ�DOM�ڵ������飬����'<li></li><li></li><li></li>'ת��[li,li,li]
    return dom
  }

  // `$.zepto.Z` swaps out the prototype of the given `dom` array
  // of nodes with `$.fn` and thus supplying all the Zepto functions
  // to the array. Note that `__proto__` is not supported on Internet
  // Explorer. This method can be overriden in plugins.
  zepto.Z = function(dom, selector) {
    dom = dom || []
    dom.__proto__ = $.fn //ͨ����dom����__proto__����ָ��$.fn���ﵽ�̳�$.fn�����з�����Ŀ��
    dom.selector = selector || ''
    return dom
  }

  // `$.zepto.isZ` should return `true` if the given object is a Zepto
  // collection. This method can be overriden in plugins.
  //�жϸ����Ĳ����Ƿ���Zepto��
  zepto.isZ = function(object) {
    return object instanceof zepto.Z
  }

  // `$.zepto.init` is Zepto's counterpart to jQuery's `$.fn.init` and
  // takes a CSS selector and an optional context (and handles various
  // special cases).
  // This method can be overriden in plugins.
  zepto.init = function(selector, context) {
    // If nothing given, return an empty Zepto collection
    if (!selector) return zepto.Z() //û�в��������ؿ�����
    //���selector�Ǹ�����������DOM ready��ʱ��ִ����
    else if (isFunction(selector)) return $(document).ready(selector)
    //���selector��һ��zepto.Zʵ������ֱ�ӷ������Լ�
    else if (zepto.isZ(selector)) return selector
    else {
      var dom
      //���selector��һ�����飬���������null,undefinedȥ��
      if (isArray(selector)) dom = compact(selector)
      //���selector�Ǹ�����ע��DOM�ڵ��typeofֵҲ��object�����������滹Ҫ�ٽ���һ���ж�
      else if (isObject(selector))
      //����������Ķ�����{}�� ��selector����copy��һ���¶��󣬲��������������
      //����Ǹö�����DOM����ֱ�ӷŵ�������
      dom = [isPlainObject(selector) ? $.extend({}, selector) : selector], selector = null
      //���selector��һ��HTML����Ƭ�ϣ�����ת����DOM�ڵ�
      else if (fragmentRE.test(selector)) dom = zepto.fragment(selector.trim(), RegExp.$1, context), selector = null
      //�������������context�������������в���selector����ʱ��selectorΪ��ͨ��CSSѡ����
      else if (context !== undefined) return $(context).find(selector)
      //���û�и��������ģ�����document�в���selector����ʱ��selectorΪ��ͨ��CSSѡ����
      else dom = zepto.qsa(document, selector)
      //��󽫲�ѯ���ת����zepto����
      return zepto.Z(dom, selector)
    }
  }

  // `$` will be the base `Zepto` object. When calling this
  // function just call `$.zepto.init, which makes the implementation
  // details of selecting nodes and creating Zepto collections
  // patchable in plugins.
  $ = function(selector, context) {
    return zepto.init(selector, context)
  }

  //��չ��deep��ʾ�Ƿ������չ

  function extend(target, source, deep) {
    for (key in source)
    //��������չ
    if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
      //���Ҫ��չ�������Ƕ�����target���Ӧ��key���Ƕ���
      if (isPlainObject(source[key]) && !isPlainObject(target[key])) target[key] = {}
      //���Ҫ��չ��������������target���Ӧ��key��������
      if (isArray(source[key]) && !isArray(target[key])) target[key] = []
      extend(target[key], source[key], deep)
    } else if (source[key] !== undefined) target[key] = source[key]
  }

  // Copy all but undefined properties from one or more
  // objects to the `target` object.
  $.extend = function(target) {
    var deep, args = slice.call(arguments, 1)
    if (typeof target == 'boolean') { //����һ������Ϊboolean���͵�ֵʱ����ʾ�Ƿ������չ
      deep = target
      target = args.shift() //targetȡ�ڶ�������
    }
    //��������Ĳ�����ȫ����չ��target��
    args.forEach(function(arg) {
      extend(target, arg, deep)
    })
    return target
  }

  // `$.zepto.qsa` is Zepto's CSS selector implementation which
  // uses `document.querySelectorAll` and optimizes for some special cases, like `#id`.
  // This method can be overriden in plugins.
  zepto.qsa = function(element, selector) {
    var found
    //��elementΪdocument,��selectorΪIDѡ����ʱ
    return (isDocument(element) && idSelectorRE.test(selector)) ?
    //ֱ�ӷ���document.getElementById,RegExp.$1ΪID��ֵ,��û���ҽڵ�ʱ����[]
    ((found = element.getElementById(RegExp.$1)) ? [found] : []) :
    //��element��ΪԪ�ؽڵ����documentʱ������[]
    (element.nodeType !== 1 && element.nodeType !== 9) ? [] :
    //���򽫻�ȡ���Ľ��ת�����鲢����
    slice.call(
    //���selector�Ǳ�ǩ��,ֱ�ӵ���getElementsByClassName
    classSelectorRE.test(selector) ? element.getElementsByClassName(RegExp.$1) :
    //���selector�Ǳ�ǩ��,ֱ�ӵ���getElementsByTagName
    tagSelectorRE.test(selector) ? element.getElementsByTagName(selector) :
    //�������querySelectorAll
    element.querySelectorAll(selector))
  }

  //�ڽ���н��й���

  function filtered(nodes, selector) {
    return selector === undefined ? $(nodes) : $(nodes).filter(selector)
  }
  //�ж�parent�Ƿ����node
  $.contains = function(parent, node) {
    return parent !== node && parent.contains(node)
  }

  //�����������������ȡ�źܵ�Ҫ�����ã�����argΪ��������ֵ�����
  //����ܶ�����Ԫ������ʱ�ĺ��������õ�

  function funcArg(context, arg, idx, payload) {
    return isFunction(arg) ? arg.call(context, idx, payload) : arg
  }

  function setAttribute(node, name, value) {
    //������õ�ֵΪnull��undefined,���൱��ɾ�������ԣ���������name����Ϊvalue
    value == null ? node.removeAttribute(name) : node.setAttribute(name, value)
  }

  // access className property while respecting SVGAnimatedString

  function className(node, value) {
    var klass = node.className,
      svg = klass && klass.baseVal !== undefined

    if (value === undefined) return svg ? klass.baseVal : klass
    svg ? (klass.baseVal = value) : (node.className = value)
  }

  // "true"  => true
  // "false" => false
  // "null"  => null
  // "42"    => 42
  // "42.5"  => 42.5
  // JSON    => parse if valid
  // String  => self

  function deserializeValue(value) {
    var num
    try {
      return value ? value == "true" || (value == "false" ? false : value == "null" ? null : !isNaN(num = Number(value)) ? num : /^[\[\{]/.test(value) ? $.parseJSON(value) : value) : value
    } catch (e) {
      return value
    }
  }

  $.type = type
  $.isFunction = isFunction
  $.isWindow = isWindow
  $.isArray = isArray
  $.isPlainObject = isPlainObject

  //�ն���
  $.isEmptyObject = function(obj) {
    var name
    for (name in obj) return false
    return true
  }

  //��ȡָ����ֵ�������е�λ��
  $.inArray = function(elem, array, i) {
    return emptyArray.indexOf.call(array, elem, i)
  }
  //���ַ���ת���շ�ʽ�ĸ�ʽ
  $.camelCase = camelize
  //ȥ�ַ���ͷβ�ո�
  $.trim = function(str) {
    return str.trim()
  }

  // plugin compatibility
  $.uuid = 0
  $.support = {}
  $.expr = {}

  //����elements����ÿ����¼����callback����ܴ������洦��������ֵ��Ϊnull��undefined�Ľ��
  //ע������û��ͳһ����for in,��Ϊ�˱����������Ĭ�����Ե�������������toString,valueOf
  $.map = function(elements, callback) {
    var value, values = [],
      i, key
      //������������������������nodeList
    if (likeArray(elements)) for (i = 0; i < elements.length; i++) {
      value = callback(elements[i], i)
      if (value != null) values.push(value)
    } else
    //����Ƕ���
    for (key in elements) {
      value = callback(elements[key], key)
      if (value != null) values.push(value)
    }
    return flatten(values)
  }

  //�������飬��ÿ��������Ϊcallback�������ģ������������Լ����ݵ��������д����������һ�����ݵĴ�������ȷ����false��
  //��ֹͣ������������elements
  $.each = function(elements, callback) {
    var i, key
    if (likeArray(elements)) {
      for (i = 0; i < elements.length; i++)
      if (callback.call(elements[i], i, elements[i]) === false) return elements
    } else {
      for (key in elements)
      if (callback.call(elements[key], key, elements[key]) === false) return elements
    }

    return elements
  }
  //����
  $.grep = function(elements, callback) {
    return filter.call(elements, callback)
  }

  if (window.JSON) $.parseJSON = JSON.parse

  // Populate the class2type map
  //���class2type��ֵ
  $.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
    class2type["[object " + name + "]"] = name.toLowerCase()
  })

  //���DOM��һЩ����
  // Define methods that will be available on all
  // Zepto collections
  $.fn = {
    // Because a collection acts like an array
    // copy over these useful array functions.
    forEach: emptyArray.forEach,
    reduce: emptyArray.reduce,
    push: emptyArray.push,
    sort: emptyArray.sort,
    indexOf: emptyArray.indexOf,
    concat: emptyArray.concat,

    // `map` and `slice` in the jQuery API work differently
    // from their array counterparts
    map: function(fn) {
      return $($.map(this, function(el, i) {
        return fn.call(el, i, el)
      }))
    },
    slice: function() {
      return $(slice.apply(this, arguments))
    },
    //DOM Ready
    ready: function(callback) {
      if (readyRE.test(document.readyState)) callback($)
      else document.addEventListener('DOMContentLoaded', function() {
        callback($)
      }, false)
      return this
    },
    //ȡ�����ж�Ӧָ��������ֵ�����idxС��0,��idx����idx+length,lengthΪ���ϵĳ���
    get: function(idx) {
      return idx === undefined ? slice.call(this) : this[idx >= 0 ? idx : idx + this.length]
    },
    //������ת��Ϊ����
    toArray: function() {
      return this.get()
    },
    //��ȡ���ϳ���
    size: function() {
      return this.length
    },
    //�����ϴ�dom��ɾ��
    remove: function() {
      return this.each(function() {
        if (this.parentNode != null) this.parentNode.removeChild(this)
      })
    },
    //�������ϣ��������е�ÿһ�����callback�н��д���ȥ�����Ϊfalse���ע�������callback�����ȷ����false
    //��ô�ͻ�ֹͣѭ����
    each: function(callback) {
      emptyArray.every.call(this, function(el, idx) {
        return callback.call(el, idx, el) !== false
      })
      return this
    },
    //���˼��ϣ����ش�����Ϊtrue�ļ�¼
    filter: function(selector) {
      //this.not(selector)ȡ����Ҫ�ų��ļ��ϣ��ڶ�����ȡ��(���ʱ��this.not�Ĳ�������һ��������)���õ���Ҫ�ļ���
      if (isFunction(selector)) return this.not(this.not(selector))
      //filter�ռ����ؽ��Ϊtrue�ļ�¼
      return $(filter.call(this, function(element) {
        return zepto.matches(element, selector) //��element��selectorƥ�䣬���ռ�
      }))
    },
    //����selector��ȡ���Ľ��׷�ӵ���ǰ������
    add: function(selector, context) {
      return $(uniq(this.concat($(selector, context)))) //׷�Ӳ�ȥ��
    },
    //���ؼ����еĵ�1����¼�Ƿ���selectorƥ��
    is: function(selector) {
      return this.length > 0 && zepto.matches(this[0], selector)
    },
    //�ų����������������ļ�¼�����ղ���Ϊ��cssѡ������function, dom ,nodeList
    not: function(selector) {
      var nodes = []
      //��selectorΪ����ʱ��safari�µ�typeof odeListҲ��function������������Ҫ�ټ�һ���ж�selector.call !== undefined
      if (isFunction(selector) && selector.call !== undefined) {
        this.each(function(idx) {
          //ע�������ռ�����selector.call(this,idx)���ؽ��Ϊfalse��ʱ���¼
          if (!selector.call(this, idx)) nodes.push(this)
        })
      } else {
        //��selectorΪ�ַ�����ʱ�򣬶Լ��Ͻ���ɸѡ��Ҳ����ɸѡ������������selector�ļ�¼
        var excludes = typeof selector == 'string' ? this.filter(selector) :
        //��selectorΪnodeListʱִ��slice.call(selector),ע�������isFunction(selector.item)��Ϊ���ų�selectorΪ��������
        //��selectorΪcssѡ������ִ��$(selector)
        (likeArray(selector) && isFunction(selector.item)) ? slice.call(selector) : $(selector)
        this.forEach(function(el) {
          //ɸѡ������excludes������ļ�¼���ﵽ�ų���Ŀ��
          if (excludes.indexOf(el) < 0) nodes.push(el)
        })
      }
      return $(nodes) //��������õ��Ľ�������飬������Ҫת��zepto�����Ա�̳�����������ʵ����д
    },
    /*
        ����node��string��Ϊ����������ǰ����ɸѡ������selector�ļ���
        isObject(selector)���жϲ����Ƿ���node����Ϊtypeof node == 'object'
        ������Ϊnodeʱ��ֻ��Ҫ�ж���ǰ�ǵ����Ƿ����node�ڵ㼴��
        ������Ϊstringʱ�����ڵ�ǰ��¼���ѯselector���������Ϊ0����Ϊfalse��filter�����ͻ���˵�������¼�����򱣴�ü�¼
    */
    has: function(selector) {
      return this.filter(function() {
        return isObject(selector) ? $.contains(this, selector) : $(this).find(selector).size()
      })
    },
    /* 
        ѡ�񼯺���ָ�������ļ�¼����idxΪ-1ʱ��ȡ���һ����¼
    */
    eq: function(idx) {
      return idx === -1 ? this.slice(idx) : this.slice(idx, +idx + 1)
    },
    /* 
        ȡ�����еĵ�һ����¼
    */
    first: function() {
      var el = this[0] //ȡ�����еĵ�һ����¼
      //��������еĵ�һ�����ݱ�����Ѿ���zepto������ֱ�ӷ��ر�������ת��zepto����
      //el && !isObject(el)������ȡ��һ���ж�el�Ƿ�Ϊ�ڵ���������Ϊ���el�ǽڵ㣬��ôisObject(el)�Ľ������true
      return el && !isObject(el) ? el : $(el)
    },
    /* 
        ȡ�����е����һ����¼
    */
    last: function() {
      var el = this[this.length - 1] //ȡ�����е����һ����¼
      //���elΪnode,��isObject(el)��Ϊtrue,��Ҫת��zepto����
      return el && !isObject(el) ? el : $(el)
    },
    /* 
        �ڵ�ǰ�����в���selector��selector�����Ǽ��ϣ�ѡ�������Լ��ڵ�
    */
    find: function(selector) {
      var result, $this = this
      //���selectorΪnode����zepto����ʱ
      if (typeof selector == 'object')
      //����selector��ɸѡ������Ϊ�����м�¼��selector
      result = $(selector).filter(function() {
        var node = this
        //���$.contains(parent, node)����true����emptyArray.someҲ�᷵��true,����filter�����¼������¼
        return emptyArray.some.call($this, function(parent) {
          return $.contains(parent, node)
        })
      })
      //���selector��cssѡ����
      //�����ǰ���ϳ���Ϊ1ʱ������zepto.qsa�������ת��zepto����
      else if (this.length == 1) result = $(zepto.qsa(this[0], selector))
      //������ȴ���1�������map����
      else result = this.map(function() {
        return zepto.qsa(this, selector)
      })
      return result
    },
    //ȡ�����е�һ��¼����������������ĸ���Ԫ��
    closest: function(selector, context) {
      var node = this[0],
        collection = false
      if (typeof selector == 'object') collection = $(selector)
      //��selector��node����zepto����ʱ�����node����collection������ʱ��Ҫȡnode.parentNode�����ж�
      //��selector���ַ���ѡ����ʱ�����node��selector��ƥ�䣬����Ҫȡnode.parentNode�����ж�
      while (node && !(collection ? collection.indexOf(node) >= 0 : zepto.matches(node, selector)))
      //��node ����context,document��ʱ��ȡnode.parentNode
      node = node !== context && !isDocument(node) && node.parentNode
      return $(node)
    },
    //ȡ�������и���Ԫ��
    parents: function(selector) {
      var ancestors = [],
        nodes = this
        //ͨ������nodes�õ����и�����ע����while��nodes�����¸�ֵ��
        //������������֮�����ڣ���ͣ�ڻ�ȡ�������ٱ���������ȡ�����ĸ���
        //Ȼ����ͨ��ȥ�أ��õ�������Ҫ�Ľ�������������ĸ���ʱ��nodes.length��Ϊ0��
      while (nodes.length > 0)
      //nodes�����¸�ֵΪ�ռ����ĸ�������
      nodes = $.map(nodes, function(node) {
        //����nodes���ռ����ϵĵ�һ�㸸��
        //ancestors.indexOf(node) < 0����ȥ�ظ�
        if ((node = node.parentNode) && !isDocument(node) && ancestors.indexOf(node) < 0) {
          ancestors.push(node) //�ռ��Ѿ���ȡ���ĸ���Ԫ�أ�����ȥ�ظ�
          return node
        }
      })
      //���滹ֻ��ȡ�������еĸ���Ԫ�أ����ﻹ��Ҫ�������ɸѡ�Ӷ��õ�������Ҫ�Ľ��
      return filtered(ancestors, selector)
    },
    //��ȡ���ϵĸ��ڵ�
    parent: function(selector) {
      return filtered(uniq(this.pluck('parentNode')), selector)
    },
    children: function(selector) {
      return filtered(this.map(function() {
        return children(this)
      }), selector)
    },
    contents: function() {
      return this.map(function() {
        return slice.call(this.childNodes)
      })
    },
    siblings: function(selector) {
      return filtered(this.map(function(i, el) {
        //�Ȼ�ȡ�ýڵ�ĸ��ڵ��е������ӽڵ㣬���ų�����
        return filter.call(children(el.parentNode), function(child) {
          return child !== el
        })
      }), selector)
    },
    empty: function() {
      return this.each(function() {
        this.innerHTML = ''
      })
    },
    //������������ȡ��ǰ���ϵ���ؼ���
    pluck: function(property) {
      return $.map(this, function(el) {
        return el[property]
      })
    },
    show: function() {
      return this.each(function() {
        //���Ԫ�ص�����display="none"����ʽ
        this.style.display == "none" && (this.style.display = null)
        //����ʽ����ĸ�Ԫ�ص�display��ʽΪnoneʱ����������displayΪĬ��ֵ
        if (getComputedStyle(this, '').getPropertyValue("display") == "none") this.style.display = defaultDisplay(this.nodeName) //defaultDisplay�ǻ�ȡԪ��Ĭ��display�ķ���
      })
    },
    replaceWith: function(newContent) {
      //��Ҫ�滻�����ݲ��뵽���滻������ǰ�棬Ȼ��ɾ�����滻������
      return this.before(newContent).remove()
    },
    wrap: function(structure) {
      var func = isFunction(structure)
      if (this[0] && !func)
      //���structure���ַ���������ת��DOM
      var dom = $(structure).get(0),
        //���structure���Ѿ�������ҳ���ϵĽڵ���߱�wrap�ļ�¼��ֻһ��������Ҫclone dom
        clone = dom.parentNode || this.length > 1

      return this.each(function(index) {
        $(this).wrapAll(
        func ? structure.call(this, index) : clone ? dom.cloneNode(true) : dom)
      })
    },
    wrapAll: function(structure) {
      if (this[0]) {
        //��Ҫ���������ݲ��뵽��һ����¼��ǰ�棬���Ǹ�structure��λΧ��
        $(this[0]).before(structure = $(structure))
        var children
        // drill down to the inmost element
        //ȡstructure��ĵ�һ���ӽڵ�������
        while ((children = structure.children()).length) structure = children.first()
        //����ǰ���ϲ��뵽�����Ľڵ���ﵽwrapAll��Ŀ��
        $(structure).append(this)
      }
      return this
    },
    //��ƥ��Ԫ������������һ��ṹ
    wrapInner: function(structure) {
      var func = isFunction(structure)
      return this.each(function(index) {
        //ԭ����ǻ�ȡ�ڵ�����ݣ�Ȼ����structure�����ݰ�������������ݲ����ڣ���ֱ�ӽ�structure append���ýڵ�
        var self = $(this),
          contents = self.contents(),
          dom = func ? structure.call(this, index) : structure
          contents.length ? contents.wrapAll(dom) : self.append(dom)
      })
    },
    unwrap: function() {
      //����Ԫ���滻������
      this.parent().each(function() {
        $(this).replaceWith($(this).children())
      })
      return this
    },
    //clone node
    clone: function() {
      return this.map(function() {
        return this.cloneNode(true)
      })
    },
    //���ؼ���
    hide: function() {
      return this.css("display", "none")
    },
    toggle: function(setting) {
      return this.each(function() {
        var el = $(this);
        /* 
            ���settingȡ�����þ��ǿ�����ʾ�����أ������л���������ֵΪtrueʱ��һֱ��ʾ��falseʱ��һֱ����
            ����ط����жϿ���ȥ�е��ƣ���ʵҲ�򵥣���˼��˵��������toogle����ʱ������Ԫ�ص�display�Ƿ����none��������ʾ��������Ԫ��
            ����toogle��������û���л�Ч���ˣ�ֻ�Ǽ򵥵ĸ��ݲ���ֵ��������ʾ�����ء��������true,�൱��show������false���൱��hide����
        */
        (setting === undefined ? el.css("display") == "none" : setting) ? el.show() : el.hide()
      })
    },
    prev: function(selector) {
      return $(this.pluck('previousElementSibling')).filter(selector || '*')
    },
    next: function(selector) {
      return $(this.pluck('nextElementSibling')).filter(selector || '*')
    },
    //���в���ʱ�����ü���ÿ����¼��HTML��û�в���ʱ����Ϊ��ȡ���ϵ�һ����¼��HTML��������ϵĳ���Ϊ0,�򷵻�null
    html: function(html) {
      return html === undefined ?
      //����html������ʱ����ȡ�����е�һ����¼��html
      (this.length > 0 ? this[0].innerHTML : null) :
      //����������ϣ�����ÿ����¼��html
      this.each(function(idx) {
        //��¼ԭʼ��innerHTMl
        var originHtml = this.innerHTML
        //�������html���ַ���ֱ�Ӳ��뵽��¼�У�
        //����Ǻ������򽫵�ǰ��¼��Ϊ�����ģ����øú������Ҵ���ü�¼��������ԭʼinnerHTML��Ϊ����
        $(this).empty().append(funcArg(this, html, idx, originHtml))
      })
    },
    text: function(text) {
      //���������text��������Ϊ��ȡ���ܣ����ϳ��ȴ���0ʱ��ȡ��һ�����ݵ�textContent�����򷵻�null,
      //�������text��������Ϊ���ϵ�ÿһ����������textContentΪtext
      return text === undefined ? (this.length > 0 ? this[0].textContent : null) : this.each(function() {
        this.textContent = text
      })
    },
    attr: function(name, value) {
      var result
      //��ֻ��name��Ϊ�ַ���ʱ����ʾ��ȡ��һ����¼������
      return (typeof name == 'string' && value === undefined) ?
      //����û�м�¼���߼��ϵ�Ԫ�ز���node���ͣ�����undefined
      (this.length == 0 || this[0].nodeType !== 1 ? undefined :
      //���ȡ����input��value
      (name == 'value' && this[0].nodeName == 'INPUT') ? this.val() :
      //ע��ֱ�Ӷ�����node�ϵ����ԣ��ڱ�׼�������ie9,10����getAttributeȡ����,�õ��Ľ����null
      //����div.aa = 10,��div.getAttribute('aa')�õ�����null,��Ҫ��div.aa����div['aa']������ȡ
      (!(result = this[0].getAttribute(name)) && name in this[0]) ? this[0][name] : result) :
      this.each(function(idx) {
        if (this.nodeType !== 1) return
        //���name��һ��������{'id':'test','value':11},���������������
        if (isObject(name)) for (key in name) setAttribute(this, key, name[key])
        //���nameֻ��һ����ͨ�������ַ�������funcArg������value��ֵ����function��������շ���һ������ֵ
        //���funcArg�������ص���undefined����null�����൱��ɾ��Ԫ�ص�����
        else setAttribute(this, name, funcArg(this, value, idx, this.getAttribute(name)))
      })
    },
    removeAttr: function(name) {
      return this.each(function() {
        this.nodeType === 1 && setAttribute(this, name)//setAttribute�ĵ���������Ϊnullʱ��Ч����ɾ��name����
      })
    },
    //��ȡ��һ�����ݵ�ָ����name���Ի��߸�ÿ����������Զ������ԣ�ע���setAttribute������
    prop: function(name, value) {
      //û�и���valueʱ��Ϊ��ȡ������value���ÿһ��������ӣ�value����ΪֵҲ������һ������ֵ�ĺ���
      return (value === undefined) ? (this[0] && this[0][name]) : this.each(function(idx) {
        this[name] = funcArg(this, value, idx, this[name])
      })
    },
    data: function(name, value) {
      //ͨ������attr������ʵ�ֻ�ȡ�����õ�Ч����ע��attr�������value���ڵ�ʱ�򣬷��ص��Ǽ��ϱ�����������ڣ����Ƿ��ػ�ȡ��ֵ
      var data = this.attr('data-' + dasherize(name), value)
      return data !== null ? deserializeValue(data) : undefined
    },
    val: function(value) {
      return (value === undefined) ?
      //����Ƕ�ѡ��select���򷵻�һ��������ѡ�е�option��ֵ������
      (this[0] && (this[0].multiple ? $(this[0]).find('option').filter(function(o) {
        return this.selected
      }).pluck('value') : this[0].value)) : this.each(function(idx) {
        this.value = funcArg(this, value, idx, this.value)
      })
    },
    offset: function(coordinates) {
      if (coordinates) return this.each(function(index) {
        var $this = $(this),
          //coordinatesΪ{}ʱֱ�ӷ��أ�Ϊ����ʱ���ش�������coords
          coords = funcArg(this, coordinates, index, $this.offset()),
          //ȡ������offset
          parentOffset = $this.offsetParent().offset(),
          //���������֮��Ĳ�ó���ƫ����  
          props = {
            top: coords.top - parentOffset.top,
            left: coords.left - parentOffset.left
          }
          //ע��Ԫ�ص�positionΪstaticʱ������top,left����Ч��
        if ($this.css('position') == 'static') props['position'] = 'relative'
        $this.css(props)
      })
      //ȡ��һ����¼��offset,����offsetTop,offsetLeft,offsetWidth,offsetHeight
      if (this.length == 0) return null
      var obj = this[0].getBoundingClientRect()
      //window.pageYOffset��������Math.max(document.documentElement.scrollTop||document.body.scrollTop)
      return {
        left: obj.left + window.pageXOffset,
        top: obj.top + window.pageYOffset,
        width: Math.round(obj.width),
        height: Math.round(obj.height)
      }
    },
    css: function(property, value) {
      //��ȡָ������ʽ
      if (arguments.length < 2 && typeof property == 'string') return this[0] && (this[0].style[camelize(property)] || getComputedStyle(this[0], '').getPropertyValue(property))
      //������ʽ
      var css = ''
      if (type(property) == 'string') {
        if (!value && value !== 0) //��value��ֵΪ����Ŀ���ת��false��ֵʱ��(null,undefined)��ɾ��property��ʽ
        this.each(function() {
          //style.removeProperty �Ƴ�ָ����CSS��ʽ��(IE��֧��DOM��style����)
          this.style.removeProperty(dasherize(property))
        })
        else css = dasherize(property) + ":" + maybeAddPx(property, value)
      } else {
        //��property�Ƕ���ʱ
        for (key in property)
        if (!property[key] && property[key] !== 0)
        //��property[key]��ֵΪ����Ŀ���ת��false��ֵʱ��ɾ��key��ʽ
        this.each(function() {
          this.style.removeProperty(dasherize(key))
        })
        else css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';'
      }
      //����
      return this.each(function() {
        this.style.cssText += ';' + css
      })
    },
    index: function(element) {
      //�����$(element)[0]��Ϊ�˽��ַ���ת��node,��Ϊthis�Ǹ�����node������
      //����ָ��elementʱ��ȡ�����е�һ����¼���丸�ڵ��λ��
      //this.parent().children().indexOf(this[0])���������ȡ��һ��¼��parent().children().indexOf(this)��ͬ
      return element ? this.indexOf($(element)[0]) : this.parent().children().indexOf(this[0])
    },
    hasClass: function(name) {
      return emptyArray.some.call(this, function(el) {
        //ע�������this��classRE(name)���ɵ�����
        return this.test(className(el))
      }, classRE(name))
    },
    addClass: function(name) {
      return this.each(function(idx) {
        classList = []
        var cls = className(this),
          newName = funcArg(this, name, idx, cls)
          //����ͬʱ������������ÿո�ֿ�
          newName.split(/\s+/g).forEach(function(klass) {
            if (!$(this).hasClass(klass)) classList.push(klass)
          }, this)
          classList.length && className(this, cls + (cls ? " " : "") + classList.join(" "))
      })
    },
    removeClass: function(name) {
      return this.each(function(idx) {
        if (name === undefined) return className(this, '')
        classList = className(this)
        funcArg(this, name, idx, classList).split(/\s+/g).forEach(function(klass) {
          classList = classList.replace(classRE(klass), " ")
        })
        className(this, classList.trim())
      })
    },
    toggleClass: function(name, when) {
      return this.each(function(idx) {
        var $this = $(this),
          names = funcArg(this, name, idx, className(this))
          names.split(/\s+/g).forEach(function(klass) {
            (when === undefined ? !$this.hasClass(klass) : when) ? $this.addClass(klass) : $this.removeClass(klass)
          })
      })
    },
    scrollTop: function() {
      if (!this.length) return
      return ('scrollTop' in this[0]) ? this[0].scrollTop : this[0].scrollY
    },
    position: function() {
      if (!this.length) return

      var elem = this[0],
        // Get *real* offsetParent
        offsetParent = this.offsetParent(),
        // Get correct offsets
        offset = this.offset(),
        parentOffset = rootNodeRE.test(offsetParent[0].nodeName) ? {
          top: 0,
          left: 0
        } : offsetParent.offset()

        // Subtract element margins
        // note: when an element has margin: auto the offsetLeft and marginLeft
        // are the same in Safari causing offset.left to incorrectly be 0
        offset.top -= parseFloat($(elem).css('margin-top')) || 0
        offset.left -= parseFloat($(elem).css('margin-left')) || 0

        // Add offsetParent borders
        parentOffset.top += parseFloat($(offsetParent[0]).css('border-top-width')) || 0
        parentOffset.left += parseFloat($(offsetParent[0]).css('border-left-width')) || 0

        // Subtract the two offsets
      return {
        top: offset.top - parentOffset.top,
        left: offset.left - parentOffset.left
      }
    },
    offsetParent: function() {
      return this.map(function() {
        var parent = this.offsetParent || document.body
        while (parent && !rootNodeRE.test(parent.nodeName) && $(parent).css("position") == "static")
        parent = parent.offsetParent
        return parent
      })
    }
  }

  // for now
  $.fn.detach = $.fn.remove

  // Generate the `width` and `height` functions
  ;
  ['width', 'height'].forEach(function(dimension) {
    $.fn[dimension] = function(value) {
      var offset, el = this[0],
        //��width,hegihtת��Width,Height������ȡwindow����document��width��height
        Dimension = dimension.replace(/./, function(m) {
          return m[0].toUpperCase()
        })
        //û�в���Ϊ��ȡ����ȡwindow��width��height��innerWidth,innerHeight
      if (value === undefined) return isWindow(el) ? el['inner' + Dimension] :
      //��ȡdocument��width��heightʱ����offsetWidth,offsetHeight
      isDocument(el) ? el.documentElement['offset' + Dimension] : (offset = this.offset()) && offset[dimension]
      else return this.each(function(idx) {
        el = $(this)
        el.css(dimension, funcArg(this, value, idx, el[dimension]()))
      })
    }
  })

  function traverseNode(node, fun) {
    fun(node)
    for (var key in node.childNodes) traverseNode(node.childNodes[key], fun)
  }

  // Generate the `after`, `prepend`, `before`, `append`,
  // `insertAfter`, `insertBefore`, `appendTo`, and `prependTo` methods.
  adjacencyOperators.forEach(function(operator, operatorIndex) {
    var inside = operatorIndex % 2 //=> prepend, append

    $.fn[operator] = function() {
      // arguments can be nodes, arrays of nodes, Zepto objects and HTML strings
      var argType, nodes = $.map(arguments, function(arg) {
        argType = type(arg)
        return argType == "object" || argType == "array" || arg == null ? arg : zepto.fragment(arg)
      }),
        parent, copyByClone = this.length > 1 //������ϵĳ��ȴ��ڼ�������Ҫclone������Ľڵ�
      if (nodes.length < 1) return this

      return this.each(function(_, target) {
        parent = inside ? target : target.parentNode

        //ͨ���ı�target��after��prepend��append����ת��before������insertBefore�ĵڶ�������Ϊnullʱ����appendChild����
        target = operatorIndex == 0 ? target.nextSibling : operatorIndex == 1 ? target.firstChild : operatorIndex == 2 ? target : null

        nodes.forEach(function(node) {
          if (copyByClone) node = node.cloneNode(true)
          else if (!parent) return $(node).remove()

          //����ڵ�����������Ľڵ���SCRIPT����ִ����������ݲ���window��Ϊ������
          traverseNode(parent.insertBefore(node, target), function(el) {
            if (el.nodeName != null && el.nodeName.toUpperCase() === 'SCRIPT' && (!el.type || el.type === 'text/javascript') && !el.src) window['eval'].call(window, el.innerHTML)
          })
        })
      })
    }

    // after    => insertAfter
    // prepend  => prependTo
    // before   => insertBefore
    // append   => appendTo
    $.fn[inside ? operator + 'To' : 'insert' + (operatorIndex ? 'Before' : 'After')] = function(html) {
      $(html)[operator](this)
      return this
    }
  })

  zepto.Z.prototype = $.fn

  // Export internal API functions in the `$.zepto` namespace
  zepto.uniq = uniq
  zepto.deserializeValue = deserializeValue
  $.zepto = zepto

  return $
})();

window.Zepto = Zepto;
'$' in window || (window.$ = Zepto);

;(function($) {
  function detect(ua) {
    var os = this.os = {}, browser = this.browser = {},
    webkit = ua.match(/WebKit\/([\d.]+)/),
      android = ua.match(/(Android)\s+([\d.]+)/),
      ipad = ua.match(/(iPad).*OS\s([\d_]+)/),
      iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/),
      webos = ua.match(/(webOS|hpwOS)[\s\/]([\d.]+)/),
      touchpad = webos && ua.match(/TouchPad/),
      kindle = ua.match(/Kindle\/([\d.]+)/),
      silk = ua.match(/Silk\/([\d._]+)/),
      blackberry = ua.match(/(BlackBerry).*Version\/([\d.]+)/),
      bb10 = ua.match(/(BB10).*Version\/([\d.]+)/),
      rimtabletos = ua.match(/(RIM\sTablet\sOS)\s([\d.]+)/),
      playbook = ua.match(/PlayBook/),
      chrome = ua.match(/Chrome\/([\d.]+)/) || ua.match(/CriOS\/([\d.]+)/),
      firefox = ua.match(/Firefox\/([\d.]+)/)

      // Todo: clean this up with a better OS/browser seperation:
      // - discern (more) between multiple browsers on android
      // - decide if kindle fire in silk mode is android or not
      // - Firefox on Android doesn't specify the Android version
      // - possibly devide in os, device and browser hashes

    if (browser.webkit = !! webkit) browser.version = webkit[1]

    if (android) os.android = true, os.version = android[2]
    if (iphone) os.ios = os.iphone = true, os.version = iphone[2].replace(/_/g, '.')
    if (ipad) os.ios = os.ipad = true, os.version = ipad[2].replace(/_/g, '.')
    if (webos) os.webos = true, os.version = webos[2]
    if (touchpad) os.touchpad = true
    if (blackberry) os.blackberry = true, os.version = blackberry[2]
    if (bb10) os.bb10 = true, os.version = bb10[2]
    if (rimtabletos) os.rimtabletos = true, os.version = rimtabletos[2]
    if (playbook) browser.playbook = true
    if (kindle) os.kindle = true, os.version = kindle[1]
    if (silk) browser.silk = true, browser.version = silk[1]
    if (!silk && os.android && ua.match(/Kindle Fire/)) browser.silk = true
    if (chrome) browser.chrome = true, browser.version = chrome[1]
    if (firefox) browser.firefox = true, browser.version = firefox[1]

    os.tablet = !! (ipad || playbook || (android && !ua.match(/Mobile/)) || (firefox && ua.match(/Tablet/)))
    os.phone = !! (!os.tablet && (android || iphone || webos || blackberry || bb10 || (chrome && ua.match(/Android/)) || (chrome && ua.match(/CriOS\/([\d.]+)/)) || (firefox && ua.match(/Mobile/))))
  }

  detect.call($, navigator.userAgent)
  // make available to unit tests
  $.__detect = detect

})(Zepto)

/* 
�¼�������
 */
;
(function($) {
  var $$ = $.zepto.qsa,
    handlers = {}, _zid = 1,
    specialEvents = {},
    hover = {
      mouseenter: 'mouseover',
      mouseleave: 'mouseout'
    }

  specialEvents.click = specialEvents.mousedown = specialEvents.mouseup = specialEvents.mousemove = 'MouseEvents'

  //ȡelement��Ψһ��ʾ�������û�У�������һ��������

  function zid(element) {
    return element._zid || (element._zid = _zid++)
  }
  //���Ұ���Ԫ���ϵ�ָ�����͵��¼�����������

  function findHandlers(element, event, fn, selector) {
    event = parse(event)
    if (event.ns) var matcher = matcherFor(event.ns)
    return (handlers[zid(element)] || []).filter(function(handler) {
      return handler && (!event.e || handler.e == event.e) //�ж��¼������Ƿ���ͬ
      &&
      (!event.ns || matcher.test(handler.ns)) //�ж��¼������ռ��Ƿ���ͬ
      //ע�⺯�����������͵�����zid(handler.fn)�������Ƿ���handler.fn�ı�ʾ�������û�У���������һ����
      //�������fn��handler.fn���õ���ͬһ����������ôfn��Ӧ��Ҳ����ͬ�ı�ʾ����
      //�������ͨ����һ�����ж����������Ƿ����õ�ͬһ������
      &&
      (!fn || zid(handler.fn) === zid(fn)) && (!selector || handler.sel == selector)
    })
  }
  //�����¼����ͣ�����һ�������¼����ƺ��¼������ռ�Ķ���

  function parse(event) {
    var parts = ('' + event).split('.')
    return {
      e: parts[0],
      ns: parts.slice(1).sort().join(' ')
    }
  }
  //���������ռ������

  function matcherFor(ns) {
    return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)')
  }
  //����events

  function eachEvent(events, fn, iterator) {
    if ($.type(events) != "string") $.each(events, iterator)
    else events.split(/\s/).forEach(function(type) {
      iterator(type, fn)
    })
  }
  //ͨ����focus��blur�¼�����Ϊ�������ﵽ�¼�ð�ݵ�Ŀ��

  function eventCapture(handler, captureSetting) {
    return handler.del && (handler.e == 'focus' || handler.e == 'blur') || !! captureSetting
  }

  //�޸���֧��mouseenter��mouseleave�����

  function realEvent(type) {
    return hover[type] || type
  }

  //��Ԫ�ذ󶨼����¼�,��ͬʱ�󶨶���¼����ͣ���['click','mouseover','mouseout'],Ҳ������'click mouseover mouseout'

  function add(element, events, fn, selector, getDelegate, capture) {
    var id = zid(element),
      set = (handlers[id] || (handlers[id] = [])) //Ԫ�����Ѿ��󶨵������¼�������
      eachEvent(events, fn, function(event, fn) {
        var handler = parse(event)
        //����fn,����Ϊ�˴���mouseenter, mouseleaveʱ����fn�������޸�
        handler.fn = fn
        handler.sel = selector
        // ģ�� mouseenter, mouseleave
        if (handler.e in hover) fn = function(e) {
          /* 
            relatedTargetΪ�¼���ض���ֻ����mouseover��mouseout�¼�ʱ����ֵ
            mouseoverʱ��ʾ��������Ƴ����Ǹ�����mouseoutʱ��ʾ�������������Ǹ�����
            ��related�����ڣ���ʾ�¼�����mouseover����mouseout,mouseoverʱ!$.contains(this, related)����ض������¼�������
            ��related !== this��ض������¼�����ʱ����ʾ����Ѿ����¼������ⲿ���뵽�˶��������ʱ����Ҫִ�д�������
            �������¼����������뵽�ӽڵ��ʱ��related�͵���this�ˣ���!$.contains(this, related)Ҳ�����������ʱ���ǲ���Ҫִ�д�������
        */
          var related = e.relatedTarget
          if (!related || (related !== this && !$.contains(this, related))) return handler.fn.apply(this, arguments)
        }
        //�¼�ί��
        handler.del = getDelegate && getDelegate(fn, event)
        var callback = handler.del || fn
        handler.proxy = function(e) {
          var result = callback.apply(element, [e].concat(e.data))
          //���¼�����������falseʱ����ֹĬ�ϲ�����ð��
          if (result === false) e.preventDefault(), e.stopPropagation()
          return result
        }
        //���ô��������ں������е�λ��
        handler.i = set.length
        //���������뺯������
        set.push(handler)
        element.addEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
      })
  }
  //ɾ������Ԫ���ϵ�ָ�����͵��¼�������������ͬʱɾ�������¼�����ָ���ĺ�������������߻��ո���ַ������ɣ�ͬadd

  function remove(element, events, fn, selector, capture) {
    var id = zid(element)
    eachEvent(events || '', fn, function(event, fn) {
      findHandlers(element, event, fn, selector).forEach(function(handler) {
        delete handlers[id][handler.i]
        element.removeEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
      })
    })
  }

  $.event = {
    add: add,
    remove: remove
  }

  //���ô���
  $.proxy = function(fn, context) {
    if ($.isFunction(fn)) {
      //���fn�Ǻ�����������һ���µĺ�������context��Ϊ�����ĵ���fn
      var proxyFn = function() {
        return fn.apply(context, arguments)
      }
      //����fn��ʾ��
      proxyFn._zid = zid(fn)
      return proxyFn
    } else if (typeof context == 'string') {
      return $.proxy(fn[context], fn)
    } else {
      throw new TypeError("expected function")
    }
  }

  $.fn.bind = function(event, callback) {
    return this.each(function() {
      add(this, event, callback)
    })
  }
  $.fn.unbind = function(event, callback) {
    return this.each(function() {
      remove(this, event, callback)
    })
  }
  //��һ�����¼���������
  $.fn.one = function(event, callback) {
    return this.each(function(i, element) {
      //��Ӻ�����Ȼ���ڻص���������ɾ���󶨡��ﵽһ�����¼���Ŀ��
      add(this, event, callback, null, function(fn, type) {
        return function() {
          var result = fn.apply(element, arguments) //����ִ�а󶨵Ļص�
          remove(element, type, fn) //ɾ������İ�
          return result
        }
      })
    })
  }

  var returnTrue = function() {
    return true
  },
  returnFalse = function() {
    return false
  },
  ignoreProperties = /^([A-Z]|layer[XY]$)/,
    eventMethods = {
      preventDefault: 'isDefaultPrevented', //�Ƿ���ù�preventDefault����
      //ȡ��ִ���������¼���������ȡ���¼�ð��.���ͬһ���¼����˶���¼�������, ������һ���¼��������е��ô˷����󽫲�����������������¼�������.
      stopImmediatePropagation: 'isImmediatePropagationStopped', //�Ƿ���ù�stopImmediatePropagation������
      stopPropagation: 'isPropagationStopped' //�Ƿ���ù�stopPropagation����
    }
    //�����¼�����

    function createProxy(event) {
      var key, proxy = {
        originalEvent: event
      } //����ԭʼevent
      for (key in event)
      if (!ignoreProperties.test(key) && event[key] !== undefined) proxy[key] = event[key] //����event������proxy

      //��preventDefault��stopImmediatePropagatio,stopPropagation�������嵽proxy��
      $.each(eventMethods, function(name, predicate) {
        proxy[name] = function() {
          this[predicate] = returnTrue
          return event[name].apply(event, arguments)
        }
        proxy[predicate] = returnFalse
      })
      return proxy
    }

    // emulates the 'defaultPrevented' property for browsers that have none
    //event.defaultPrevented����һ������ֵ,������ǰ�¼���Ĭ�϶����Ƿ�ȡ��,Ҳ�����Ƿ�ִ���� event.preventDefault()����.

    function fix(event) {
      if (!('defaultPrevented' in event)) {
        event.defaultPrevented = false //��ʼֵfalse
        var prevent = event.preventDefault // ����Ĭ��preventDefault
        event.preventDefault = function() { //��дpreventDefault
          this.defaultPrevented = true
          prevent.call(this)
        }
      }
    }
    //�¼�ί��
    $.fn.delegate = function(selector, event, callback) {
      return this.each(function(i, element) {
        add(element, event, callback, selector, function(fn) {
          return function(e) {
            //����¼�������element���Ԫ��,ȡ��selector��ƥ���
            var evt, match = $(e.target).closest(selector, element).get(0)
            if (match) {
              //evt����һ��ӵ��preventDefault��stopImmediatePropagatio,stopPropagation������currentTarge,liveFiredn���ԵĶ���,��Ҳ��e��Ĭ������
              evt = $.extend(createProxy(e), {
                currentTarget: match,
                liveFired: element
              })
              return fn.apply(match, [evt].concat([].slice.call(arguments, 1)))
            }
          }
        })
      })
    }
    //ȡ���¼�ί��
    $.fn.undelegate = function(selector, event, callback) {
      return this.each(function() {
        remove(this, event, callback, selector)
      })
    }

  $.fn.live = function(event, callback) {
    $(document.body).delegate(this.selector, event, callback)
    return this
  }
  $.fn.die = function(event, callback) {
    $(document.body).undelegate(this.selector, event, callback)
    return this
  }

  //onҲ��live���¼�ί�е�Ч�������Կ���ֻ��on�����¼�
  $.fn.on = function(event, selector, callback) {
    return !selector || $.isFunction(selector) ? this.bind(event, selector || callback) : this.delegate(selector, event, callback)
  }
  $.fn.off = function(event, selector, callback) {
    return !selector || $.isFunction(selector) ? this.unbind(event, selector || callback) : this.undelegate(selector, event, callback)
  }
  //���������¼�
  $.fn.trigger = function(event, data) {
    if (typeof event == 'string' || $.isPlainObject(event)) event = $.Event(event)
    fix(event)
    event.data = data
    return this.each(function() {
      // items in the collection might not be DOM elements
      // (todo: possibly support events on plain old objects)
      if ('dispatchEvent' in this) this.dispatchEvent(event)
    })
  }

  // triggers event handlers on current element just as if an event occurred,
  // doesn't trigger an actual event, doesn't bubble
  //����Ԫ���ϰ󶨵�ָ�����͵��¼������ǲ�ð��
  $.fn.triggerHandler = function(event, data) {
    var e, result
    this.each(function(i, element) {
      e = createProxy(typeof event == 'string' ? $.Event(event) : event)
      e.data = data
      e.target = element
      //����Ԫ���ϰ󶨵�ָ�����͵��¼�������������˳��ִ�У����ִ�й�stopImmediatePropagation��
      //��ôe.isImmediatePropagationStopped()�ͻ᷵��true,����㺯������false
      //ע��each��Ļص�����ָ������falseʱ��������ѭ���������ʹﵽ��ִֹͣ�л��溯����Ŀ��
      $.each(findHandlers(element, event.type || event), function(i, handler) {
        result = handler.proxy(e)
        if (e.isImmediatePropagationStopped()) return false
      })
    })
    return result
  }

  // shortcut methods for `.bind(event, fn)` for each event type
  ;
  ('focusin focusout load resize scroll unload click dblclick ' +
    'mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave ' +
    'change select keydown keypress keyup error').split(' ').forEach(function(event) {
    $.fn[event] = function(callback) {
      return callback ?
      //�����callback�ص�������Ϊ���ǰ�
      this.bind(event, callback) :
      //���û��callback�ص�����������������
      this.trigger(event)
    }
  })

  ;
  ['focus', 'blur'].forEach(function(name) {
    $.fn[name] = function(callback) {
      if (callback) this.bind(name, callback)
      else this.each(function() {
        try {
          this[name]()
        } catch (e) {}
      })
      return this
    }
  })

  //���ݲ�������һ��event����
  $.Event = function(type, props) {
    //��type�Ǹ�����ʱ
    if (typeof type != 'string') props = type, type = props.type
    //����һ��event���������click,mouseover,mouseoutʱ����������MouseEvent,bubblesΪ�Ƿ�ð��
    var event = document.createEvent(specialEvents[type] || 'Events'),
      bubbles = true
      //ȷ��bubbles��ֵΪtrue��false,����props������������չ���´�����event������
    if (props) for (var name in props)(name == 'bubbles') ? (bubbles = !! props[name]) : (event[name] = props[name])
    //��ʼ��event����typeΪ�¼����ͣ���click��bubblesΪ�Ƿ�ð�ݣ�������������ʾ�Ƿ������preventDefault������ȡ��Ĭ�ϲ���
    event.initEvent(type, bubbles, true, null, null, null, null, null, null, null, null, null, null, null, null)
    //���isDefaultPrevented������event.defaultPrevented����һ������ֵ,������ǰ�¼���Ĭ�϶����Ƿ�ȡ��,Ҳ�����Ƿ�ִ���� event.preventDefault()����.
    event.isDefaultPrevented = function() {
      return this.defaultPrevented
    }
    return event
  }

})(Zepto)

/**
  Ajax������
**/
;
(function($) {
  var jsonpID = 0,
    document = window.document,
    key,
    name,
    rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    scriptTypeRE = /^(?:text|application)\/javascript/i,
    xmlTypeRE = /^(?:text|application)\/xml/i,
    jsonType = 'application/json',
    htmlType = 'text/html',
    blankRE = /^\s*$/

    // trigger a custom event and return false if it was cancelled

    function triggerAndReturn(context, eventName, data) {
      var event = $.Event(eventName)
      $(context).trigger(event, data)
      return !event.defaultPrevented
    }

    // trigger an Ajax "global" event
    //���� ajax��ȫ���¼�

    function triggerGlobal(settings, context, eventName, data) {
      if (settings.global) return triggerAndReturn(context || document, eventName, data)
    }

    // Number of active Ajax requests
    $.active = 0

    //settings.globalΪtrueʱ��ʾ��Ҫ����ȫ��ajax�¼�
    //ע�������$.active++ === 0������������жϿ�ʼ����Ϊֻ��$.active����0ʱ$.active++ === 0�ų���

    function ajaxStart(settings) {
      if (settings.global && $.active++ === 0) triggerGlobal(settings, null, 'ajaxStart')
    }
    //ע������� !(--$.active)ͬ���������ͬ����--$.activeΪ0�����ʾ$.active��ֵΪ1�����������жϽ�����Ҳ������˼

    function ajaxStop(settings) {
      if (settings.global && !(--$.active)) triggerGlobal(settings, null, 'ajaxStop')
    }

    // triggers an extra global event "ajaxBeforeSend" that's like "ajaxSend" but cancelable
    //����ȫ��ajaxBeforeSend�¼����������false,��ȡ���˴�����

    function ajaxBeforeSend(xhr, settings) {
      var context = settings.context
      if (settings.beforeSend.call(context, xhr, settings) === false || triggerGlobal(settings, context, 'ajaxBeforeSend', [xhr, settings]) === false) return false

      triggerGlobal(settings, context, 'ajaxSend', [xhr, settings])
    }

    function ajaxSuccess(data, xhr, settings) {
      var context = settings.context,
        status = 'success'
      settings.success.call(context, data, status, xhr)
      triggerGlobal(settings, context, 'ajaxSuccess', [xhr, settings, data])
      ajaxComplete(status, xhr, settings)
    }
    // type: "timeout", "error", "abort", "parsererror"

    function ajaxError(error, type, xhr, settings) {
      var context = settings.context
      settings.error.call(context, xhr, type, error)
      triggerGlobal(settings, context, 'ajaxError', [xhr, settings, error])
      ajaxComplete(type, xhr, settings)
    }
    // status: "success", "notmodified", "error", "timeout", "abort", "parsererror"

    function ajaxComplete(status, xhr, settings) {
      var context = settings.context
      settings.complete.call(context, xhr, status)
      triggerGlobal(settings, context, 'ajaxComplete', [xhr, settings])
      ajaxStop(settings)
    }

    // Empty function, used as default callback

    function empty() {}
    //�ɲο�http://zh.wikipedia.org/zh-cn/JSONP
    $.ajaxJSONP = function(options) {
      if (!('type' in options)) return $.ajax(options)

      var callbackName = 'jsonp' + (++jsonpID), //�����ص�������
        script = document.createElement('script'),
        //js�ļ��������
        cleanup = function() {
          clearTimeout(abortTimeout) //��������timeout�¼�����
          $(script).remove() //�Ƴ�������script��ǩ����Ϊ���ļ���JS�����Ѿ���������
          delete window[callbackName] //�����ָ���Ļص�����
        },
        //ȡ������
        abort = function(type) {
          cleanup()
          // In case of manual abort or timeout, keep an empty function as callback
          // so that the SCRIPT tag that eventually loads won't result in an error.
          //����ͨ�����ص��������¸�ֵΪ�պ������ﵽ������ֹ����JS��Ŀ�ģ�ʵ���ϸ�script��ǩ������src���Ժ�������Ѿ������ˣ����Ҳ����ж�
          if (!type || type == 'timeout') window[callbackName] = empty
          ajaxError(null, type || 'abort', xhr, options)
        },
        xhr = {
          abort: abort
        }, abortTimeout

      if (ajaxBeforeSend(xhr, options) === false) {
        abort('abort')
        return false
      }
      //�ɹ����غ�Ļص�����
      window[callbackName] = function(data) {
        cleanup()
        ajaxSuccess(data, xhr, options)
      }

      script.onerror = function() {
        abort('error')
      }
      //���ص�������׷�ӵ������ַ��������script�������������
      script.src = options.url.replace(/=\?/, '=' + callbackName)
      $('head').append(script)

      //��������˳�ʱ����
      if (options.timeout > 0) abortTimeout = setTimeout(function() {
        abort('timeout')
      }, options.timeout)

      return xhr
    }

    //ajaxȫ������
    $.ajaxSettings = {
      // Default type of request
      type: 'GET',
      // Callback that is executed before request
      beforeSend: empty,
      // Callback that is executed if the request succeeds
      success: empty,
      // Callback that is executed the the server drops error
      error: empty,
      // Callback that is executed on request complete (both: error and success)
      complete: empty,
      // The context for the callbacks
      context: null,
      // Whether to trigger "global" Ajax events
      global: true,
      // Transport
      xhr: function() {
        return new window.XMLHttpRequest()
      },
      // MIME types mapping
      accepts: {
        script: 'text/javascript, application/javascript',
        json: jsonType,
        xml: 'application/xml, text/xml',
        html: htmlType,
        text: 'text/plain'
      },
      // Whether the request is to another domain
      crossDomain: false,
      // Default timeout
      timeout: 0,
      // Whether data should be serialized to string
      processData: true,
      // Whether the browser should be allowed to cache GET responses
      cache: true
    };

  //����MIME������Ӧ���������ͣ�����ajax�������dataType�ã�����Ԥ�ڷ��ص���������
  //��html,json,scirpt,xml,text

  function mimeToDataType(mime) {
    if (mime) mime = mime.split(';', 2)[0]
    return mime && (mime == htmlType ? 'html' : mime == jsonType ? 'json' : scriptTypeRE.test(mime) ? 'script' : xmlTypeRE.test(mime) && 'xml') || 'text'
  }
  //����ѯ�ַ���׷�ӵ�URL����

  function appendQuery(url, query) {
    //ע�������replace,����һ��ƥ�䵽��&����&&,&?,? ?& ??�滻��?,������֤��ַ����ȷ��
    return (url + '&' + query).replace(/[&?]{1,2}/, '?')
  }

  // serialize payload and append it to the URL for GET requests
  //���л����͵��������ϵ����ݣ������GET���������л��������׷�ӵ������ַ����

  function serializeData(options) {
    //options.processData��ʾ���ڷ�Get����,�Ƿ��Զ��� options.dataת��Ϊ�ַ���,ǰ����options.data�����ַ���
    if (options.processData && options.data && $.type(options.data) != "string")
    //options.traditional��ʾ�Ƿ���$.param�������л�
    options.data = $.param(options.data, options.traditional)
    if (options.data && (!options.type || options.type.toUpperCase() == 'GET'))
    //�����GET���󣬽����л��������׷�ӵ������ַ����
    options.url = appendQuery(options.url, options.data)
  }

  $.ajax = function(options) {
    //ע�����ﲻ��ֱ�ӽ�$.ajaxSettings�滻��$.extend�ĵ�һ������,������ı� $.ajaxSettings�����ֵ
    //����������Ǵ���һ���¶���
    var settings = $.extend({}, options || {})
    //�����û�ж���$.ajaxSettings��������Ե�ʱ�򣬲�ȥ��$.ajaxSettings[key] ���ƹ���
    for (key in $.ajaxSettings) if (settings[key] === undefined) settings[key] = $.ajaxSettings[key]
    //ִ��ȫ��ajaxStart
    ajaxStart(settings)

    //ͨ���ж������ַ�͵�ǰҳ���ַ��host�Ƿ���ͬ�������ǿ���
    if (!settings.crossDomain) settings.crossDomain = /^([\w-]+:)?\/\/([^\/]+)/.test(settings.url) && RegExp.$2 != window.location.host
    //���û�����������ַ����ȡ��ǰҳ���ַ
    if (!settings.url) settings.url = window.location.toString();
    //��data����ת��
    serializeData(settings);
    //��������û���
    if (settings.cache === false) settings.url = appendQuery(settings.url, '_=' + Date.now())

    //����������jsonp���򽫵�ַ�����=?�滻Ϊcallback=?,�൱��һ����д
    var dataType = settings.dataType,
      hasPlaceholder = /=\?/.test(settings.url)
      if (dataType == 'jsonp' || hasPlaceholder) {
        if (!hasPlaceholder) settings.url = appendQuery(settings.url, 'callback=?')
        return $.ajaxJSONP(settings)
      }

    var mime = settings.accepts[dataType],
      baseHeaders = {},
      //��������ַû�ж�����Э�飬���뵱ǰҳ��Э����ͬ
      protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
      xhr = settings.xhr(),
      abortTimeout
      //���û�п���
    if (!settings.crossDomain) baseHeaders['X-Requested-With'] = 'XMLHttpRequest'
    if (mime) {
      baseHeaders['Accept'] = mime
      if (mime.indexOf(',') > -1) mime = mime.split(',', 2)[0]
      xhr.overrideMimeType && xhr.overrideMimeType(mime)
    }
    //�������GET�������÷�����Ϣ��������ʱ���ݱ�������
    if (settings.contentType || (settings.contentType !== false && settings.data && settings.type.toUpperCase() != 'GET')) baseHeaders['Content-Type'] = (settings.contentType || 'application/x-www-form-urlencoded')
    settings.headers = $.extend(baseHeaders, settings.headers || {})

    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        xhr.onreadystatechange = empty;
        clearTimeout(abortTimeout)
        var result, error = false
        //����״̬���ж������Ƿ�ɹ�
        //״̬>=200 && < 300 ��ʾ�ɹ�
        //״̬ == 304 ��ʾ�ļ�δ�Ķ�����Ҳ����Ϊ�ɹ�
        //�����ȡҪ�����ļ���Ҳ������Ϊ�ǳɹ��ģ�xhr.status == 0����ֱ�Ӵ�ҳ��ʱ��������ʱ���ֵ�״̬��Ҳ���ǲ�����localhost����ʽ���ʵ�ҳ������
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {
          //��ȡ���ص���������
          dataType = dataType || mimeToDataType(xhr.getResponseHeader('content-type'))
          result = xhr.responseText

          try {
            // http://perfectionkills.com/global-eval-what-are-the-options/
            if (dataType == 'script')(1, eval)(result) //������ص�����������JS
            else if (dataType == 'xml') result = xhr.responseXML
            else if (dataType == 'json') result = blankRE.test(result) ? null : $.parseJSON(result)
          } catch (e) {
            error = e
          }
          //�������������ִ��ȫ��parsererror�¼�
          if (error) ajaxError(error, 'parsererror', xhr, settings)
          //����ִ��ajaxSuccess
          else ajaxSuccess(result, xhr, settings)
        } else {
          //���������������xhr.status��ִ����Ӧ�Ĵ�������
          ajaxError(null, xhr.status ? 'error' : 'abort', xhr, settings)
        }
      }
    }

    var async = 'async' in settings ? settings.async : true
    xhr.open(settings.type, settings.url, async)
    //��������ͷ��Ϣ
    for (name in settings.headers) xhr.setRequestHeader(name, settings.headers[name])

    //���ajaxBeforeSend�������ص�false����ȡ���˴���ʾ
    if (ajaxBeforeSend(xhr, settings) === false) {
      xhr.abort()
      return false
    }

    //��������settings.timeout�����ڳ�ʱ��ȡ�����󣬲�ִ��timeout�¼�������
    if (settings.timeout > 0) abortTimeout = setTimeout(function() {
      xhr.onreadystatechange = empty
      xhr.abort()
      ajaxError(null, 'timeout', xhr, settings)
    }, settings.timeout)

    // avoid sending empty string (#319)
    xhr.send(settings.data ? settings.data : null)
    return xhr
  }

  // handle optional data/success arguments
  //������ת����ajax����ָ���Ĳ�����ʽ

  function parseArguments(url, data, success, dataType) {
    var hasData = !$.isFunction(data) //���data��function������Ϊ��������ɹ���Ļص�
    return {
      url: url,
      data: hasData ? data : undefined, //���data����functionʵ��
      success: !hasData ? data : $.isFunction(success) ? success : undefined,
      dataType: hasData ? dataType || success : success
    }
  }

  //�򵥵�get����
  $.get = function(url, data, success, dataType) {
    return $.ajax(parseArguments.apply(null, arguments))
  }

  $.post = function(url, data, success, dataType) {
    var options = parseArguments.apply(null, arguments)
    options.type = 'POST'
    return $.ajax(options)
  }

  $.getJSON = function(url, data, success) {
    var options = parseArguments.apply(null, arguments)
    options.dataType = 'json'
    return $.ajax(options)
  }

  //�����url������http://www.xxxx.com selector������ʽ�����ǶԼ��ؽ�����HTML����һ��ɸѡ
  $.fn.load = function(url, data, success) {
    if (!this.length) return this
    //�������ַ�ÿո�ֿ�
    var self = this,
      parts = url.split(/\s/),
      selector,
      options = parseArguments(url, data, success),
      callback = options.success
    if (parts.length > 1) options.url = parts[0], selector = parts[1]
    //Ҫ�Գɹ���Ļص���������һ����д����Ϊ��Ҫ�����ؽ�����HTML��ӽ���ǰ����
    options.success = function(response) {
      //selector���Ƕ����󵽵����ݾ���һ��ɸѡ������������ֻ��ȡ�����������Ϊ.test�ı�ǩ
      self.html(selector ? $('<div>').html(response.replace(rscript, "")).find(selector) : response)
      //���������д�Ļص�
      callback && callback.apply(self, arguments)
    }
    $.ajax(options)
    return this
  }

  var escape = encodeURIComponent

    function serialize(params, obj, traditional, scope) {
      var type, array = $.isArray(obj)
      $.each(obj, function(key, value) {
        type = $.type(value)
        //scope��������valueҲ��object����array�����
        //traditional��ʾ�Ƿ��Դ�ͳ�ķ�ʽƴ�����ݣ�
        //��ͳ����˼���Ǳ�������һ������{a:[1,2,3]},ת�ɲ�ѯ�ַ�������Ϊ'a=1&a=2&a=3'
        //�Ǵ�ͳ�ĵĽ������a[]=1&a[]=2&a[]=3
        if (scope) key = traditional ? scope : scope + '[' + (array ? '' : key) + ']'
        // handle data in serializeArray() format
        //�����������Ϊ[{},{},{}]���������ʱ��һ��ָ�������л�����Ľ��
        if (!scope && array) params.add(value.name, value.value)
        // recurse into nested objects
        //��valueֵ����������Ƕ����Ҳ��ǰ���ͳ�ķ�ʽ���л���ʱ����Ҫ�ٴα���value
        else if (type == "array" || (!traditional && type == "object")) serialize(params, value, traditional, key)
        else params.add(key, value)
      })
    }
    //��objת��Ϊ��ѯ�ַ����ĸ�ʽ��traditional��ʾ�Ƿ�ת���ɴ�ͳ�ķ�ʽ�����ڴ�ͳ�ķ�ʽ����˼�������ע��
    $.param = function(obj, traditional) {
      var params = []
      //ע�����ｫadd��������params����������serializeʱ�Ų���Ҫ��������
      params.add = function(k, v) {
        this.push(escape(k) + '=' + escape(v))
      }
      serialize(params, obj, traditional)
      return params.join('&').replace(/%20/g, '+')
    }
})(Zepto)

;
(function($) {
  //���л���������һ������[{name:value},{name2:value2}]������
  $.fn.serializeArray = function() {
    var result = [],
      el
      //�������еĵ�һ����������б�Ԫ��ת���������б���
      $(Array.prototype.slice.call(this.get(0).elements)).each(function() {
        el = $(this)
        var type = el.attr('type')
        //�ж���type���ԣ��ų�fieldset��submi,reset,button�Լ�û�б�ѡ�е�radio��checkbox
        if (this.nodeName.toLowerCase() != 'fieldset' && !this.disabled && type != 'submit' && type != 'reset' && type != 'button' &&
        //ע�������д������Ԫ�ؼȲ���radioҲ����checkboxʱ,ֱ�ӷ���true��
        //��Ԫ����radio����checkboxʱ����ִ�к����this.checked����radio����checkbox��ѡ��ʱthis.checked�õ�trueֵ
        //�����Ϳ���ɸѡ�б�ѡ�е�radio��checkbox��
        ((type != 'radio' && type != 'checkbox') || this.checked)) result.push({
          name: el.attr('name'),
          value: el.val()
        })
      })
      return result
  }
  //������ֵת��name1=value1&name2=value2����ʽ
  $.fn.serialize = function() {
    var result = []
    this.serializeArray().forEach(function(elm) {
      result.push(encodeURIComponent(elm.name) + '=' + encodeURIComponent(elm.value))
    })
    return result.join('&')
  }
  //���ύ
  $.fn.submit = function(callback) {
    if (callback) this.bind('submit', callback)
    else if (this.length) {
      var event = $.Event('submit')
      this.eq(0).trigger(event)
      if (!event.defaultPrevented) this.get(0).submit()
    }
    return this
  }

})(Zepto)

//CSS3����
;
(function($, undefined) {
  var prefix = '',
    eventPrefix, endEventName, endAnimationName,
    vendors = {
      Webkit: 'webkit',
      Moz: '',
      O: 'o',
      ms: 'MS'
    },
    document = window.document,
    testEl = document.createElement('div'),
    supportedTransforms = /^((translate|rotate|scale)(X|Y|Z|3d)?|matrix(3d)?|perspective|skew(X|Y)?)$/i,
    transform,
    transitionProperty, transitionDuration, transitionTiming,
    animationName, animationDuration, animationTiming,
    cssReset = {}
    //���շ�ʽ���ַ���ת����-�ָ���Сд��ʽ����borderWidth ==> border-width

    function dasherize(str) {
      return downcase(str.replace(/([a-z])([A-Z])/, '$1-$2'))
    }

    function downcase(str) {
      return str.toLowerCase()
    }
    //���������¼���

    function normalizeEvent(name) {
      return eventPrefix ? eventPrefix + name : downcase(name)
    }

    //�������������������CSS����ǰ��꡺��¼�ǰꡣ�����������ں���webkit
    //��ô��������CSS���Ե�ǰ�prefix�͵���'-webkit-',���������¼�����ǰ�eventPrefix����Webkit
    $.each(vendors, function(vendor, event) {
      if (testEl.style[vendor + 'TransitionProperty'] !== undefined) {
        prefix = '-' + downcase(vendor) + '-'
        eventPrefix = event
        return false
      }
    })

    transform = prefix + 'transform'
  cssReset[transitionProperty = prefix + 'transition-property'] = cssReset[transitionDuration = prefix + 'transition-duration'] = cssReset[transitionTiming = prefix + 'transition-timing-function'] = cssReset[animationName = prefix + 'animation-name'] = cssReset[animationDuration = prefix + 'animation-duration'] = cssReset[animationTiming = prefix + 'animation-timing-function'] = ''

  $.fx = {
    off: (eventPrefix === undefined && testEl.style.transitionProperty === undefined),
    speeds: {
      _default: 400,
      fast: 200,
      slow: 600
    },
    cssPrefix: prefix,
    transitionEnd: normalizeEvent('TransitionEnd'),
    animationEnd: normalizeEvent('AnimationEnd')
  }

  $.fn.animate = function(properties, duration, ease, callback) {
    if ($.isPlainObject(duration)) ease = duration.easing, callback = duration.complete, duration = duration.duration
    //���duration������ʱ����ʾ��������ʱ�䣬������ַ��������$.fx.speeds��ȡ�����Ӧ��ֵ�����û���ҵ���Ӧ��ֵ����ȡĬ��ֵ
    if (duration) duration = (typeof duration == 'number' ? duration : ($.fx.speeds[duration] || $.fx.speeds._default)) / 1000
    return this.anim(properties, duration, ease, callback)
  }

  $.fn.anim = function(properties, duration, ease, callback) {
    var key, cssValues = {}, cssProperties, transforms = '',
      that = this,
      wrappedCallback, endEvent = $.fx.transitionEnd
      //��������ʱ��Ĭ��ֵ
    if (duration === undefined) duration = 0.4
    //����������֧��CSS3�Ķ�������duration=0����˼����ֱ����ת����ֵ
    if ($.fx.off) duration = 0

    //���properties��һ��������keyframe
    if (typeof properties == 'string') {
      // keyframe animation
      cssValues[animationName] = properties
      cssValues[animationDuration] = duration + 's'
      cssValues[animationTiming] = (ease || 'linear')
      endEvent = $.fx.animationEnd
    } else {
      cssProperties = []
      // CSS transitions
      for (key in properties)
      //������� ��CSS�����Ǳ���֮���
      if (supportedTransforms.test(key)) transforms += key + '(' + properties[key] + ') '
      else cssValues[key] = properties[key], cssProperties.push(dasherize(key))

      if (transforms) cssValues[transform] = transforms, cssProperties.push(transform)
      if (duration > 0 && typeof properties === 'object') {
        cssValues[transitionProperty] = cssProperties.join(', ')
        cssValues[transitionDuration] = duration + 's'
        cssValues[transitionTiming] = (ease || 'linear')
      }
    }

    wrappedCallback = function(event) {
      if (typeof event !== 'undefined') {
        if (event.target !== event.currentTarget) return // makes sure the event didn't bubble from "below"
        $(event.target).unbind(endEvent, wrappedCallback)
      }
      $(this).css(cssReset)
      callback && callback.call(this)
    }
    //������ִ�ж�����ʱ����ô�����������ִ�лص���
    //�����֧�ֳ�������,��ֱ����������ֵ�󣬲���ִ�ж��������ص�
    if (duration > 0) this.bind(endEvent, wrappedCallback)

    // trigger page reflow so new elements can animate
    this.size() && this.get(0).clientLeft

    //����
    this.css(cssValues)

    //������ʱ��С�ڵ���0ʱ�����̻�ԭ
    if (duration <= 0) setTimeout(function() {
      that.each(function() {
        wrappedCallback.call(this)
      })
    }, 0)

    return this
  }

  testEl = null
})(Zepto)

// touchģ��
;
(function($){
  var touch = {},
    touchTimeout, tapTimeout, swipeTimeout, longTapTimeout,
    longTapDelay = 750,
    gesture

  function swipeDirection(x1, x2, y1, y2) {
    return Math.abs(x1 - x2) >=
      Math.abs(y1 - y2) ? (x1 - x2 > 0 ? 'Left' : 'Right') : (y1 - y2 > 0 ? 'Up' : 'Down')
  }

  function longTap() {
    longTapTimeout = null
    if (touch.last) {
      touch.el.trigger('longTap')
      touch = {}
    }
  }

  function cancelLongTap() {
    if (longTapTimeout) clearTimeout(longTapTimeout)
    longTapTimeout = null
  }

  function cancelAll() {
    if (touchTimeout) clearTimeout(touchTimeout)
    if (tapTimeout) clearTimeout(tapTimeout)
    if (swipeTimeout) clearTimeout(swipeTimeout)
    if (longTapTimeout) clearTimeout(longTapTimeout)
    touchTimeout = tapTimeout = swipeTimeout = longTapTimeout = null
    touch = {}
  }

  function isPrimaryTouch(event){
    return (event.pointerType == 'touch' ||
      event.pointerType == event.MSPOINTER_TYPE_TOUCH)
      && event.isPrimary
  }

  function isPointerEventType(e, type){
    return (e.type == 'pointer'+type ||
      e.type.toLowerCase() == 'mspointer'+type)
  }

  $(document).ready(function(){
    var now, delta, deltaX = 0, deltaY = 0, firstTouch, _isPointerType

    if ('MSGesture' in window) {
      gesture = new MSGesture()
      gesture.target = document.body
    }

    $(document)
      .bind('MSGestureEnd', function(e){
        var swipeDirectionFromVelocity =
          e.velocityX > 1 ? 'Right' : e.velocityX < -1 ? 'Left' : e.velocityY > 1 ? 'Down' : e.velocityY < -1 ? 'Up' : null;
        if (swipeDirectionFromVelocity) {
          touch.el.trigger('swipe')
          touch.el.trigger('swipe'+ swipeDirectionFromVelocity)
        }
      })
      .on('touchstart MSPointerDown pointerdown', function(e){
        if((_isPointerType = isPointerEventType(e, 'down')) &&
          !isPrimaryTouch(e)) return
        firstTouch = _isPointerType ? e : e.touches[0]
        if (e.touches && e.touches.length === 1 && touch.x2) {
          // Clear out touch movement data if we have it sticking around
          // This can occur if touchcancel doesn't fire due to preventDefault, etc.
          touch.x2 = undefined
          touch.y2 = undefined
        }
        now = Date.now()
        delta = now - (touch.last || now)
        touch.el = $('tagName' in firstTouch.target ?
          firstTouch.target : firstTouch.target.parentNode)
        touchTimeout && clearTimeout(touchTimeout)
        touch.x1 = firstTouch.pageX
        touch.y1 = firstTouch.pageY
        if (delta > 0 && delta <= 250) touch.isDoubleTap = true
        touch.last = now
        longTapTimeout = setTimeout(longTap, longTapDelay)
        // adds the current touch contact for IE gesture recognition
        if (gesture && _isPointerType) gesture.addPointer(e.pointerId);
      })
      .on('touchmove MSPointerMove pointermove', function(e){
        if((_isPointerType = isPointerEventType(e, 'move')) &&
          !isPrimaryTouch(e)) return
        firstTouch = _isPointerType ? e : e.touches[0]
        cancelLongTap()
        touch.x2 = firstTouch.pageX
        touch.y2 = firstTouch.pageY

        deltaX += Math.abs(touch.x1 - touch.x2)
        deltaY += Math.abs(touch.y1 - touch.y2)
      })
      .on('touchend MSPointerUp pointerup', function(e){
        if((_isPointerType = isPointerEventType(e, 'up')) &&
          !isPrimaryTouch(e)) return
        cancelLongTap()

        // swipe
        if ((touch.x2 && Math.abs(touch.x1 - touch.x2) > 30) ||
            (touch.y2 && Math.abs(touch.y1 - touch.y2) > 30))

          swipeTimeout = setTimeout(function() {
            touch.el.trigger('swipe')
            touch.el.trigger('swipe' + (swipeDirection(touch.x1, touch.x2, touch.y1, touch.y2)))
            touch = {}
          }, 0)

        // normal tap
        else if ('last' in touch)
          // don't fire tap when delta position changed by more than 30 pixels,
          // for instance when moving to a point and back to origin
          if (deltaX < 30 && deltaY < 30) {
            // delay by one tick so we can cancel the 'tap' event if 'scroll' fires
            // ('tap' fires before 'scroll')
            tapTimeout = setTimeout(function() {

              // trigger universal 'tap' with the option to cancelTouch()
              // (cancelTouch cancels processing of single vs double taps for faster 'tap' response)
              var event = $.Event('tap')
              event.cancelTouch = cancelAll
              touch.el.trigger(event)

              // trigger double tap immediately
              if (touch.isDoubleTap) {
                if (touch.el) touch.el.trigger('doubleTap')
                touch = {}
              }

              // trigger single tap after 250ms of inactivity
              else {
                touchTimeout = setTimeout(function(){
                  touchTimeout = null
                  if (touch.el) touch.el.trigger('singleTap')
                  touch = {}
                }, 250)
              }
            }, 0)
          } else {
            touch = {}
          }
          deltaX = deltaY = 0

      })
      // when the browser window loses focus,
      // for example when a modal dialog is shown,
      // cancel all ongoing events
      .on('touchcancel MSPointerCancel pointercancel', cancelAll)

    // scrolling the window indicates intention of the user
    // to scroll, not tap or swipe, so cancel all ongoing events
    $(window).on('scroll', cancelAll)
  })

  ;['swipe', 'swipeLeft', 'swipeRight', 'swipeUp', 'swipeDown',
    'doubleTap', 'tap', 'singleTap', 'longTap'].forEach(function(eventName){
    $.fn[eventName] = function(callback){ return this.on(eventName, callback) }
  })
})(Zepto)