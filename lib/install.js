/*
 * @Author: your name
 * @Date: 2020-07-14 19:49:45
 * @LastEditTime: 2020-07-14 20:38:57
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \workspace\luo-cli\lib\install.js
 */ 
const ora = require("ora")
const child_process = require('child_process');

 module.exports = function(projectName){
    let spinner =  ora("Installing package...").start()
    process.chdir(projectName)
    
    //使用子进程来执行命令
    let install =  child_process.exec("npm install")
    install.on('exit', function (code) {
        if(code === 0){
            spinner.succeed("Install Package Succeed")
        }else{
            spinner.fail("Install Package Failed")
        }     
    });

 }