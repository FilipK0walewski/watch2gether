//time

//const e = require("express")

//const e = require("express")

let message_time = 0
            
//node server
const ws = new WebSocket('ws://165.22.68.228:5000')

//yt API
let tag = document.createElement('script')

tag.src = "https://www.youtube.com/iframe_api"
let firstScriptTag = document.getElementsByTagName('script')[0]
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)

let player
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '480',
        width: '854',
        videoId: '',
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        },
        playerVars: {
            'autoplay': 0,
            'autohide': 1,
            'showinfo': 0,
            'controls': 1
        }
    })
}

let ready = false
let dont_send_to_server = false
const time_diff = .5

function onPlayerReady(event) {
    player.mute()
    event.target.playVideo()
    ready = true
}

function onPlayerStateChange(event){
    if (event.data == 1){
        document.querySelector('#play_button i').classList.value = 'fas fa-pause'
        if (dont_send_to_server == true){
            console.log('play only for me')
            playVideo(false, false)
            dont_send_to_server = false
        }
        else{
            console.log('play to server')
            //change here
            playVideo(true, false)
        }
        
        /*
        document.querySelector('#play_button i').classList.value = 'fas fa-pause'

        if (first_start == false){
            message.video.playing = true
            message.video.time = player.getCurrentTime()
            message.type = 'normal'
            ws.send(JSON.stringify(message))
        }
        else{
            let delta_time = (Date.now() - message_time) / 1000
            first_start = false
            if (Math.abs(player.getCurrentTime() - message.video.time) >= time_diff){
                player.seekTo(message.video.time + delta_time)
            }
        }
        */
    }
    else if (event.data == 2){
        document.querySelector('#play_button i').classList.value = 'fas fa-play'

        if (dont_send_to_server == true){
            console.log('pause only for me')
            pauseVideo(false, false)
            dont_send_to_server = false
        }
        else{
            console.log('pause to server')
            //change here
            pauseVideo(true, false)
        }
        /*
        document.querySelector('#play_button i').classList.value = 'fas fa-play'
        message.video.playing = false
        message.video.time = player.getCurrentTime()
        message.type = 'normal'
        ws.send(JSON.stringify(message))
        */
    }
}

//message

const message = {
                send_time: 0,
                video: {
                    id: "",
                    link: "",
                    time: 0,
                    playing: true,
                    user_id : ""
                    },
               type: "normal" ,
               user: {
                   nick: "",
                   info: ""
               },
               online_users: "",
               text_message: {
                   text: "",
                   sender: ""
               },
               poke: {
                   text: "",
                   user_to_poke: ""
               }
}

function sendMessageToServer(){
    message.send_time = Date.now()
    ws.send(JSON.stringify(message))
}

//online users

const nick_button = document.getElementById('nick_button')
const nick_input = document.getElementById('nick_input')
const info_input = document.getElementById('info_input')

nick_input.focus()
nick_input.select()
nick_input.style.height = nick_button.offsetHeight + 'px'
info_input.style.height = nick_button.offsetHeight + 'px'

const online_users = document.getElementById('users_list')

//messages

let temp_nick = ''
const message_window = document.getElementById('message_window')
const message_button = document.getElementById('message_button')
const message_input = document.getElementById('message_input')

console.log('test of height: ' + message_button.offsetHeight + 'px')
message_input.style.height = nick_button.offsetHeight + 'px'

//buttons
const search_button = document.getElementById('search_button')
const search_input = document.getElementById('server_input')
search_input.style.height = search_button.offsetHeight + 'px'

const play_button = document.getElementById('play_button')
const current_video_time = document.getElementById('video_time')
const video_duration = document.getElementById('video_duration')
const slider = document.getElementById('time_slider')

const sound_button = document.getElementById('sound_button')
const sound_slider = document.getElementById('sound_slider')
sound_slider.max = 100 

//reset nick btn

const reset_nick = document.getElementById('change_nickname_button')
reset_nick.addEventListener('click', () => {
    set_property('nick', '')
    set_property('info', '')
    document.getElementById('temp_screen').style.display = 'flex'
    document.getElementById('temp_screen').style.opacity = '1'
    nick_input.value = ''
    info_input.value = ''
})

//chat
message_input.addEventListener('keyup', (event) =>{
    if (event.code == 'Enter'){
        event.preventDefault()
        message_button.click()
    }
})

