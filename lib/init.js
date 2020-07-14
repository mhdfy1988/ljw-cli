
const template = require("./template")
const chalk = require("chalk")
const list = require("./list")
const inquirer = require("inquirer")
const download = require("./download")

module.exports = function (templateName,projectName) {  
    let nameList = getTemplateNameList()
    let templateInfo = template[templateName]

    if(!templateName || !templateInfo){
        if(templateName&&!templateInfo){
            console.log(chalk.red(`模板【${templateName}】不存在`))
        }
        console.log("")
        inquirer.prompt([{
            name:"chooseTemplate",
            type:"list",
            message:"请选择可用模板：",
            choices: nameList
        },{
            name:"inputProjectName",
            type:"input",
            message:"请输入项目名：",
            default:"test"
        }]).then(as=>{
            download(template[as.chooseTemplate].downloadPath,as.inputProjectName)
        })
    }else{
        download(templateInfo.downloadPath,projectName)
    }
 
}

function getTemplateNameList(){
    let list = []
    for( let name in template){
        list.push(name)
    }
    return list
}
