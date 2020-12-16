const fs = require('fs')
const QRCode = require('qrcode')
const express = require('express')
const favicon = require('serve-favicon');
const config = require('./config.json')
const { WAConnection, MessageType, Mimetype} = require('@adiwajshing/baileys');
const appUrl = 'https://burrobot12.herokuapp.com'
const app = express()

async function runServer() {
    let qr;
    const conn = new WAConnection() 

    conn.on('qr', newQr => qr = newQr)    

    function sendText (id, message) {
        try {
            conn.sendMessage(id, message, MessageType.text, {detectLinks: true})
        } catch (e) {
            console.log(`A error has been throw while trying to send a text message: ${e}`)
        }
    }
    

    console.log(qr)
    function sendImage (id, filename) {
        try {
            const buffer = fs.readFileSync(`Media/${filename}.jpeg`) // load some gi
            const options = { mimetype: Mimetype.jpeg, caption: '' }
            conn.sendMessage(id, buffer, MessageType.image, options)
        } catch (e) {
            console.log(`A error has been throw while trying to send a text message: ${e}`)
        }
    }

    conn.on('message-new', (message) => {
        const id = message.key.remoteJid
        const text = message.message.conversation

        if(!message.key.fromMe) {
            if(text.toLowerCase() === 'ayuda') {
                sendText(id, 'No se como ayudarte')
            } else {
                sendText(id, 'Preciona el siguiente link para ordenar')
                sendText(id, `${appUrl}/order-page?id=${id}`)
            }
        }
    })

    // Express
    const itemsTemplate = fs.readFileSync(__dirname + '/src/order-item/item.html', 'utf8')
    app.get('/order-page', function (req, res) {
        fs.readFile(__dirname + '/src/order-page/order.html', 'utf8', (err, html) => {
            let inlet = ''
            let burros = ''
            config.burrobox.food.inlet.forEach((item) => {
                let itemTemplate = itemsTemplate;
                itemTemplate = itemTemplate.replace('{name}', item.name)
                itemTemplate = itemTemplate.replace('{price}', item.price)
                inlet = inlet.concat(itemTemplate)
            })

            config.burrobox.food.burros.forEach((item) => {
                let itemTemplate = itemsTemplate;
                itemTemplate = itemTemplate.replace('{name}', item.name)
                itemTemplate = itemTemplate.replace('{price}', item.price)
                burros = burros.concat(itemTemplate)
            })

            html = html.replace('{inlet}', inlet)
            html = html.replace('{burros}', burros)

            res.set('Content-Type', 'text/html')
            res.send(html)
        })
    })

    app.post('/order', (req, res) => {
        sendText('8114808469@s.whatsapp.net', 'Su orden esta en proceso')
    }) 

    app.get('/src/*/', function (req, res) {
        fs.readFile(`.${req.path}`, (err, file) => {
            if (err) {
                console.log(err)
            }

            try {
                res.send(file)
            } catch (e) {
                res.status(e.status).end()
            }
        })
    })

    app.get('/qr', (req, res) => {
        QRCode.toFile(__dirname + '/src/img/scan.qr', qr).then(file => {
            const html = `<html><image src="/src/img/scan.png" width="500"></html>`
            res.set('Content-Type', 'text/html')
            res.send(html)
        })
    })

    app.use(favicon(__dirname + '/src/img/burro_bot.png'))
    
    app.listen(process.env.PORT || 3000)
    await conn.connect ()
}

runServer().catch(e => console.log)