const request = require("superagent")
const async = require("async")
const ipc = require('electron').ipcRenderer
const req = require("./app/js/request.js")
var cookie = ''
ipc.on('cookies',(error,success)=>{
	v.cookie = success
})

var v = new Vue({
	el:"#app",
	data:{
		key:'php',
		cookie:'',
		read_num:0,
		like_num:0,
		code:'',
		ImgCode:'',
		r:'',
		wxuser:[],
		cert:'',
		codeto:0
	},methods:{
		getcookie(){
			req.GetSoList(this.key,this.cookie)
			//req.GetLike("http://mp.weixin.qq.com/s?src=3&timestamp=1486914267&ver=1&signature=q0bm2wPwEbdZ8a9ZsWK2DOMjSg9jHDrQAexxMtIhEcvJygowJNJgaHA69MhNk8akG8oC7rpaeCLNz0FvCftt5LL9PnHeAY91GgwX39w*mxXb87XVJuxBZrCnh1MyiQY9BFS4ag1akMMZdHqeUzuIguj5ggahqz*dK36d2Ox3lag=")
			//console.log(this.read_num,this.like_num)
		},
		postCode(){
			req.MemCode(this.cookie)
			this.ImgCode = ''
		}
	}
})