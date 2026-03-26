const { spawn } = require("child_process")
const ora = require("ora")
const fs = require("fs")
const os = require("os")
const path = require("path")

const chalk = require("chalk")
const logSymbols = require("log-symbols")

const install = require("./install")

module.exports = async function(templateInfo, projectName, options){
    const targetPath = path.resolve(process.cwd(), projectName)
    const spinner = ora(`正在拉取模板 ${templateInfo.path} ...`).start()

    try{
        await download(templateInfo, targetPath)
        spinner.succeed("项目模板下载成功")
    }catch(error){
        spinner.fail("项目模板下载失败")
        throw error
    }

    applyTemplateMetadata(targetPath, templateInfo, options)
    console.log(logSymbols.success, chalk.green("模板变量已写入"))

    if(options.installDependencies){
        await install(targetPath, options.packageManager)
    }else{
        console.log(logSymbols.info, chalk.yellow("已跳过依赖安装"))
    }

    printNextSteps(projectName, options.packageManager, options.installDependencies)
}

async function download(templateInfo, targetPath){
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "ljw-cli-"))
    const tempClonePath = path.join(tempRoot, "template")

    try{
        await cloneRepository(templateInfo.path, templateInfo.ref, tempClonePath)
        removeGitMetadata(tempClonePath)
        fs.cpSync(tempClonePath, targetPath, { recursive: true })
    }finally{
        fs.rmSync(tempRoot, { recursive: true, force: true })
    }
}

function applyTemplateMetadata(targetPath, templateInfo, options){
    updatePackageJson(targetPath, options)
    updateLockFiles(targetPath, options)

    const replacePairs = []
    if(templateInfo.templateName){
        replacePairs.push({
            from: templateInfo.templateName,
            to: options.projectName
        })
    }

    if(replacePairs.length > 0){
        replaceTextFiles(targetPath, replacePairs)
    }
}

function updatePackageJson(targetPath, options){
    const packagePath = path.join(targetPath, "package.json")
    if(!fs.existsSync(packagePath)){
        return
    }

    const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"))
    packageJson.name = options.projectName
    setOptionalTextField(packageJson, "description", options.description)
    setOptionalTextField(packageJson, "author", options.author)

    fs.writeFileSync(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`, "utf8")
}

function updateLockFiles(targetPath, options){
    if(options.packageManager !== "npm"){
        removeFileIfExists(path.join(targetPath, "package-lock.json"))
        return
    }

    const lockPath = path.join(targetPath, "package-lock.json")
    if(!fs.existsSync(lockPath)){
        return
    }

    const lockJson = JSON.parse(fs.readFileSync(lockPath, "utf8"))
    lockJson.name = options.projectName

    if(lockJson.packages && lockJson.packages[""]){
        lockJson.packages[""].name = options.projectName
        setOptionalTextField(lockJson.packages[""], "description", options.description)
    }

    fs.writeFileSync(lockPath, `${JSON.stringify(lockJson, null, 2)}\n`, "utf8")
}

function setOptionalTextField(target, fieldName, value){
    if(value == null){
        return
    }

    const normalizedValue = typeof value === "string" ? value.trim() : value
    if(normalizedValue === ""){
        delete target[fieldName]
        return
    }

    target[fieldName] = normalizedValue
}

function removeFileIfExists(filePath){
    if(fs.existsSync(filePath)){
        fs.rmSync(filePath, { force: true })
    }
}

function replaceTextFiles(rootPath, replacePairs){
    const fileExtensions = new Set([
        ".css",
        ".html",
        ".js",
        ".json",
        ".md",
        ".svg",
        ".ts",
        ".txt",
        ".vue",
        ".yml",
        ".yaml"
    ])

    walkDirectory(rootPath, (filePath) => {
        const extension = path.extname(filePath).toLowerCase()
        if(!fileExtensions.has(extension)){
            return
        }

        const content = fs.readFileSync(filePath, "utf8")
        let updatedContent = content

        replacePairs.forEach((pair) => {
            updatedContent = updatedContent.split(pair.from).join(pair.to)
        })

        if(updatedContent !== content){
            fs.writeFileSync(filePath, updatedContent, "utf8")
        }
    })
}

function cloneRepository(repositoryUrl, ref, targetPath){
    const args = ["clone", "--depth", "1"]
    if(ref){
        args.push("--branch", ref)
    }
    args.push(repositoryUrl, targetPath)

    return runCommand("git", args).catch((error) => {
        if(error.code === "ENOENT"){
            throw new Error("未检测到 git 命令，请先安装 Git 并确保 git 已加入 PATH")
        }

        throw error
    })
}

function removeGitMetadata(targetPath){
    removeFileIfExists(path.join(targetPath, ".gitmodules"))
    fs.rmSync(path.join(targetPath, ".git"), { recursive: true, force: true })
}

function runCommand(command, args){
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, {
            stdio: ["ignore", "pipe", "pipe"],
            windowsHide: true
        })
        let stderr = ""

        child.stderr.on("data", (chunk) => {
            stderr += chunk.toString()
        })

        child.on("error", (error) => {
            reject(error)
        })

        child.on("close", (code) => {
            if(code === 0){
                resolve()
                return
            }

            const message = stderr.trim() || `命令执行失败：${command} ${args.join(" ")}`
            reject(new Error(message))
        })
    })
}

function walkDirectory(currentPath, callback){
    const entries = fs.readdirSync(currentPath, { withFileTypes: true })

    entries.forEach((entry) => {
        if(entry.name === ".git" || entry.name === "node_modules" || entry.name === "dist"){
            return
        }

        const entryPath = path.join(currentPath, entry.name)
        if(entry.isDirectory()){
            walkDirectory(entryPath, callback)
            return
        }

        callback(entryPath)
    })
}

function printNextSteps(projectName, packageManager, installDependencies){
    console.log("")
    console.log(chalk.cyan("下一步："))
    console.log(chalk.cyan(`  cd ${projectName}`))
    if(!installDependencies){
        console.log(chalk.cyan(`  ${getInstallCommand(packageManager)}`))
    }
    console.log(chalk.cyan(`  ${getRunDevCommand(packageManager)}`))
}

function getInstallCommand(packageManager){
    if(packageManager === "yarn"){
        return "yarn"
    }

    return `${packageManager} install`
}

function getRunDevCommand(packageManager){
    if(packageManager === "npm"){
        return "npm run dev"
    }

    return `${packageManager} dev`
}
