/*
 * @Author: your name
 * @Date: 2020-07-14 16:26:46
 * @LastEditTime: 2020-07-14 20:27:50
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \workspace\luo-cli\lib\download.js
 */ 
const download = require("download-git-repo");
const ora = require("ora")
const inquirer = require("inquirer")

const handlebars = require('handlebars');    
const  fs = require("fs") 

const chalk = require("chalk")
const logSymbols = require("log-symbols")

const install = require("./install")

 module.exports = function(templateUrl,projectName){
    projectName = projectName||"test"

    const spinner = ora('正在拉取模板...').start()

    download(templateUrl,projectName,{ clone: false },err =>{
        if(err){
            spinner.fail('项目模板下载失败');
        }else{
            spinner.succeed('项目模板下载成功');
            
            //修改package.json文件
            inquirer.prompt([{
                name:"description",
                type:"input",
                message:"请输入项目简介：",
                default: ""
            },{
                name:"author",
                type:"input",
                message:"请输入作者名称：",
                default:""
            }]).then(as=>{
                as['name'] = projectName
                
                //读取文件
                let  packageContent = fs.readFileSync(`${projectName}/package.json`,'utf8');
                //利用模板引擎修改package.json
                let packageResult = handlebars.compile(packageContent)(as)
                //写入结果
                fs.writeFileSync(`${projectName}/package.json`,packageResult)
                
                //install package
                install(projectName)
                
            })
        }
    })
 }