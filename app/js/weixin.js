/*
 * 搜狗微信文章采集模块
 * 2017年2月26日14:58:46
 * 作者: hezone
 */
const request = require("superagent")
const async = require("async")
const url = require("url")
const ipc = require('electron').ipcRenderer
const fs = require("fs")
const config = require('./config')

class WeiXin{
	/*
	 * 获取微信文章搜索页列表 总异步流程控制器
	 */
	GetSearchList(page){
		var Wx = new WeiXin()
		async.waterfall([
			function(callback){
				Wx.GetSoList(callback,page)
			},function(data,callback){
				callback(null,data)
			}
		],(err,msg)=>{
			if(msg.ImgUrl == undefined){
				for(var i=0;i<msg.length;i++){
					v.DataJson.push(msg[i])
				}
				console.log(v.DataJson)
			}else{
				v.PostCode.push(msg)
				this.SaveCode(msg.ImgUrl)
				console.log(msg)
			}
		})
	}


	//获取文章搜索列表
	GetSoList(callback,page){
		var num = page - 1
		//page = page - num
		var url = `http://weixin.sogou.com/weixin?query=${escape(v.key)}&type=2&page=${num}&ie=utf8`
		request.get(url)
			.set("Cookie",v.cookie)
			.set('User-Agent','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2922.1 Safari/537.36')
			.end((error,success)=>{
				if(!config.r.test(success.text)){
					var tmp = this.Reg(success.text,config.so_username)
					var article = this.Reg(success.text,config.so_ArticleTitle,1)
					var A = config.account_anti_url.exec(success.text)
					var AccountUrl = `http://weixin.sogou.com${A[1]}`
					// for(var i=0;i<tmp.length;i++){
					// 	this.GetWxUser(tmp[i][1],cookie,url)
					// }
					for(let a=0;a<article.length;a++){
						tmp[a].push(article[a][1])
						tmp[a].push(article[a][2])
					}
					this.GetAccount(callback,tmp,AccountUrl)
					if(num <= 0){
						console.log("到头了")
					}else{
						this.GetSearchList(num)
					}
					
				}else{
					v.r = config.r.exec(success.text)
					v.seccodeImage = config.seccodeImage.exec(success.text)
					callback(null,{"r":v.r[1],"ImgUrl":v.seccodeImage[1]})
				}
			})
	}


	//获取公众号平均阅读量  
	GetAccount(callback,data,url){
		request.get(url)
			.end((error,success)=>{
				var Account = JSON.parse(success.text)
				var tmp = []
				for(let i = 0;i<data.length;i++){
					if(Account.msg[data[i][1]] != undefined){
						var count = Account.msg[data[i][1]].split(",")
						var json = {
							"wxname":data[i][4],
							"title":data[i][6],
							"homeUrl":data[i][2],
							"articleUrl":data[i][5],
							"HeaderImg":data[i][3],
							"AArticle":count[0],
							"ARead":count[1],
						}
						tmp.push(json)
					}else{
						var json = {
							"wxname":data[i][4],
							"title":data[i][6],
							"homeUrl":data[i][2],
							"articleUrl":data[i][5],
							"HeaderImg":data[i][3],
							"AArticle":0,
							"ARead":0,
						}
						tmp.push(json)
					}
				}
				callback(null,tmp)
			})
	}

	SaveCode(url){
		url = `http://weixin.sogou.com/antispider/${url}`
		request.get(url).set("Cookie",v.cookie).end((error,success)=>{
			console.log(v.cookie)
			console.log(success)
			fs.writeFile(`./code/socode.png`,success.body,(err)=>{
				var tmpc = this.HandleCookieCode(/PHPSESSID=(.*?);/,success.header['set-cookie'])
				v.cookie += `; PHPSESSID=${tmpc}`
				if(!err)
				console.log("验证码已经保存")
			})
		})
	}

	HandleCookieCode(reg,setCookie){
		var tmp = ''
		for(var i=0;i<setCookie.length;i++){
			if(reg.test(setCookie[i])){
				tmp = reg.exec(setCookie)[1]
			}
		}
		return tmp
	}

	//搜索页面验证码提交
	PostCode(){
		var num = /([\d]+)/.exec(v.PostCode[0].ImgUrl)[1]
		console.log(num)
		var url = "http://weixin.sogou.com/antispider/thank.php"
		request.post(url)
			.set("Cookie",v.cookie)
			.send(`c=${v.code}&r=${v.PostCode.r}&v=5`)
			.end((error,success)=>{
				console.log(success)
				console.log(success.text)
				if(/SNUID=([\w]+);/.test(v.cookie)){
					var tmp = /SNUID=([\w]+);/.exec(v.cookie)[1]
					v.cookie = v.cookie.replace(/SNUID=([\w]+);/,`SNUID=${JSON.parse(success.text).id}`)
					v.cookie += `; SUV=${num}123123456`
					console.log(v.cookie)
					//v.cookie += `; SUNID=${JSON.parse(success.text).id}; SUV=${num}123123456`
				}
				
				
		})

	}

	//正则匹配
	Reg(data,myReg,iS = null){
	    var patt = new RegExp(myReg)
	    var ret_test = patt.test(data)
	    if(iS == null){
	    	if(ret_test){
				var reg_data =  []
				var res = []
				while(res = myReg.exec(data)){ 
					res[2] = res[2].replace(/amp;/g,"")
					reg_data.push(res)
				}   
				return reg_data
		    }
		    return false
	    }else{
	    	if(ret_test){
				var reg_data =  []
				var res = []
				while(res = myReg.exec(data)){ 
					res[1] = res[1].replace(/amp;/g,"")
					reg_data.push(res)
				}   
				return reg_data
		    }
		    return false
	    }
	    
	}
	
}

module.exports = new WeiXin()