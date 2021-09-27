var report = { video: null, audio_out: null, audio_in: null, hardware: null }
const video = document.querySelector("#webcam_video")
const audio_in = document.querySelector("#audio_in")
const audio_out = document.querySelector("#audio_out")
const vid_status = document.querySelector("#webcam_status")
const audio_in_status = document.querySelector("#audio_in_status")
const audio_out_status = document.querySelector("#audio_out_status")
const system_status = document.querySelector("#system_status")


function stop_media_stream (e) {
    if (e.srcObject)
        e.srcObject.getTracks().forEach(t => t.readyState === "live" ? t.stop() : null)
}

function stop_all_media_stream() {
    [audio_in, video].forEach(e => stop_media_stream(e))
    audio_out.pause()
}

function start_system() {
    document.querySelectorAll(".res").forEach(e => e.disabled = true)
    document.querySelectorAll(".res").forEach(btn =>
        btn.onclick = (p) => {
            report.video = p.target.value === "OK"
            system_status.textContent = p.target.value
            system_status.style.color = p.target.value === "OK" ? "green" : "red"
            document.querySelector("#navigation").style.display = "block"
        }) 
}

async function start_video() {
    const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = mediaStream
    document.querySelectorAll(".res").forEach(btn =>
        btn.onclick = (p) => {
            report.video = p.target.value === "OK"
            vid_status.textContent = p.target.value
            vid_status.style.color = p.target.value === "OK" ? "green" : "red"
            document.querySelector("#navigation").style.display = "block"
        })
}

async function start_audio_in() {
    const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audio_in.srcObject = mediaStream;
    document.querySelectorAll(".res").forEach(btn =>
        btn.onclick = (p) => {
            report.audio = p.target.value === "OK"
            audio_in_status.textContent = p.target.value
            audio_in_status.style.color = p.target.value === "OK" ? "green" : "red"
            document.querySelector("#navigation").style.display = "block"
        })
}

function start_audio_out() {
    document.querySelectorAll(".res").forEach(e => e.disabled = true)
    document.querySelector("#audio_out").onplay = () => {
        document.querySelectorAll(".res").forEach(e => {
            e.disabled = false
            e.onclick = (p) => {
                report.audio_out = p.target.value === "OK"
                audio_out_status.textContent = p.target.value
                audio_out_status.style.color = p.target.value === "OK" ? "green" : "red"
                document.querySelector("#navigation").style.display = "block"
            }
        })
    }
}

function hide_all_views() {
    document.querySelectorAll(".view").forEach(e => e.style.display = "none")
}

function toggle_view(view) {
    stop_all_media_stream()
    hide_all_views()
    document.querySelectorAll(view.sel).forEach(e => e.style.display = "block")
    document.querySelector("#answer").style.display = view.answer ? "block" : "none"
    document.querySelector("#navigation").style.display = view.answer ? "none" : "block"
    view.fn ? view.fn() : null
}

function set_page(index) {
    document.querySelector("#view_number").textContent = index
}

function main() {
    var i = 0
    const views = [
        {sel: "#home", fn: null, answer: false},
        {sel: "#system", fn: start_system, answer: true},
        {sel: "#webcam", fn: start_video, answer: true},
        {sel: "#audio_output", fn: start_audio_out, answer: true},
        {sel: "#audio_input", fn: start_audio_in, answer: true},
        {sel: "#wireless", fn: null, answer: false},
        {sel: "#dump", fn: null, answer: false},
        {sel: "#done", fn: null, answer: false}
    ]

    document.querySelector("#view_max").textContent = views.length - 1
    hide_all_views()
    toggle_view(views[0])
    document.querySelector("#next_btn").onclick = () => {
        if (views[++i]) {
            toggle_view(views[i])
            set_page(i)
        } else {
            i--
        }
    }
    document.querySelector("#prev_btn").onclick = () => {
        if (views[--i]) {
            toggle_view(views[i])
            set_page(i)
        } else {
            i++
        }
    }
}

main()