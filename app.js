const request = require("superagent")
const express = require("express")
const api = express()
const fs = require("fs")
const bodyParser = require("body-parser")
const electron = require("electron")
const BrowserWindow = electron.BrowserWindow
const app = electron.app
const ipc = electron.ipcMain
const session = electron.session
const q = require('q')
var defer = q.defer();

var test = null 

let win
let win_two
var GetCookies = ''
function createWindow(){
	win = new BrowserWindow({
		width:800,
		height:650
	})
	url = "https://account.sogou.com/connect/login?provider=qq&client_id=2017&ru=http%3A%2F%2Fweixin.sogou.com%2Fpcindex%2Flogin%2Fqq_login_callback_page.html&hun=0&oa=0"
	win.loadURL(url)
	win.webContents.on("devtools-closed",function(error,cookie){
		session.defaultSession.cookies.get({"*.sougou.com","weixin.sougou.com"},function(error,cookie){
			console.log(cookie,"asasasas")
			for(i=0;i<cookie.length;i++){
				if((i+1) == cookie.length){
					GetCookies += cookie[i].name+"=" + cookie[i].value
				}else{
					GetCookies += cookie[i].name+"=" + cookie[i].value+"; "
				}
			}
			win.close()	
		})
	})
	win.webContents.openDevTools()
	//win.hide()

	win_two = new BrowserWindow({
		width:800,
		height:650
	})
	win_two.loadURL("file://"+__dirname+"/index.html")
}



//http://weixin.sogou.com/

var GetData

ipc.on('query',function(error,success){
	url = "http://weixin.sogou.com/weixin?type=2&query=php&ie=utf8"
	request.get(url)
		.set('Cookie',GetCookies)
		.set('Referer','http://weixin.sogou.com/')
		.set('User-Agent','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2922.1 Safari/537.36')
		.end(function(error,success){
			data = Reg(success.text,/<a class="account" target="_blank" id=".*" i="(.*)" href="(.*)" data-headimage=".*" data-isV="[\d]" uigs=".*">(.*)<\/a>/g)
			i = Reg(success.text,/id="[\w_]+" d="([\w-]+)">/g)
			url_data = Reg(success.text,/var article_anti_url = "(.*)";[\s\S]*var account_anti_url = "(.*)";/g)
			var article_anti_url
			var account_anti_url

			request.get("http://weixin.sogou.com"+url_data[0][1])
				.set('Cookie',GetCookies)
				.set('User-Agent','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2922.1 Safari/537.36')
				.end(function(error,success){
					article_anti_url = success.text
					console.log(test)

				})

			request.get("http://weixin.sogou.com"+url_data[0][2])
				.set('Cookie',GetCookies)
				.set('User-Agent','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2922.1 Safari/537.36')
				.end(function(error,success){
					account_anti_url = success.text
					console.log(article_anti_url)
				})

			for(v=0;v<data.length;v++){
				data[v][0] = i[v][1]
				//data[v].push()
				//data[v].push("http://weixin.sogou.com/"+url_data[v][2])
			}
			
			data.push(article_anti_url)
			data.push(account_anti_url)
			win_two.webContents.send('query',test)
		})
})

ipc.on('test',(error,success)=>{
	//win.show()
	var url = "http://weixin.sogou.com/home?stype=2"
	request.get(url)
		.set('Cookie',GetCookies)
		.set('User-Agent','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2922.1 Safari/537.36')
		.end((error,success)=>{
			win_two.webContents.send('test',success.text)
		})
})

app.on('ready',createWindow)
app.on('window-all-colsed',function(){
    app.quit()
})

function Reg(data,myReg){
    var patt = new RegExp(myReg)
    var ret_test = patt.test(data);
    if(ret_test){
		var reg_data =  []
		while(res = myReg.exec(data)){  
			reg_data.push(res)
		}   
		return reg_data
    }
    return false
}



