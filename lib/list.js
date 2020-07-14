
const template = require("./template")
const chalk = require("chalk")

 module.exports = function (){
    console.log("")
    console.log(" 可用模板列表：")
    for(let name in template){
        console.log(chalk.green(`  ${name}    ${template[name].desc}`))
    }
 }