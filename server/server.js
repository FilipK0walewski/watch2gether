const express = require('express')
const http = require('http')
const WebSocket = require('ws')

const port = 5000
const hostname = '165.22.68.228'
const server = http.createServer(express)
const wss = new WebSocket.Server({ server })

//mail

const my_mail = 'kontakt@filipkowalewski.com'
const nodemailer = require('nodemailer')

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'fk.mailsender@gmail.com',
        pass: 'nodejs123'
    }
})

let mailoptions = {
    from: 'fk.mailsender@gmail.com',
    to: my_mail,
    subject: 'watch2gether',
    text: 'it works!!!'
}

const send_mail = (mailoptions, text, to=my_mail) => {
    mailoptions.text = text
    mailoptions.to = to
    transporter.sendMail(mailoptions, (error, info) =>{
    if (error){
        console.log(error)
    }
    else{
        console.log('email sent: ' + info.response)
    }
})
}

//users

const users = []
let id = 0

class User{
    constructor(nick, socket, id, time){
        this.ws = socket
        this.id = id
        this.time = time
        this.nick = nick
        this.message = {
                        send_time: 0,
                        video:{
                            id: "",
                            time: 0,
                            playing: true,
                            user_id: 0
                            },
                        type: "",
                        user:{
                            nick: nick,
                            info: ""
                        },
                        online_users:{
                            nicks: "",
                            infos: ""
                        },
                        text_message:{
                            text: "",
                            sender: ""
                        },
                        error: {
                            type: "",
                            text: ""
                        }
        }
    }

    updateVideo(){
        this.message.type = 'normal'
        this.ws.send(JSON.stringify(this.message))
    }

    getVideo(new_user){
        this.message.video.user_id = new_user
        console.log(new_user + ' is updating\n\n' + JSON.stringify(this.message) + '\n')
        this.message.type = 'return'
        this.ws.send(JSON.stringify(this.message))
    }

    updateOnlineusers(){
        this.message.type = 'update_nick'
        this.ws.send(JSON.stringify(this.message))
    }

    udpadteTextMessage(){
        this.message.type = 'text_message'
        this.ws.send(JSON.stringify(this.message))
    }

    returnError(){
        this.message.type = 'error'
        this.ws.send(JSON.stringify(this.message))
    }
}

wss.on('connection', ws =>{
    console.log('********\nnew client connected\nusers number: ' + (users.length + 1))
    let nick = 'user_' + Math.floor(Math.random()*1000)
    console.log('user_id: ' + id)
    let user = new User(nick, ws, id, Date.now())
    
    if (users.length == 0){
        let jsonData = require('./ids.json')
        user.message.video.id = jsonData.ids[0]
        user.message.video.playing = true 
        user.updateVideo()
        users.push(user)
    }
    else{
        users.push(user)
        users[0].getVideo(id)
    }
    id += 1

    ws.on('message', m => {
        let msg = JSON.parse(m)
        if (msg.type == 'normal'){
            console.log('normal message: \n' + m)
            for (i = 0; i < users.length; i++){
                if (users[i].ws != ws){
                    users[i].message.send_time = msg.send_time
                    users[i].message.video.id = msg.video.id
                    users[i].message.video.time = msg.video.time
                    users[i].message.video.playing = msg.video.playing
                    users[i].updateVideo()
                }
            }
        }
        else if (msg.type == 'return'){
            console.log('returned message: \n' + m)
            for (i = 0; i < users.length; i++){
                if (users[i].id == msg.video.user_id){
                    users[i].message.send_time = msg.send_time
                    users[i].message.video.id = msg.video.id
                    users[i].message.video.time = msg.video.time
                    users[i].message.video.playing = msg.video.playing
                    users[i].updateVideo()
                    console.log('return message sended to: \n' + users[i].message.user.nick)
                }
            }
            
        }
        else if (msg.type == 'update_nick'){
            let text = ''
            let temp = 0
            for (i = 0; i < users.length; i++){
                if (users[i].message.user.nick == msg.user.nick){
                    temp += 1
                }
            }

            for (i = 0; i < users.length; i++){
                if (ws == users[i].ws){
                    if (temp == 0){
                        // mail
                        if (users[i].nick.slice(0, 4) == 'user'){
                            text = msg.user.nick + ' joined to server.'
                        }
                        else{
                            text = users[i].nick + ' changed nick to ' + msg.user.nick + '.'
                        }
                        send_mail(mailoptions, text)
                        // endmail

                        users[i].nick = msg.user.nick
                        users[i].message.user.nick = msg.user.nick
                        users[i].message.user.info = msg.user.info
                        updateOnlineUsersAll() 
                    }
                    else{
                        users[i].message.error.type = 'nick'
                        users[i].message.error.text = 'nick used by another user'
                        users[i].returnError()
                    }
                }
            }


        }
        else if (msg.type == 'text_message'){

            let sender_nick = ''
            users.forEach((user) =>{
                if (user.ws == ws){
                    sender_nick = user.message.user.nick
                }
            })
            if (sender_nick.toLowerCase() == 'kiep'){
                sender_nick += ' <i class="fas fa-joint"></i>'
            }
            users.forEach((user) =>{
                if (user.ws != ws){
                    user.message.text_message.text = msg.text_message.text
                    user.message.text_message.sender = sender_nick
                    user.udpadteTextMessage()
                }
            })
        }
    })

    ws.on('close', () =>{
        let nick = ''
        let pos = 0
        let text = ''
        for (i = 0; i <  users.length; i++){
            if (users[i].ws == ws){
                nick = users[i].message.user.nick
                pos = i
            }
        }
        let time = (Date.now() - users[pos].time) / 1000
        text = users[pos].nick + ' disconected from server.\nTime spended on server: ' + time + ' seconds.'
        send_mail(mailoptions, text)

        users.splice(pos, 1)
        if (users.length == 0){
            id = 0
        }
        console.log('********\nuser ' + nick + ' disconnected\nusers number: ' + users.length)
        updateOnlineUsersAll()
    })
})

function updateOnlineUsersAll(){
    let online_users = ''
    let users_info = ''
    for (i = 0; i < users.length; i++){
        online_users += users[i].message.user.nick + '_'
        users_info += users[i].message.user.info + '_'
    }
    console.log('all users: ' + online_users)
    for (i = 0; i < users.length; i++){
        users[i].message.online_users.nicks = online_users
        users[i].message.online_users.infos = users_info
        users[i].updateOnlineusers()
    }
}

server.listen(port, () => {
    console.log(`Server running at http://${hostname}:${port}/`)
})