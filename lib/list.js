/*
 * @Author: your name
 * @Date: 2020-07-14 10:04:01
 * @LastEditTime: 2020-07-14 14:12:57
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \workspace\luo-cli\lib\list.js
 */ 
const template = require("./template")
const chalk = require("chalk")

 module.exports = function (){
    console.log("")
    console.log(" 可用模板列表：")
    for(let name in template){
        console.log(chalk.green(`  ${name}    ${template[name].desc}`))
    }
 }