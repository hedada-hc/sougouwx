const request = require("superagent")
const async = require("async")
const ipc = require('electron').ipcRenderer
const weixin = require("./app/js/weixin.js")
const fs = require("fs")
const eventproxy = require("eventproxy")
const cheerio = require("cheerio")
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
		seccodeImage:'',
		wxuser:[],
		cert:'',
		codeto:0,
		switch:0,
		DataJson:[],
		IS:true,
		PostCode:[],
		test:[],
		fs:""
	},methods:{
		getcookie(){
			weixin.GetSearchList(11)
			//console.log(v.PostCode,"验证码出现啦")

			//files.forEach(function (filename) {
			// var arr = [1,2,3,4,5,6,7,8,9]
			// arr.forEach((v)=>{
			// 	console.log(v)
			// 	fs.readFile("./code.txt",{encoding:"utf-8"},(err,data)=>{
			// 		console.log(data)
			// 		if(data == "true"){
			// 			weixin.GetSearchList(v)
			// 		}else{
			// 			console.log(this.PostCode,"验证码出现啦")
			// 		}
			// 	})	
			// })	


			// 得到一个 eventproxy 的实例
			// var ep = new eventproxy();
			// var topicUrls = [
			// 	"http://weixin.sogou.com/weixin?type=2&query=PHP&page=1",
			// 	"http://weixin.sogou.com/weixin?type=2&query=PHP&page=2",
			// 	"http://weixin.sogou.com/weixin?type=2&query=PHP&page=3",
			// 	"http://weixin.sogou.com/weixin?type=2&query=PHP&page=4",
			// 	"http://weixin.sogou.com/weixin?type=2&query=PHP&page=5",
			// 	"http://weixin.sogou.com/weixin?type=2&query=PHP&page=6",
			// ]
			// var tmp = 1
			// ep.after('topic_html', topicUrls.length, function (data) {
			// 	if(data[0].ImgUrl == undefined){
			// 		console.log("成功")
			// 	}else{
			// 		tmp = 2
			// 		console.log(data,tmp)
			// 	}
			  
			// });

			// topicUrls.forEach(function (topicUrl) {
			// 	if(tmp == 1){
			// 		weixin.GetSearchList(topicUrl,ep)
			// 	}else{
			// 		console.log("失败")
			// 	}
				
			// })
			

			
			//req.GetLike("http://mp.weixin.qq.com/s?src=3&timestamp=1486914267&ver=1&signature=q0bm2wPwEbdZ8a9ZsWK2DOMjSg9jHDrQAexxMtIhEcvJygowJNJgaHA69MhNk8akG8oC7rpaeCLNz0FvCftt5LL9PnHeAY91GgwX39w*mxXb87XVJuxBZrCnh1MyiQY9BFS4ag1akMMZdHqeUzuIguj5ggahqz*dK36d2Ox3lag=")
			//console.log(this.read_num,this.like_num)
		},
		SoPostCode(){
			weixin.PostCode()
		},
	}
})