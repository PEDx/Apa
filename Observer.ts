// 处理和构造一个观察者
class Observer {
    data: Object
    constructor(data) {
        this.data = data
        this.walk(data)
    }
    walk(obj) {
        let val
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                val = obj[key]
                if (typeof val === 'object') {
                    new Observer(val)
                }
                this.convert(key, val)
            }
        }
    }
    convert(key, value) {
        // 初始化一个订阅当前数据的订阅者列表
        let watchLis = new WatcherLis()
        Object.defineProperty(this.data, key, {
            enumerable: true,
            configurable: true,
            get: () => {
                // 劫持对对象属性的取值操作
                // console.log(key + '的取值操作')
                // 判断是谁在查看当前的 data 中的值
                // Vue 实例调用 $watch 函数时会取得
                if (WatcherLis.target) {
                    watchLis.addItem(WatcherLis.target)
                    console.log(key + '的取值操作')
                }
                // get 中一定要 return ,不然默认返回 undfined
                return value
            },
            set: newVal => {
                // 可劫持对对象属性的赋值操作
                console.log(key + '的赋值操作')
                // 设置的值不变就立即返回
                if (newVal === value) return
                // 变的话就赋上新值
                if (typeof newVal === 'object') {
                    let ChilObj = new Observer(newVal)
                }
                value = newVal
                // 设置更新了 data 中的值, 调用订阅者们的 update
                watchLis.notify()
            }
        })
    }
}
// 数据订阅者列表, 当前数据发生变法后, 就调用 notify 函数用以完成订阅者自身的 update 更新
class WatcherLis {
    static target = null
    lis: Array<any>
    constructor() {
        this.lis = []
    }
    addItem(item) {
        this.lis.push(item)
    }
    notify() {
        this.lis.forEach(item => item.updata())
    }
}
// 数据订阅者就是 Watcher
class Watcher {
    vm: any
    expOrFn: any
    callback: Function
    value: any
    constructor(vm, expOrFn, callback) {
        // vm 保存了 Vue 创建的对象
        this.vm = vm
        this.expOrFn = expOrFn
        this.callback = callback
        this.value = this.get()
    }
    get() {
        // 做标记
        WatcherLis.target = this
        // this.vm._data 取到的是 Vue 中的数据对象
        // this.expOrFn 则取到的是 Vue 的内部 $watch 函数所要监听的数据项
        // 因此这里的取值操作要先以 WatcherLis.target 不为 null 为前提
        // 才能触发 data 中属性值的 get 函数
        const value = this.vm._data[this.expOrFn]
        // 此时已经完成取值, 可以销毁 WatcherLis.target 中的值了
        WatcherLis.target = null
        return value
    }
    updata() {
        const value = this.get()
        if (value !== this.value) {
            this.value = value
            this.callback.call(this.vm)
        }
    }
}

class Vue {
    $option: any
    _data: any
    constructor(option = { data: null }) {
        this.$option = option
        let data = this._data = option.data
        // 给 Vue 对象中的属性添加上
        Object.keys(data).forEach(key => this._proxy(key))
        // 将传入的数据添加 观察
        new Observer(data)
    }
    _proxy(key) {
        let self = this
        Object.defineProperty(self, key, {
            enumerable: true,
            configurable: true,
            get: function proxyGetter() {
                return self._data[key]
            },
            set: function proxySetter(val) {
                self._data[key] = val
            },

        })
    }
    // 函数 $watch 可用于对特定数据的监听和处理
    $watch(expOrFn, callback, option) {
        new Watcher(this, expOrFn, callback)
    }
}
