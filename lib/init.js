const template = require("./template")
const chalk = require("chalk")
const inquirer = require("inquirer")
const download = require("./download")
const childProcess = require("child_process")
const fs = require("fs")
const path = require("path")

module.exports = async function (templateName,projectName) {
    const nameList = getTemplateNameList()
    let chosenTemplateName = templateName
    let currentProjectName = projectName
    let templateInfo = template[chosenTemplateName]

    if(!chosenTemplateName || !templateInfo){
        if(chosenTemplateName && !templateInfo){
            console.log(chalk.red(`模板【${templateName}】不存在`))
        }
        console.log("")
        const answers = await inquirer.prompt([
            {
                name:"chooseTemplate",
                type:"list",
                message:"请选择可用模板：",
                choices: nameList
            },
            {
                name:"inputProjectName",
                type:"input",
                message:"请输入项目名：",
                default:"my-app",
                validate: validateProjectNameAndPath
            }
        ])

        chosenTemplateName = answers.chooseTemplate
        currentProjectName = answers.inputProjectName.trim()
        templateInfo = template[chosenTemplateName]
    }

    if(!currentProjectName){
        const answer = await inquirer.prompt([
            {
                name:"projectName",
                type:"input",
                message:"请输入项目名：",
                default:"my-app",
                validate: validateProjectNameAndPath
            }
        ])
        currentProjectName = answer.projectName.trim()
    }else{
        currentProjectName = currentProjectName.trim()
        const validationResult = validateProjectNameAndPath(currentProjectName)
        if(validationResult !== true){
            throw new Error(validationResult)
        }
    }

    const metadataAnswers = await inquirer.prompt([
        {
            name:"description",
            type:"input",
            message:"请输入项目简介：",
            default:""
        },
        {
            name:"author",
            type:"input",
            message:"请输入作者名称：",
            default:getDefaultAuthor()
        },
        {
            name:"packageManager",
            type:"list",
            message:"请选择包管理器：",
            default: templateInfo.packageManager || "npm",
            choices: ["npm", "pnpm", "yarn"]
        },
        {
            name:"installDependencies",
            type:"confirm",
            message:"是否立即安装依赖？",
            default:true
        }
    ])

    await download(templateInfo, currentProjectName, {
        author: normalizeOptionalText(metadataAnswers.author),
        description: normalizeOptionalText(metadataAnswers.description),
        installDependencies: metadataAnswers.installDependencies,
        packageManager: metadataAnswers.packageManager,
        projectName: currentProjectName
    })
}

function getTemplateNameList(){
    let list = []
    for( let name in template){
        list.push(name)
    }
    return list
}

function validateProjectNameAndPath(projectName){
    if(!projectName){
        return "项目名不能为空"
    }

    if(!/^[a-z0-9][a-z0-9._-]*$/.test(projectName)){
        return "项目名只能包含小写字母、数字、点、短横线和下划线，且必须以字母或数字开头"
    }

    const targetPath = path.resolve(process.cwd(), projectName)
    if(fs.existsSync(targetPath)){
        const stat = fs.statSync(targetPath)
        if(!stat.isDirectory()){
            return `目标路径已存在且不是目录：${projectName}`
        }

        const files = fs.readdirSync(targetPath)
        if(files.length > 0){
            return `目标目录已存在且非空：${projectName}`
        }
    }

    return true
}

function getDefaultAuthor(){
    const envAuthor = process.env.npm_config_init_author_name
    if(envAuthor){
        return envAuthor
    }

    const gitUserName = getGitConfig("user.name")
    const gitUserEmail = getGitConfig("user.email")
    if(gitUserName && gitUserEmail){
        return `${gitUserName} <${gitUserEmail}>`
    }

    return gitUserName || ""
}

function getGitConfig(configKey){
    try{
        return childProcess.execSync(`git config --get ${configKey}`, {
            stdio: ["ignore", "pipe", "ignore"]
        }).toString().trim()
    }catch(error){
        return ""
    }
}

function normalizeOptionalText(value){
    if(typeof value !== "string"){
        return value
    }

    return value.trim()
}
