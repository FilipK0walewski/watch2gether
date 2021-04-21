//time

let message_time = Date.now()
            
//node server
const ws = new WebSocket('ws://localhost:5000')

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
            'controls': 0
        }
    })
}

let ready = false
let first_start = true
const time_diff = 1

function onPlayerReady(event) {
    player.mute()
    event.target.playVideo()
    ready = true
}

function onPlayerStateChange(event){
    if (event.data == 1){
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
    }
    else if (event.data == 2){
        document.querySelector('#play_button i').classList.value = 'fas fa-play'
        message.video.playing = false
        message.video.time = player.getCurrentTime()
        message.type = 'normal'
        ws.send(JSON.stringify(message))
    }
}

//message

const message = {
                video: {
                    id: "",
                    link: "",
                    time: 0,
                    playing: true
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

//online users

const nick_button = document.getElementById('nick_button')
const nick_input = document.getElementById('nick_input')
const info_input = document.getElementById('info_input')

nick_input.focus()
nick_input.select()
nick_input.style.height = nick_button.offsetHeight + 'px'
info_input.style.height = nick_button.offsetHeight + 'px'

const online_users = document.getElementById('users_box')


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
const slider = document.getElementById('slider')

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
        ws.send(JSON.stringify(message))

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
        
        ws.send(JSON.stringify(message))
    }
})

//other
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
    ws.send(JSON.stringify(message))
})

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
    ws.send(JSON.stringify(message))
})

sound_slider.addEventListener('input', () =>{
    
    if (sound_slider.value == 0){
        document.querySelector('#sound_button i').classList.replace('fa-volume-up', 'fa-volume-mute')
        player.Mute()
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
})

function upadteTime(){
    current_video_time.innerHTML = secondsToDisplay(player.getCurrentTime())
    video_duration.innerHTML = secondsToDisplay(player.getDuration())
    slider.value = player.getCurrentTime()
    slider.max = player.getDuration()

    setTimeout(function(){ upadteTime() }, 1000)
}

//websockets

ws.addEventListener("open", () =>{
    console.log('connected to server')

    //nick
    if (first_user == false){
        nick_input.value = get_property('nick')
        info_input.value = get_property('info')
        console.log(nick_button)
        nick_button.click()
    }
})

ws.addEventListener('message', msg =>{
    e = JSON.parse(msg.data)                
    if (message.video.id == ''){
        message_time = Date.now()
    }
    if (e.type == 'normal'){
        changeVideo(e.video.id, e.video.time, e.video.playing)
    }
    else if (e.type == 'return'){
        message.video.time = player.getCurrentTime()
        message.type = 'return'
        if (player.getPlayerState() == 1){
            message.video.play = true
        }
        else if (player.getPlayerState() == 2){
            message.video.play = false
        }
        ws.send(JSON.stringify(message))
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
    if (ready == true){
        if (id != message.video.id){
            player.loadVideoById(id, 0, "large")
        }
        if (Math.abs(player.getCurrentTime() - e.video.time) >= time_diff){
                player.seekTo(e.video.time)
        }
        if (play != message.video.playing){
            if (play == true){
                player.playVideo()
            }
            else if(play == false){
                player.pauseVideo()
            }
        }     
        message.video.id = id
        message.video.link = e.video.link
        message.video.playing = play
        message.video.time = time
        message.type = 'normal'
        upadteTime()
    }
    else{
        setTimeout(function(){ changeVideo(id, time, play) }, 10)
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

