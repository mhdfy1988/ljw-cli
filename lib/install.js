
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