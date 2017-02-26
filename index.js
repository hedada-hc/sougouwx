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
			if(cookie[i].domain == ".sogou.com" || cookie[i].domain == "weixin.sogou.com"){
				if((i+1) == cookie.length){
					GetCookies += cookie[i].name+"=" + cookie[i].value
				}else{
					GetCookies += cookie[i].name+"=" + cookie[i].value+"; "
				}
				console.log(cookie[i].domain)
			}
		}
		if(/ppinf/.test(GetCookies)){
			//console.log(GetCookies)
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

http://weixin.sogou.com/weixin?type=2&query=%E6%B7%98%E5%AE%9D%E5%AE%A2&ie=utf8
/weixin%3Ftype%3D2%26query%3D%u6DD8%u5B9D%u5BA2%26ie%3Dutf8

%2Fweixin%3Ftype%3D2%26query%3D%E6%B7%98%E5%AE%9D%E5%AE%A2%26ie%3Dutf8
http://weixin.sogou.com/antispider/?from=%2fweixin%3Ftype%3d2%26query%3d%E6%B7%98%E5%AE%9D%E5%AE%A2%26ie%3dutf8




ABTEST=4|1485576369|v1; SNUID=5C920CE99C99D5E9D2DBB4539C7EDEF4 SUID=F89B2AAB541C940A00000000588C18B2; SUV=008A1783AB2A9BF8588C18B263B91844; IPLOC=CN; ppinf=5|1488129792|1489339392|dHJ1c3Q6MToxfGNsaWVudGlkOjQ6MjAxN3x1bmlxbmFtZTo2Okhlem9uZXxjcnQ6MTA6MTQ4ODEyOTc5MnxyZWZuaWNrOjY6SGV6b25lfHVzZXJpZDo0NDpEMENBNDQ3ODQ2QzgxNkE4QzQxNzg0MDg5MUFFNEUzOEBxcS5zb2h1LmNvbXw; pprdig=cyTCnOtJdfCfXC4VLZLqV98ejvzFzTossdU7DMMoCxQCwo2-HtqEahiTub6Qsf-myUxTooVjrxudt30tCxKiIJimRCIfPni3GSwMw4kaZFTlkQC5WysrKSiKeXvGxxRWVutEGMj2BXh968qNBz88JpP77jD9gt7SlastMlz58tk; ppmdig=1488129792000000e911a42ad822bc7b806e9082569304c1; PHPSESSID=ns6hkljq811s5a5740ijqmk251; SUV=1488130069123123456
*/