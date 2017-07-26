import $ from 'jquery'

var ctx = new (window.AudioContext || window.webkitAudioContext)()
var masterVolume = ctx.createGain()

masterVolume.gain.value = 0.3
masterVolume.connect(ctx.destination)

function setAudioParam (param, value) {
  // console.log('setAudioParam', param, value)
  if (isNaN(value)) value = param.defaultValue
  else if (value < param.minValue) value = param.minValue
  else if (value > param.maxValue) value = param.maxValue
  param.value = value
  return param.value
}

function createOscillator (el) {
  // instantiate nodes and bind to el
  var osc = $(el).data('osc') || ctx.createOscillator()
  var vol = $(el).data('vol') || ctx.createGain()
  $(el).data({ osc: osc, vol: vol })
  // set initial values
  updateOscillator(el, 'type', $(el).find('.type').text())
  updateOscillator(el, 'frequency', $(el).find('.frequency').text())
  updateOscillator(el, 'detune', $(el).find('.detune').text())
  updateOscillator(el, 'gain', $(el).find('.gain').text())
  // connect to audio pipeline and start oscillator
  osc.connect(vol)
  vol.connect(masterVolume)
  osc.start()
}

function updateOscillator (el, property, value) {
  var node = $(el).data((property === 'gain') ? 'vol' : 'osc')
  var newValue
  console.log('update', node, property, node[property], 'to', value)
  if (node[property] instanceof window.AudioParam) {
    newValue = setAudioParam(node[property], value)
  } else {
    node[property] = value
    newValue = node[property]
  }
  $(el).find('.' + property).text(newValue)
}

function destroyOscillator (el) {
  // stop oscillator
  $(el).data('osc').stop()
  // delete nodes
  $(el).removeData(['osc', 'vol'])
}

$(window).keydown(function (ev) {
  // console.log('down', ev.which)
  $('.key[data-keycode=' + ev.which + ']').each(function (_, el) {
    createOscillator(el)
  })
}).keyup(function (ev) {
  $('.key[data-keycode=' + ev.which + ']').each(function (_, el) {
    destroyOscillator(el)
  })
})
