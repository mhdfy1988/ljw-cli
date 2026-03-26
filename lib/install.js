const ora = require("ora")
const { spawn } = require("child_process")

module.exports = function(projectPath, packageManager){
    const spinner = ora(`正在使用 ${packageManager} 安装依赖...`).start()
    spinner.stop()

    return new Promise((resolve, reject) => {
        const installProcess = spawn(
            getPackageManagerCommand(packageManager),
            getInstallArguments(packageManager),
            {
                cwd: projectPath,
                stdio: "inherit"
            }
        )

        installProcess.on("error", (error) => {
            ora().fail("依赖安装失败")
            reject(error)
        })

        installProcess.on("close", (code) => {
            if(code === 0){
                ora().succeed("依赖安装完成")
                resolve()
                return
            }

            ora().fail("依赖安装失败")
            reject(new Error(`依赖安装失败，退出码：${code}`))
        })
    })
}

function getPackageManagerCommand(packageManager){
    if(process.platform === "win32"){
        return "cmd.exe"
    }

    return packageManager
}

function getInstallArguments(packageManager){
    if(process.platform === "win32"){
        return ["/d", "/s", "/c", `${packageManager}.cmd install`]
    }

    return ["install"]
}
