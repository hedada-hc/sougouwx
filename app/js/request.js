/*
2017年2月13日00:16:54
数据请求模块
*/
const request = require("superagent")
const async = require("async")
const url = require("url")
const ipc = require('electron').ipcRenderer
const fs = require("fs")
class req{

	//获取文章搜索列表
	GetSoList(key,cookie){
		for(let k = 0;k<10;k++){
			var url = `http://weixin.sogou.com/weixin?query=${escape(key)}&type=2&page=${k}&ie=utf8`
			request.get(url)
				.set("Cookie",cookie)
				.set('User-Agent','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2922.1 Safari/537.36')
				.end((error,success)=>{
					if(this.iSCode(success.text,url,cookie) == true){
						var tmp = this.Reg(success.text,/href="(.*?)"\sdata-headimage=".*?"\sdata-isV="[\d]"\suigs=".*?">(.*?)<\/a>/g)
						for(var i=0;i<tmp.length;i++){
							this.GetWxUser(tmp[i][1],cookie,url)
						}
						console.log(tmp)
					}
				})
			v.percent = Number(v.percent) + (100 / 10)	
		}	
	}

	//获取公众号搜索列表
	GetGzList(key,cookie){
		var url = `http://weixin.sogou.com/weixin?query=${escape(key)}&page=1&ie=utf8`
		request.get(url)
			.end((error,success)=>{
				if(this.iSCode(success.text,url,cookie) == true){
					console.log(success.text)
				}
				
			})
	}

	//获取微信账号
	GetWxUser(url,cookie,Referer){
		request.get(url)
			.set("Cookie",cookie)
			.set('Referer',Referer)
			.set("Accept-Encoding",'zlib')
			.set('User-Agent','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2922.1 Safari/537.36')
			.end((error,success) => {
				if(/<a\shref="javascript:;"\sid="verify_change"\sclass="btn_change\sweb_only">(.*?)<\/a>/.test(success.text)){
					this.PostCode(cookie)
				}else{
					var tmp = /var\sname="(.*?)"\|\|"(.*?)";/.exec(success.text)
					v.wxuser.push({"wxuser":tmp[1],"wxname":tmp[2]})
					console.log(v.wxuser)
				}
		})
	}

	//第二层验证码
	PostCode(cookie){
		if(v.codeto == 0){
			v.codeto = 1
			var cert = new Date().getTime().toString()+"2345"
			var codeurl = `http://mp.weixin.qq.com/mp/verifycode?cert=${cert}`
			v.cert = cert
			//保存验证码
			request.get(codeurl).set("Cookie",cookie).end((error,success)=>{
				console.log(success)
				var tmpc = this.HandleCookieCode(/sig=([\w]+);/,success.header['set-cookie'])
				v.cookie += `; sig=${tmpc}`
				fs.writeFile(`./code/${tmpc}.png`,success.body,(err)=>{
					console.log(err)
					v.ImgCode = `./code/${tmpc}.png`
					v.ImgCode_Show = true
				})
			})
		}
	}

	//主页验证码
	MemCode(cookie){
		var url = "http://mp.weixin.qq.com/mp/verifycode"
		request.post(url).type("form")
			.set("Accept-Encoding",'zlib')
			.set("Cookie",cookie).send(`cert=${v.cert}&input=${v.code}`).end((error,success)=>{
			if(JSON.parse(success.text).ret == 0){
				console.log("验证成功！")
			}else{
				console.log(success.text,cookie)
			}
		})
	}