message_button.addEventListener('click', () =>{
    if (message_input.value != ''){
        temp_nick = ''
        message_window.innerHTML += '<div class="my_message">' + message_input.value + '</div><div class="message_filler"></div>'
        message.text_message.text = message_input.value
        message.type = 'text_message'
        sendMessageToServer()
        message_input.value = ''
        message_window.scrollTo(0, message_window.scrollHeight)
    }
})

//nick
nick_input.addEventListener('keyup', (event) =>{
    if (event.code == 'Enter'){
        event.preventDefault()

        if (info_input.value == ''){
            info_input.focus()
            info_input.select()
        }
        else{
            nick_button.click()
        }
        
    }
})

info_input.addEventListener('keyup', (event) =>{
    if (event.code == 'Enter'){
        event.preventDefault()
        nick_button.click()
    }
})

nick_button.addEventListener('click', () =>{
    if (nick_input.value != '' && info_input.value != ''){

        set_property('nick', nick_input.value)
        set_property('info', info_input.value)

        message.user.nick = nick_input.value
        message.user.info = info_input.value
        message.type = 'update_nick'
        document.getElementById('temp_screen').style.opacity = 0
        setTimeout(function(){ document.getElementById('temp_screen').style.display = 'none' }, 1000)
        sendMessageToServer()
    }
})

//search
search_input.addEventListener('keyup', (event) =>{
    if (event.code == 'Enter'){
        event.preventDefault()
        search_button.click()
    }
})

search_button.addEventListener('click', () =>{
    message.video.link = search_input.value
    message.video.time = player.getCurrentTime()
    message.video.playing = true
    message.type = 'normal'
    sendMessageToServer()

    if (search_input.value != message.video.id){
        changeVideo(getID(search_input.value), 0, true)
    }
})

//player controls

play_button.addEventListener('click', () =>{
    if (player.getPlayerState() == 2){
        playVideo(true, true)
    }
    else if (player.getPlayerState() == 1){
        pauseVideo(true, true)
    }
})

function playVideo(send_to_server, play){

    if (send_to_server == true){
        message.video.playing = true
        message.video.time = player.getCurrentTime()
        message.type = 'normal'
        sendMessageToServer()
    }
    if (play == true){
        player.playVideo()
    }
    
}

function pauseVideo(send_to_server, pause){
    
    if (send_to_server == true){
        message.video.playing = false
        message.video.time = player.getCurrentTime()
        message.type = 'normal'
        sendMessageToServer()
    }
    if (pause == true){
        player.pauseVideo()
    }
}

slider.addEventListener('input', () =>{
    message.video.time = slider.value
    message.type = 'normal'
    player.seekTo(slider.value)
    sendMessageToServer()
})

sound_slider.addEventListener('input', () =>{
    
    if (sound_slider.value == 0){
        document.querySelector('#sound_button i').classList.replace('fa-volume-up', 'fa-volume-mute')
        player.mute()
    }
    else{
        document.querySelector('#sound_button i').classList.replace('fa-volume-mute', 'fa-volume-up')
        player.unMute()
    }
    player.setVolume(sound_slider.value)
})

sound_button.addEventListener('click', () =>{
    if (player.isMuted() == true){
        player.unMute()
        player.setVolume(sound_slider.value)
        document.querySelector('#sound_button i').classList.replace('fa-volume-mute', 'fa-volume-up')
    }
    else{
        player.mute()
        document.querySelector('#sound_button i').classList.replace('fa-volume-up', 'fa-volume-mute')
    }
    console.log('message time: ' + message_time)
})

function upadteTime(){
    current_video_time.innerHTML = secondsToDisplay(player.getCurrentTime())
    video_duration.innerHTML = secondsToDisplay(player.getDuration())
    slider.value = player.getCurrentTime()
    slider.max = player.getDuration()

    dont_send_to_server = false

    setTimeout(function(){ upadteTime() }, 1000)
}

//websockets

ws.addEventListener("open", () =>{
    console.log('connected to server')
})

