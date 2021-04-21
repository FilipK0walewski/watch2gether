const express = require('express')
const http = require('http')
const WebSocket = require('ws')

const port = 5000
const hostname = '165.22.68.228'
const server = http.createServer(express)
const wss = new WebSocket.Server({ server })

const users = []

class User{
    constructor(nick, socket){
        this.ws = socket
        this.message = {video:{
                            id: "",
                            link: "",
                            time: 0,
                            playing: true
                            },
                        type: "normal",
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
                        }
        }
    }

    updateVideo(){
        this.message.type = 'normal'
        this.ws.send(JSON.stringify(this.message))
    }

    getVideo(){
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

    displayInfo(){
        console.log('\nick: ' + this.message.user.nick + '\nmessage: \n' + this.message);
    }
}

wss.on('connection', ws =>{
    console.log('********\nnew client connected\nusers number: ' + (users.length + 1))
    let nick = 'user' + Math.floor(Math.random()*1000)

    let user = new User(nick, ws)
    
    if (users.length == 0){
        let jsonData = require('./ids.json')
        user.message.video.id = jsonData.ids[0]
        user.message.video.playing = true 
        user.updateVideo()
        users.push(user)
    }
    else{
        users.push(user)
        users[0].getVideo()
        console.log(users[0].message)
    }
    
    ws.on('message', m => {
        console.log(m)
        let msg = JSON.parse(m)
        let new_id = getID(msg.video.link)
        if (msg.video.link == ''){
            new_id = msg.video.id
        }
        if (new_id == ''){
            new_id = require('./ids.json').ids[0]
            console.log('retarded user')
        }
        if (msg.type == 'normal'){
            for (i = 0; i < users.length; i++){
                users[i].message.video.id = new_id
                users[i].message.video.link = msg.video.link
                users[i].message.video.time = msg.video.time
                users[i].message.video.playing = msg.video.playing
                users[i].updateVideo()
            }
        }
        else if (msg.type == 'return'){
            console.log('useres: ')
            for (i = 0; i < users.length; i++){
                users[i].message.video.id = msg.video.id
                users[i].message.video.link = msg.video.link
                users[i].message.video.time = msg.video.time
                users[i].message.video.playing = msg.video.playing
                console.log((i + 1) + '. ' + users[i].message.user.nick)
            }
            console.log('received time: ' + msg.video.time)
            console.log(users[users.length - 1].message.user.nick)
            console.log(users[users.length - 1].message)
            users[users.length - 1].updateVideo()
        }
        else if (msg.type == 'update_nick'){
            let temp = 0
            for (i = 0; i < users.length; i++){
                if (users[i].message.user.nick == msg.user.nick){
                    temp += 1
                }
            }
            if (temp == 1){
                msg.user.nick = msg.user.nick + '1'
            }
            for (i = 0; i < users.length; i++){
                if (ws == users[i].ws){
                    users[i].message.user.nick = msg.user.nick
                    users[i].message.user.info = msg.user.info
                }
            }
            updateOnlineUsersAll()  
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
        for (i = 0; i <  users.length; i++){
            if (users[i].ws == ws){
                nick = users[i].message.user.nick
                pos = i
            }
        }
        
        users.splice(pos, 1);
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

function getID(link){
    let id = ''
    let temp_bool = false

    for (i = 0; i < link.length; i++){
        if (link.charAt(i) == '='){
            if (temp_bool == false){
                temp_bool = true
            }
            else{
                temp_bool = false
            }
        }
        else if (link.charAt(i) == '&'){
            if (temp_bool == true){
                temp_bool = false
                break
            }
        }
        else{
            if (temp_bool == true){
                id += link.charAt(i)
            }
        }
    }
    return id
}

server.listen(port, () => {
    console.log(`Server running at http://${hostname}:${port}/`)
})