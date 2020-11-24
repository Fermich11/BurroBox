const fs = require('fs')
const express = require('express')
const favicon = require('serve-favicon');
const path = require('path');
const config = require('./config.json')
const { WAConnection, MessageType, Mimetype} = require('@adiwajshing/baileys')


const app = express()

const conversations = {}

async function connectToWhatsApp () {
    const conn = new WAConnection() 
    
    await conn.connect ()
    const myId = conn.user.jid

    function sendText (id, message) {
        try {
            conn.sendMessage(id, message, MessageType.text)
        } catch (e) {
            console.log(`A error has been throw while trying to send a text message: ${e}`)
        }
    }
    
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

        if(text.toLowerCase() === 'ayuda') {
            conversations[id].ignore = true
            sendText(id, config.responses.help)
        }

        /*
        if (!message.key.fromMe || conversations[id].ignore == false) {
            if (conversations[id]) {
                if (conversations[id].cp) {
                    if(conversations[id].address) {
                        const re = new RegExp('(.*) ([1-9])')
                        const product = re.exec(text) 
                        console.log(text)
                    } else {
                        sendText(id, config.responses.displayMenu)
                        sendImage(id, 'menu')
                    }
                } else {
                    let re = new RegExp('[0-9][0-9][0-9][0-9][0-9]')
                    if (re.test(text)) {
                        if(validCp.includes(text)) {
                            conversations[id].cp = text
                            sendText(id, config.responses.validCp)
                        } else {
                            sendText(id, config.responses.invalidCp)
                        }
                    }
                }
            } else {
                newConversation(id)
                sendText(id, config.responses.greets)
            }
        }*/

    })

}
// run in main file
connectToWhatsApp ()
.catch (err => console.log("unexpected error: " + err) ) // catch any errors

function newConversation(id) {
    conversations[id] = {
        food: {},
        beverage: {},
        extras: {},
        address: '', 
        cp: '',
        total: 0,
        ignore: false
    }
} 

// Express

const itemsTemplate = fs.readFileSync(__dirname + '/src/order-item/item.html', 'utf8')
app.get('/order', function (req, res) {
    fs.readFile(__dirname + '/src/order-page/order.html', 'utf8', (err, html) => {
        let inlet = ''
        let burros = ''
        config.burrobox.food.inlet.forEach((item) => {
            let itemTemplate = itemsTemplate;
            itemTemplate = itemTemplate.replace('{name}', item.name)
            itemTemplate = itemTemplate.replace('{price}', item.price)
            inlet = inlet.concat(itemTemplate)
        })

        config.burrobox.food.inlet.forEach((item) => {
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

app.use(favicon(__dirname + '/src/img/burro_bot.png'))
  
app.listen(process.env.PORT || 3000)