ws.addEventListener('message', msg =>{
    e = JSON.parse(msg.data)                
    console.log('time: ' + msg.data)
    message_time = e.send_time

    if (e.video.playing == true){
        dont_send_to_server = true
    }

    if (e.type == 'normal'){
        message.video.link = e.video.link
        changeVideo(e.video.id, e.video.time, e.video.playing)
    }
    else if (e.type == 'return'){
        message.video.time = player.getCurrentTime()
        message.type = 'return'
        message.video.playing = true
        message.video.user_id = e.video.user_id
        /*
        if (player.getPlayerState() == 1){
            message.video.playing = true
        }
        else if (player.getPlayerState() == 2){
            message.video.playing = false
        }
        */
        sendMessageToServer()
    }
    else if (e.type == 'update_nick'){
        online_users.innerHTML = ''
        document.getElementById('nickname').innerHTML = e.user.nick 
        let users = getArrayFromString(e.online_users.nicks)
        let infos = getArrayFromString(e.online_users.infos)
        console.log('info: ' + infos)
        let i = 0
        users.forEach((user) =>{
            online_users.innerHTML += '<div class="user_info"><div class="user_icon"><i class="fas fa-user"></i></div><div class="user_name_info"><div id="u_' + i + '" class="user_name">' + user + '</div><div class="user_d">' + infos[i] + '</div></div><button id="poke_' + i + '" class="poke_button header_button"><i class="fas fa-hand-point-left"></i></button></div>'
            i += 1
        })
        addPokeListeners()
    }
    else if (e.type == 'text_message'){
        
        if (temp_nick != e.text_message.sender){
            message_window.innerHTML += '<div class="sender_nick">' + e.text_message.sender 
            message_window.innerHTML += '</div><div class="message_filler"></div>'
            temp_nick = e.text_message.sender
        }
        message_window.innerHTML += '<div class="other_user_message">' + e.text_message.text
        message_window.innerHTML += '</div><div class="message_filler"></div>'
        message_window.scrollTo(0, message_window.scrollHeight)
    }
    else if (e.type == 'error'){
        if (e.error.type == 'nick'){
            alert(e.error.text)
            setTimeout(function(){ reset_nick.click() }, 1005)
        }
    }
})

function addPokeListeners(){
    let poke_buttons = document.getElementsByClassName('poke_button')
    for (i = 0; i < poke_buttons.length; i++){
        poke_buttons[i].addEventListener('click', (event) => {
            console.log('event target id: ' + event.target.id)
            let id = event.target.id.charAt(event.target.id.length - 1)
            console.log('poke id: ' + 'u_' + id)
            console.log('user to poke: ' + document.getElementById('u_' + id).innerHTML)

            message.poke.text = 'poke'
            message.poke.user_to_poke = document.getElementById('u_' + id).innerHTML

            console.log(message)

        })
    }
}

function getArrayFromString(str){
    let users = []
    let element = ''
    for (i = 0; i < str.length; i++){
        if (str.charAt(i) == '_'){
            users.push(element)
            element = ''
        }
        else{
            element += str.charAt(i)
        }
    }
    return users
}

function changeVideo(id, time, play){
    console.log('change video')
    if (ready == true){
        if (id != message.video.id){
            player.loadVideoById(id, 0, "large")
        }
        message.video.id = id
        changeState(time, play)
    }
    else{
        setTimeout(function(){ changeVideo(id, time, play) }, 10)
    }
}

function changeState(time, play){
    console.log('change state')
    if (play == true && player.getPlayerState() != 1){
        playVideo(false, true)
    }  
    if (play == false && player.getPlayerState() != 2){
        pauseVideo(false, true)
        
    }   
    if (player.getPlayerState() != 1 && player.getPlayerState() != 2){
        setTimeout(function(){ changeState(time, play) }, 10)
    }
    else{
        console.log('\n\only time: ' + time)
        let delta_time = (Date.now() - message_time) / 1000
        console.log('\n\ntime diff: ' + delta_time)
        if (Math.abs(player.getCurrentTime() - time) >= time_diff){
            console.log('\n\only time: ' + time)
            player.seekTo(parseInt(time) + parseInt(delta_time))
        }
        upadteTime()
        console.log('buffering time: ' + (Date.now() - message_time))
    }
}

function secondsToDisplay(seconds){
    seconds = Math.floor(seconds)
    let minutes = Math.floor(seconds / 60)
    seconds = seconds - (minutes * 60)

    if (seconds < 10){
        seconds = '0' + seconds
    }
    if (minutes < 10){
        minutes = '0' + minutes
    }

    return minutes + ':' + seconds
}

if (first_user == false){
    nick_input.value = get_property('nick')
    info_input.value = get_property('info')
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