const express = require('express')
const http = require('http')
const WebSocket = require('ws')

const port = 5000
const hostname = '165.22.68.228'
const server = http.createServer(express)
const wss = new WebSocket.Server({ server })

const users = []

class User{
    constructor(name, socket){
        this.name = name
        //this.video_id = video_id
        this.ws = socket
        this.message = {video:{
                            id: "",
                            link: "",
                            time: 0,
                            playing: true
                            },
                        type: "normal" 
        }
    }

    sendMessage(){
        this.message.type = "normal"
        this.ws.send(JSON.stringify(this.message))
    }

    updateMessage(){
        this.message.type = "return"
        this.ws.send(JSON.stringify(this.message))
    }

    displayInfo(){
        console.log('\nname: ' + this.name + '\nmessage: \n' + this.message);
    }
}

wss.on('connection', ws =>{
    console.log('********\nnew client connected\nusers number: ' + (users.length + 1))
    let name = 'user' + Math.floor(Math.random()*1000)

    let user = new User(name, ws)
    
    if (users.length == 0){
        let jsonData = require('./ids.json')
        user.message.video.id = jsonData.ids[0]
        user.message.video.playing = true 
        user.sendMessage()
        users.push(user)
    }
    else{
        users.push(user)
        users[0].updateMessage()
        console.log(users[0].message)
    }
    
    ws.on('message', m => {
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
                users[i].sendMessage()
            }
        }
        else if (msg.type == 'return'){
            console.log('useres: ')
            for (i = 0; i < users.length; i++){
                users[i].message.video.id = msg.video.id
                users[i].message.video.link = msg.video.link
                users[i].message.video.time = msg.video.time
                users[i].message.video.playing = msg.video.playing
                console.log((i + 1) + '. ' + users[i].name)
            }
            console.log('received time: ' + msg.video.time)
            console.log(users[users.length - 1].name)
            console.log(users[users.length - 1].message)
            users[users.length - 1].sendMessage()
        }
    })

    ws.on('close', () =>{
        let name = ''
        let pos = 0
        for (i = 0; i <  users.length; i++){
            if (users[i].ws == ws){
                name = users[i].name
                pos = i
            }
        }
        users.splice(pos, 1);
        console.log('********\nuser ' + name + ' disconnected\nusers number: ' + users.length)
    })
})

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