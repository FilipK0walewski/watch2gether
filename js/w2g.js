//time
//const e = require("express")
            
//node server
const ws = new WebSocket('ws://localhost:5000')

//yt API
const key = 'MY_API_KEY'

let tag = document.createElement('script')
tag.src = "https://www.youtube.com/iframe_api"
let firstScriptTag = document.getElementsByTagName('script')[0]
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)

let player
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '100%',
        width: '100%',
        videoId: '',
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        },
        playerVars: {
            'autoplay': 0,
            'autohide': 1,
            'showinfo': 0,
            'controls': 0
        }
    })
}


// start variables

let ready = false
let first_start = true

let message_time = 0

// prevents resending video status to another users
let got_message = false

// on player ready
// vide change state to 1 and then to 2 istead go for 2
function onPlayerReady(event) {
    player.mute()
    player.loadVideoById(message.video.id, 0, "large")
    //player.playVideo()
    upadteTime()
    event.target.playVideo()
    ready = true
}

// player states
// separate got message on first start and non first start
function onPlayerStateChange(event){

    if (got_message == true){
        console.log('FIRST status change after received message: ' + event.data)
    }
    else{
        console.log('ANOTHER status change after received message: ' + event.data)
    }

    document.querySelector('#play_button i').classList.value = 'fas fa-pause'
    if (event.data == 1){
        if (first_start == true){
            if (message.video.playing == false){
                player.seekTo(parseFloat(message.video.time))
                player.pauseVideo()
            }
            else{
                if (message.video.time != 0){
                    let delta_time = (Date.now() - message_time) / 1000
                    console.log('delta time: ' + delta_time)
                    player.seekTo(parseFloat(message.video.time) + parseFloat(delta_time))
                }
                else{
                    player.playVideo()
                }
                first_start = false
            }      
        }
        else{
            if (got_message == true && message.video.playing == true){
                console.log('next messages will be sent to another users')
                got_message = false
            }
            else{
                message.video.playing = true
                message.video.time = player.getCurrentTime()
                message.type = 'normal'
                sendMessageToServer()
            }
        }
        
    }
    else if (event.data == 2){
        document.querySelector('#play_button i').classList.value = 'fas fa-play'
        if (first_start == true){
            first_start = false
        }
        else{
            if (got_message == true && message.video.playing == false){
                console.log('next messages will be sent to another users')
                got_message = false
            }
            else{
                message.video.playing = false
                message.video.time = player.getCurrentTime()
                message.type = 'normal'
                sendMessageToServer()
            }
        }
    }
    else if (event.data == 3){
        got_message = true
    }
    
}

//message

const message = {
                send_time: 0,
                video: {
                    id: "",
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
    console.log(message.type + ' message sended')
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

message_input.style.height = nick_button.offsetHeight + 'px'

//buttons
const search_button = document.getElementById('search_button')
const search_input = document.getElementById('server_input')
const videos_list = document.getElementById('videos_list')
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
    videos_list.scrollTo(0, 0)
    searchByKeyword(search_input.value, 10)
    search_list_button.click()
})

const Http = new XMLHttpRequest()
function searchByKeyword(keyword, max_results){
    let url = 'https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=' + max_results + '&q=' + keyword + '&type=video&key=' + key
    Http.open('GET', url)
    Http.send()
}

Http.onreadystatechange = (e) =>{
    let http_respond = Http.responseText,
        respond = JSON.parse(http_respond),
        img_url = '',
        title = '',
        channel = '',
        //views = '',
        v_id = ''
        //duration = 0

    videos_list.innerHTML = ''
    console.log(respond)
    for (i = 0; i < respond.items.length; i++){
        v_id = respond.items[i].id.videoId
        img_url = respond.items[i].snippet.thumbnails.high.url
        title = respond.items[i].snippet.title
        channel = respond.items[i].snippet.channelTitle
        videos_list.innerHTML += '<div class="video_list_item" onclick=changeVideo("' + String(v_id) + '")>' + '<div class="video_icon"><img class="img_fill" src="' + img_url + '"></div><div class="v_info"><div class="v_title">' + title + '</div><div class="v_channel">' + channel + '</div></div></div>'

    }
}

function changeVideo(id){
    console.log('testing new function!!!\nid: ' + id)

    if (id != message.video.id){
        player.loadVideoById(String(id), 0, "large")
        console.log('loading')
        message.video.id = id
        message.video.time = 0
        message.video.playing = true
        message.type = 'normal'
        sendMessageToServer()
    }
}

//player controls

play_button.addEventListener('click', () =>{
    if (player.getPlayerState() == 2){
        player.playVideo()
    }
    else if (player.getPlayerState() == 1){
        player.pauseVideo()
    }
})

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

    if (e.type == 'normal'){
        message_time = e.send_time
        got_message = true
        console.log('video update message received')
        if (ready != true){ /* normal message */
            message.video = e.video
        }
        else{
            if (e.video.id != message.video.id){
                player.loadVideoById(e.video.id , 0, "large")
                    if (e.video.playing == false){
                        player.pauseVideo()
                    }
            }
            else{
                if (message_time != 0){
                    let delta_time = (Date.now() - message_time) / 1000
                    player.seekTo(parseFloat(e.video.time) + parseFloat(delta_time))
                }

                if (e.video.playing == true && player.getPlayerState() != 1){
                    player.playVideo()
                }
                else if (e.video.playing == false && player.getPlayerState() != 2){
                    player.pauseVideo()
                }
                
            }
            message.video = e.video
        }
    }
    else if (e.type == 'return'){ /* return video message */
        console.log('\nreturn message request\n')
        message.video.time = player.getCurrentTime()
        message.type = 'return'
        message.video.user_id = e.video.user_id
        if (player.getPlayerState() == 1){
            message.video.playing = true
        }
        else{
            message.video.playing = false
        }
        sendMessageToServer()
    }
    else if (e.type == 'update_nick'){ /* set nick message */
        online_users.innerHTML = ''
        document.getElementById('nickname').innerHTML = e.user.nick 
        let users = getArrayFromString(e.online_users.nicks)
        let infos = getArrayFromString(e.online_users.infos)
        let i = 0
        users.forEach((user) =>{
            online_users.innerHTML += '<div class="user_info"><div class="user_icon"><i class="fas fa-user"></i></div><div class="user_name_info"><div id="u_' + i + '" class="user_name">' + user + '</div><div class="user_d">' + infos[i] + '</div></div><button id="poke_' + i + '" class="poke_button header_button"><i class="fas fa-hand-point-left"></i></button></div>'
            i += 1
        })
    }
    else if (e.type == 'text_message'){ /* text message */
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

function getArrayFromString(str){
    let array = []
    let element = ''
    for (i = 0; i < str.length; i++){
        if (str.charAt(i) == '_'){
            array.push(element)
            element = ''
        }
        else{
            element += str.charAt(i)
        }
    }
    return array
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

if (first_user == false){
    nick_input.value = get_property('nick')
    info_input.value = get_property('info')
}
