const logger = require('../helpers/logger')
const iconv = require('iconv-lite')
const {shares, credential} = require('../config')

const Shell = require('node-powershell');
const ps = new Shell({
  executionPolicy: 'Bypass',
  noProfile: true
});

ps.addCommand(`[Console]::OutputEncoding = [System.Text.Encoding]::GetEncoding("utf-8")`)

// Информационная точка входа
module.exports.home = (req, res) => {
    logger.info(`Visit home page with GET request`)
    res.json({message: 'Only POST methods available'})
}


// API приложения
module.exports.api = async (req, res, next) => {
    // Объявления шаблона ответа
    const result = {
        status: 500,
        json: {}
    }
    let shareInConfig = false

    // Шаблон сессии PowerShell
    ps.addCommand(`$password = ConvertTo-SecureString '${credential.password}' -AsPlainText -Force`)
    ps.addCommand(`$credential = New-Object System.Management.Automation.PSCredential ('${credential.username}', $password)`)


    // Проверка обязательных полей в запросе
    if( req.body.type ) {
        if(req.body.type === 'enable') {
        // Создание сетевой папки
            result.json.type = req.body.type
            let shareDetail = null
            shares.forEach(share => {
                if(share.name === req.body.name) {
                    shareInConfig = true
                    shareDetail = share
                }
            })
            if(shareInConfig){
                try {
                    ps.addCommand(`$errorActionPreference = "SilentlyContinue"`)
                    ps.addCommand(`$session = New-PSSession -ComputerName ${shareDetail.computername} -Credential $credential`)
                    ps.addCommand(`Invoke-Command -ScriptBlock { Write-Host (Get-SmbShare -Name ${shareDetail.shareName} | measure).Count -NoNewline} -Session $session`)
                    const isShareExist = await ps.invoke()
                    if(isShareExist === "1"){
                        result.status = 409
                        result.json.message = "Share already exist"
                    } else {
                        ps.addCommand(`$errorActionPreference = "Continue"`)
                        ps.addCommand(`Invoke-Command -ScriptBlock { New-SmbShare -Name "${shareDetail.shareName}" -Path "${shareDetail.path}" -Description "${shareDetail.description}" -FullAccess ${shareDetail.FullAccess} | select Name, Path, Description | ConvertTo-Json } -Session $session`)
                        try {
                            const newShare = JSON.parse(await ps.invoke())
                            logger.info(newShare)
                            result.status = 201
                            result.json.type = req.body.type
                            result.json.message = 'Created'
                            result.json.data = newShare
                        } catch (err) {
                            logger.error(err)
                            result.json.message = "Failed. More details on server."
                        }
                    }
                } catch (err) {
                    logger.error(err)
                    result.json.message = "Failed. More details on server."
                }
            } else {
                result.status = 404
                result.json.message = "Share not found in config"
            }
        } else if (req.body.type === 'disable') {
            // Удаление сетевой папки
            result.json.type=req.body.type
            let shareDetail = null
            shares.forEach(share => {
                if(share.name === req.body.name) {
                    shareInConfig = true
                    shareDetail = share
                }
            })

            if(shareInConfig){
                try {
                    ps.addCommand(`$errorActionPreference = "SilentlyContinue"`)
                    ps.addCommand(`$session = New-PSSession -ComputerName ${shareDetail.computername} -Credential $credential`)
                    ps.addCommand(`Invoke-Command -ScriptBlock { Write-Host (Get-SmbShare -Name ${shareDetail.shareName} | measure).Count -NoNewline} -Session $session`)
                    const isShareExist = await ps.invoke()
                    if(isShareExist === "0"){
                        result.status = 404
                        result.json.message = `Sharename "${shareDetail.shareName}" not found`
                    } else {
                        logger.info(`Invoke-Command -ScriptBlock {Remove-SmbShare -Name "${shareDetail.shareName}" -Force -Confirm:$false } -Session $session`)
                        ps.addCommand(`Invoke-Command -ScriptBlock {Remove-SmbShare -Name "${shareDetail.shareName}" -Force -Confirm:$false } -Session $session`)
                        try {
                            await ps.invoke()
                            result.status = 200
                            result.json.message = `Sharename "${shareDetail.shareName}" is removed`
                        } catch (err) {
                            logger.error(err)
                            result.json.message = "Failed. More details on server."
                        }

                    }
                } catch (err) {
                    logger.error(err)
                    result.json.message = "Failed. More details on server."
                }
            } else {
                result.status = 404
                result.json.message = "Share not found in config"
            }

        } else if (req.body.type === 'list') {
            if(req.body.computername){
                // Отобразить список сетевых папок
                result.json.type=req.body.type
                ps.addCommand(`Invoke-Command -ScriptBlock { Get-SmbShare | select Name, Path, Description } -Session $session | ConvertTo-Json`)
                try {
                    const list = await ps.invoke()
                    result.status = 200
                    result.json.data = JSON.parse(list)

                } catch (err) {
                    logger.error(err)
                    result.json.message = "Failed. More details on server."
                }
            } else {
                result.json.message = "Missing computername in request"
            }
        } else {
            result.status = 404
            result.json.message = "Type not found"
        }
    } else {
        result.status = 404
        result.json.message = "Missing parameters in your request"
    }
    if(result.status === 200 || result.status === 201 ) {
        logger.info(`API Key: ${req.apiName}, User: ${req.headers['user']}, Status: ${result.status}, JSON: ${JSON.stringify(result.json)}`)
    } else {
        logger.error(`API Key: ${req.apiName}, User: ${req.headers['user']}, Status: ${result.status}, JSON: ${JSON.stringify(result.json)}`)
    }
    ps.addCommand("Remove-PSSession $session")
    try {
        await ps.invoke()
        logger.info("PSSession is removed")
    } catch (err) {
        logger.error("Error during removing PSSession")
    }
    res.status(result.status).json(result.json)
}