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
const async = require('async')

let win 
let login
let code
var GetCookies = ''
function CreateWindow(){
	win = new BrowserWindow({
		width:800,
		height:700,
		title:"test"
	})
	win.loadURL(`file://${__dirname}/index.html`)
	win.webContents.openDevTools()
	win.hide()
	login = new BrowserWindow({
		width:800,
		height:700,
		title:"登录搜狗微信"
	})

	LoginUrl = "https://account.sogou.com/connect/login?provider=qq&client_id=2017&ru=http%3A%2F%2Fweixin.sogou.com%2Fpcindex%2Flogin%2Fqq_login_callback_page.html&hun=0&oa=0"
	login.loadURL(LoginUrl)
	login.webContents.on('devtools-closed',(error,success)=>{
		GetCookie()
	})
	login.webContents.openDevTools()
}

app.on('ready',CreateWindow)

app.on('window-all-colsed',function(){
    app.quit()
})


function GetCookie(){
	session.defaultSession.cookies.get({},(error,cookie)=>{
		for(i=0;i<cookie.length;i++){
			if((i+1) == cookie.length){
				GetCookies += cookie[i].name+"=" + cookie[i].value
			}else{
				GetCookies += cookie[i].name+"=" + cookie[i].value+"; "
			}
		}
		if(/ppinf/.test(GetCookies)){
			console.log(GetCookies)
			console.log("Login Success!")
			win.show()
			win.webContents.send('cookies',GetCookies)
			login.close()
		}else{
			win.webContents.send('error',"登录失败请重新登录，或者切换到账号密码登录！")
			login.webContents.reload()
		}
	})
}


ipc.on("code",(error,success) => {
	code = new BrowserWindow({
		width:800,
		height:700,
		title:"搜狗数据采集"
	})
	code.loadURL(success)
	console.log(success)
})

/*
{"code": 0,"msg": "解封成功，正在为您跳转来源地址...", "id": "7F2AB15025206F6F7AC489A426C3E2AD"}  id 等于 SNUID     还要 SUV 取 SUIR 字段时间 加上123123456 


Cookie: ABTEST=7|1487957620|v1; IPLOC=CN; SUID=590C97752930990A0000000058B06E74; PHPSESSID=p2dlttfoproqnsb6rod1h6nff5; SUIR=1487957620; SUV=1487957620123123456; SNUID=E5B72BC9BBBEF2F19EEE171BBC8BB094; seccodeRight=success; successCount=1|Fri, 24 Feb 2017 17:36:51 GMT; refresh=1
cookie: IPLOC=CN; SUIR=1487957714; SUV=1487957714123123456; ABTEST=0|1487957714|v1; SUID=590C97752930990A0000000058B06ED2; PHPSESSID=fb2icja3db9qpe2flh9ku89oj3

; seccodeRight=success; successCount=1|Fri, 24 Feb 2017 17:51:38 GMT; refresh=1

http://pb.sogou.com/pv.gif?uigs_productid=webapp&type=antispider&subtype=0_seccodeInputSuccess&domain=weixin&suv=000D178C75970C5958B062A6529B9220&snuid=6431AB483C397575610815813DF8D090&t=1487954187273
http://pb.sogou.com/pv.gif?uigs_productid=webapp&type=antispider&subtype=close_refresh&domain=weixin&suv=000D178C75970C5958B062A6529B9220&snuid=&t=1487954588950
*/