	//正则匹配
	Reg(data,myReg){
	    var patt = new RegExp(myReg)
	    var ret_test = patt.test(data);
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

	//获取文章人气数和点赞数
	GetLike(DataUrl){
		var d = url.parse(DataUrl,true)
		var urls = `http://mp.weixin.qq.com/mp/getcomment?src=3&ver=1&timestamp=1486914267&signature=${escape(d.query.signature)}`
		request.get(urls)
			.set("Content-Type","application/json; charset=UTF-8")
			.set('User-Agent','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2922.1 Safari/537.36')
			.end((error,success)=>{
				console.log(error)
				console.log(urls)
				if(success != null){
					var tmp = JSON.oarse(success)
					if(tmp.base_resp.ret == 0){
						v.read_num = tmp.read_num
						v.like_num = tmp.like_num
					}else{
						v.read_num = -1
						v.like_num = -1
					}	
				}
				
			})
	}

	iSCode(data,url,cookie){
		if(/<input\stype="hidden"\sname="tc"\sid="tc"\svalue="">/.test(data)){
			/\/weixin\?(.*)/.exec(str)[0]
			v.r = url
			v.r = /name="r"\sid="from"\svalue="(.*?)"\s>/.exec(data)[1]
			//v.ImgCode = "http://weixin.sogou.com/antispider/" + /onerror="setImgCode\(0\)"\ssrc="(.*?)"\swidth="100"/.exec(data)[1]
			var url = `http://weixin.sogou.com/antispider/util/seccode.php`
			request.get(url).end((error,success)=>{
				var tmpc = this.HandleCookieCode(/PHPSESSID=(.*?);/,success.header['set-cookie'])
				v.cookie += `; PHPSESSID=${tmpc}`
				var scodeImgName = new Date().getTime().toString()+"98761"
				fs.writeFile(`./code/${scodeImgName}.jpg`,success.body,(err)=>{
					if(!err)
					v.ListCode = `./code/${scodeImgName}.jpg`
					v.ListCode_Show = true
					//this.HandleCookieCode(success.header['set-cookie'])	
				})
			})
			//ipc.send('code',url) 
		}else{
			return true
		}
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

	SendCode(cookie){
		var url = "http://weixin.sogou.com/antispider/thank.php"
		console.log(v.r,`c=${v.code}&r=${v.r}&v=5`)
		request.post(url)
			.type('form')
			.send(`c=${v.code}&r=${v.r}&v=5`)
			.set("Cookie",cookie)
			.set("Referer",`http://weixin.sogou.com/antispider/?from=${v.r}`)
			.set('User-Agent','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2922.1 Safari/537.36')
			.end((error,success) => {
				console.log(success)
			})
	}
}


module.exports = new req()

/*
//需要两次encodeURL 加密

解封地址
采集地址 http://weixin.sogou.com/weixin?type=2&query=%E6%B7%98%E5%AE%9D%E5%AE%A2&ie=utf8&_sug_=n&_sug_type_=1&w=01015002&oq=&ri=7&sourceid=sugg&sut=0&sst0=1486920027381&lkt=0,0,0&p=40040108
post地址  http://weixin.sogou.com/antispider/thank.php
验证码地址 http://weixin.sogou.com/antispider/util/seccode.php?tc=1486920301
提交信息 c=13542x&r=%252Fweixin%253Ftype%253D2%2526query%253D%25E6%25B7%2598%25E5%25AE%259D%25E5%25AE%25A2%2526ie%253Dutf8%2526_sug_%253Dn%2526_sug_type_%253D1%2526w%253D01015002%2526oq%253D%2526ri%253D7%2526sourceid%253Dsugg%2526sut%253D0%2526sst0%253D1486920027381%2526lkt%253D0%252C0%252C0%2526p%253D40040108&v=5

成功信息 {"code": 0,"msg": "解封成功，正在为您跳转来源地址...", "id": "53E224C9BBB9F4E41B9D5CFBBC107707"}
验证码错误 {"code": 3,"msg": "验证码输入错误, 请重新输入！"}

http://weixin.sogou.com/weixin?type=2&query=%E5%B0%8F%E7%89%9B%E8%81%94%E7%9B%9F&ie=utf8&_sug_=y&_sug_type_=&w=01019900&sut=6462996&sst0=1487580087575&lkt=0%2C0%2C0
http://weixin.sogou.com/antispider/?from=%2fweixin%3Ftype%3d1%26query%3d%E5%B0%8F%E7%89%9B%E8%81%94%E7%9B%9F%26ie%3dutf8%26_sug_%3dn%26_sug_type_%3d



http://weixin.sogou.com/weixin?type=2&query=%E6%B7%98%E5%AE%9D%E5%AE%A2&ie=utf8

Hezone 2017/2/22 13:07:13
http://weixin.sogou.com/antispider/thank.php  提交地址
提交数据 c=s6r3e3&r=%252Fweixin%253Ftype%253D2%2526query%253D%25E6%25B7%2598%25E5%25AE%259D%25E5%25AE%25A2%2526ie%253Dutf8&v=5

Hezone 2017/2/22 13:07:23
验证码地址 http://weixin.sogou.com/antispider/util/seccode.php?tc=1487739796



*/






























