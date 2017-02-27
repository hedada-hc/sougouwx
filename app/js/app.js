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
	v.tmp_cookie = success
})

var v = new Vue({
	el:"#app",
	data:{
		key:'php',
		cookie:'',
		tmp_cookie:'',
		PHPSESSID:'',
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
		fs:"",
		page:10
	},methods:{
		getcookie(){
			weixin.GetSearchList(this.page)
		},
		SoPostCode(){
			weixin.PostCode()
		},
		compare(prop) {
		    return function (obj1, obj2) {
		        var val1 = obj1[prop];
		        var val2 = obj2[prop];if (val1 < val2) {
		            return -1;
		        } else if (val1 > val2) {
		            return 1;
		        } else {
		            return 0;
		        }            
		    } 
		},sorts(){
			this.DataJson.sort(this.compare("ARead"))
		}
	}
})