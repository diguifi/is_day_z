const puppeteer = require('puppeteer')
const express = require('express')
const app = express()
const port = process.env.PORT || 3000;

app.get('/', async (req, res) => {
    const {id} = req.query
    if(!id) {
        res.status(400).send("Bad request: 'id' param is missing!")
        return
    }

    const url = `https://www.battlemetrics.com/servers/dayz/${id}`

    try {
        const serverInfo = await getServerTime(url)
        const response = generateResponse(serverInfo)

        res.status(200).send(response)
    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }
})

async function getServerTime(pageUrl) {
    const browser = await puppeteer.launch({
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
        ],
      })
    const page = await browser.newPage()
    await page.goto(pageUrl)

    const serverTime = await page.evaluate(() => document.getElementsByTagName('dd')[7].innerText)
    let serverIp = await page.evaluate(() => document.getElementsByTagName('dd')[2].innerText)
    serverIp = serverIp.substring(0, serverIp.indexOf(' (Game Port)'))

    await browser.close()
  
    return {time: serverTime, ip: serverIp }
}

function generateResponse(result) {
    let stringResult = result.time.toString()
    let isDay = +stringResult.substring(0,2) > 6 && +stringResult.substring(0,2) < 17

    let jsonString = `{`+
        `"ip":"${result.ip}",` +
        `"time": "${result.time}",`+
        `"isDay": "${isDay}"` +
    `}`
    return JSON.parse(jsonString)
}

app.listen(port, () => console.log(`listening on port ${port}!`))