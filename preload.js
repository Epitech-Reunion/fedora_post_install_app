// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const { ipcRenderer } = require('electron')

window.addEventListener('DOMContentLoaded', () => {
  const wifi = window.document.querySelector("#wifi")
  const mem = window.document.querySelector("#memory")
  const storage = window.document.querySelector("#storage")
  const cpu = window.document.querySelector("#cpu")

  
  var hardware_report = {wifi: null, mem: null, storage: null, cpu: null}

  function on_get_5ghz_reply(stdout) {
    let five_ghz = 0
    const freq_list = stdout.split("\n")
    freq_list.map(freq => parseInt(freq)).forEach(elem => elem >= 5000 ? five_ghz++ : null)
    wifi.textContent = five_ghz > 0 ? "5 Ghz OK" : "5 Ghz KO"
    hardware_report.wifi = five_ghz > 0
  }
  
  function on_get_mem_reply(stdout) {
    const ram_total = parseInt(stdout)
    mem.textContent = `${ram_total}Mb ${ram_total >= 8000 ? "OK": "KO"}`
    hardware_report.mem = ram_total >= 8000
  }
  
  function on_get_block_reply(stdout) {
    const recursive_block_parent = (block, cur) => (cur.pkname === null ? cur.kname : recursive_block_parent(block, block.filter(v => v.kname === cur.pkname)[0]))
    let warn = []
    const blk_list = JSON.parse(stdout).blockdevices
    const warnings = blk_list.filter(v => v.mountpoint && v.rota)
    warnings.forEach(e => {
      warn.push([recursive_block_parent(blk_list, e), e.mountpoint])
    })
    hardware_report.storage = warnings.length === 0
    storage.textContent = `No mounted rotational: ${warnings.length === 0 ? "OK" : "WARN: "}`
    Array.from(new Set(warn)).forEach(w => {
      storage.textContent += `${w[1]} on ${w[0]},`
    })
  }

  const ipcCalls = [
    {channel: "get_5ghz", fn: on_get_5ghz_reply},
    {channel: "get_mem", fn: on_get_mem_reply},
    {channel: "get_block", fn: on_get_block_reply}
  ]
  ipcCalls.forEach(e => ipcRenderer.on(`${e.channel}_reply`, (evt, args) => e.fn(args)))
  window.document.querySelector("#get_config").onclick = () => {
    window.document.querySelectorAll(".res").forEach(e => e.disabled = false)
    ipcCalls.forEach(e => ipcRenderer.send(e.channel))
  }

  //ipcRenderer.send("get_ls")

})
