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
		v.page = page - 1
		//page = page - num
		var url = `http://weixin.sogou.com/weixin?query=${escape(v.key)}&type=2&page=${v.page}&ie=utf8`
		request.get(url)
			.set("Cookie",v.tmp_cookie)
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
					console.log(success.text,v.tmp_cookie)
					for(let a=0;a<article.length;a++){
						tmp[a].push(article[a][1])
						tmp[a].push(article[a][2])
					}
					this.GetAccount(callback,tmp,AccountUrl)
					if(v.page <= 0){
						console.log("到头了")
					}else{
						this.GetSearchList(v.page)
					}
					
				}else{
					console.log(v.tmp_cookie)
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
		request.get(url).end((error,success)=>{
			
			console.log(success.header['set-cookie'])
			fs.writeFile(`./code/socode.png`,success.body,(err)=>{
				var tmpc = this.HandleCookieCode(/PHPSESSID=(.*?);/,success.header['set-cookie'])
				if(tmpc != ""){
					v.PHPSESSID = `; PHPSESSID=${tmpc}`
					console.log(v.PHPSESSID)
				}else{
					var tmpc = this.HandleCookieCode(/SUIR=(.*?);/,success.header['set-cookie'])
					v.PHPSESSID = `; SUIR=${tmpc}`
					console.log(v.PHPSESSID)
				}
				
				v.ImgCode = `./code/socode.png?${new Date().getTime()}`
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

	StringCookie(cookie){
		console.log(cookie)
		var tmp = ''
		if(cookie != undefined){
			for(let i=0;i<cookie.length;i++){
				if((cookie.length - i) == 1){
					tmp += `${cookie[i].split(";")[0]}`
				}else{
					tmp += `${cookie[i].split(";")[0]}; `
				}
			}
			return tmp
		}
		return cookie
		
	}

	//搜索页面验证码提交
	PostCode(){
		v.tmp_cookie = v.cookie+v.PHPSESSID
		console.log(v.tmp_cookie)
		var num = /([\d]+)/.exec(v.PostCode[0].ImgUrl)[1]
		console.log(num)
		var url = "http://weixin.sogou.com/antispider/thank.php"
		request.post(url)
			.type("form")
			.set("Cookie",v.tmp_cookie)
			.send(`c=${v.code}&r=${v.PostCode.r}&v=5`)
			.end((error,success)=>{
				
				console.log(success.text)
				// if(!/SNUID=([\w]+);/.test(v.cookie)){
					var json = JSON.parse(success.text)
					if(json.code != 3){
						if(v.tmp_cookie != ""){
							v.tmp_cookie += `; SNUID=${json.id}; SUV=${num}123123456${v.PHPSESSID}`
						}else{
							v.tmp_cookie += `SNUID=${json.id}; SUV=${num}123123456${v.PHPSESSID}`
						}
					}
					console.log(v.tmp_cookie)
					
					//v.cookie += `; SUNID=${JSON.parse(success.text).id}; SUV=${num}123123456`
				//}else{
					// var tmp = /SNUID=([\w]+);/.exec(v.cookie)[1]
					// v.cookie = v.cookie.replace(/SNUID=4837FF1D686D21E49F20514C6814DE9E/,`SNUID=${JSON.parse(success.text).id}`)
					// console.log(v.cookie)
					// v.cookie += `; SUV=${num}123123456`
					// console.log(v.cookie)
				//}
				
				
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