/**
cert=(new Date).getTime()+Math.random()
http://mp.weixin.qq.com/mp/verifycode?cert=1483768186524.0317

验证码
http://mp.weixin.qq.com/mp/verifycode
post
cert=1483768235902.57&input=lbag

Content-Type:application/x-www-form-urlencoded; charset=UTF-8
Cookie:sig=h017f21b3a05d1f022387614726546e825133940a4a8dcf1a16d07d83804980d0f2970872c976cf392e
Host:mp.weixin.qq.com
Origin:http://mp.weixin.qq.com
Referer:http://mp.weixin.qq.com/profile?src=3&timestamp=1483767534&ver=1&signature=V0wozFZdx0lZBvRe5*BzzGXJ*X08TOBGbuehTJNvqCzzdh84vC1oQq8LRoxi9Wv4*ak9flf2wfarj*cs-9I3gg==

<a class="account" target="_blank" id="sogou_vr_11002601_account_4" i="oIWsFt-Xz10l_yFz91hEX70U4cyo" href="http://mp.weixin.qq.com/profile?src=3&amp;timestamp=1483767534&amp;ver=1&amp;signature=oK9VWPVetHUJY-UViNdwNxIColuO0Nc78tnyj6O-GaOBjauzO-5YdqE7YHySl0uqyaVMRWlQHoDir-ZclnECRQ==" data-headimage="http://wx.qlogo.cn/mmhead/Q3auHgzwzM5BLvuial7AFribHwZ0ThCpUJv6dAeLJicjllwM4wfWLfLYA/0" data-isV="1" uigs="main_toweixin_article_account_4">安全圈</a>
<a class="account" target="_blank" id="sogou_vr_11002601_account_3" i="oIWsFt1oMnHI0TmYy4lUVGEuGRWA" href="http://mp.weixin.qq.com/profile?src=3&amp;timestamp=1483767534&amp;ver=1&amp;signature=DnWAntcCMbu9EySgu-R418pnrTQUBS0pG77wJr71k8nh1kNhepFv7gLY6DqPpwMbLrdcMaMuB3ltR2ZI0tmq6g==" data-headimage="http://wx.qlogo.cn/mmhead/Q3auHgzwzM4uWtVxYwenuduurdMic2NMZwdOt3zSibWF88hV0RICZIVw/0" data-isV="0" uigs="main_toweixin_article_account_3">PHP技术大全</a>


//导入body中间件
api.use(bodyParser.json())
api.use(bodyParser.urlencoded({extended:false}))
var urlencodedParser = bodyParser.urlencoded({extended:false})

api.get('/',urlencodedParser,function(req,res){
	console.log('test')
	console.log(GetCookies)
	url = "http://weixin.sogou.com/home"
	request.get(url)
		.set('Cookie',GetCookies)
		.set('Referer','http://weixin.sogou.com/')
		.set('User-Agent','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2922.1 Safari/537.36')
		.end(function(error,success){
			res.send(success)
		})
	//res.end("success")
})

var server = api.listen(2017,function(){
	var host = server.address().address
	var port = server.address().port
	console.log("酷Q采集服务已开启提交地址为 http://%s:%s", host, port)
})

￥kIfA6z6Ozs￥ http://c.b0wr.com/h.XoK8WH?cv=kIfA6
￥5Gkm6zPwnF￥ http://c.b0wr.com/h.XoI0qZ?cv=5Gkm6zPwnF	
￥z7Tj6zvxB1￥ http://c.b0wr.com/h.XoFynm?cv=z7Tj6zvxB1
￥vsWs6ATEx2￥ http://c.b0wr.com/h.XoBlh7?cv=vsWs6ATEx2

淘宝商品:2016冬季新款显瘦毛呢外套女韩版修身茧型中长款加厚羊毛呢子大衣 http://b.mashort.cn/h.XLVRF2?sm=ddf29f (👉👉👉复制整段信息，打开手机淘宝可直接访问👈👈👈)

#淘⼝令#长按复制这条信息，打开手机淘宝即可看到【2016冬季新款显瘦毛呢外套女韩版修身茧型中长款加厚羊毛呢子大衣 】http://b.mashort.cn/h.XLVRF2?sm=ddf29f 
复制这条信息，打开👉手机淘宝👈即可看到【2016冬季新款显瘦毛呢外套女韩版修身茧型中长款加厚羊毛呢子大衣】￥ExWihamt5N￥http://c.b0wr.com/h.XLUf3H?cv=ExWihamt5N&sm=35f0bb

http://c.b0wr.com/h.XoK8WH?cv=5Gkm6zPwnF	
HP/惠普 346 G3 W8J10PT 游戏笔记本电脑 i5 1T 2G独显金色14英寸 http://m.tb.cn/G.Bwhu

*/

