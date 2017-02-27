'use strict'
/*
 * 各个区域配置项
 */

var config = {
	r:/<input\stype="hidden"\sname="r"\sid="from"\svalue="(.*?)"\s>/,//搜索页面r值Reg
	seccodeImage:/<img\sid="seccodeImage"\sonload="setImgCode\([\d]\)"\sonerror="setImgCode\([\d]\)"\ssrc="(.*?)"\swidth="100"/,//搜索页面验证码地址
	so_username:/i="(.*?)"\shref="(.*?)"\sdata-headimage="(.*?)"\sdata-isV="[\d]"\suigs=".*?">(.*?)<\/a>/g,//搜索页面公众号名称
	so_ArticleTitle:/<a\starget="_blank"\shref="(.*?)"\sdata-url=".*?"\sid="[\w_?]+"\suigs="article_title_[\d]">(.*?)<\/a>/g,//获取搜索页面文章标题和链接
	account_anti_url:/\svar\saccount_anti_url\s=\s"(.*?)"/
} 

module.exports = config