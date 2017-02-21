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
