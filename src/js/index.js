import $ from 'jquery'

const masterVolDnKeyCode = 173
const masterVolUpKeyCode = 61

var ctx = new (window.AudioContext || window.webkitAudioContext)()
var masterVolume = ctx.createGain()

function setAudioParam (param, value) {
  // console.log('setAudioParam', param, value)
  if (isNaN(value)) value = param.defaultValue
  else if (value < param.minValue) value = param.minValue
  else if (value > param.maxValue) value = param.maxValue
  param.value = value
  return param.value
}

function createOscillator (el) {
  // instantiate nodes
  var osc = $(el).data('osc')
  var toStart = true
  if (osc) {
    toStart = false
  } else {
    osc = ctx.createOscillator()
  }
  var vol = $(el).data('vol') || ctx.createGain()
  // attach to el data
  $(el).data({ osc: osc, vol: vol })
  // set initial values
  updateOscillator(el, 'type', $(el).find('.type').text())
  updateOscillator(el, 'frequency', $(el).find('.frequency').text())
  updateOscillator(el, 'detune', $(el).find('.detune').text())
  updateOscillator(el, 'gain', $(el).find('.gain').text())
  // connect to audio pipeline and start oscillator
  osc.connect(vol)
  vol.connect(masterVolume)
  if (toStart) { osc.start() }
}

function updateOscillator (el, property, value) {
  var node = $(el).data((property === 'gain') ? 'vol' : 'osc')
  var newValue
  // console.log('update', node, property, node[property], 'to', value)
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

// check for volume change & initialise
$('#mastervolume').change(function (ev) {
  // console.log('mastervolume change', ev.target)
  var volume = parseInt($(ev.target).val())
  setAudioParam(masterVolume.gain, volume / 10)
  $('#mastervolumedisplay [data-level]').each(function (_, el) {
    if (volume < parseInt($(el).data('level'))) {
      $(el).removeClass('on')
    } else {
      $(el).addClass('on')
    }
  })
}).change()
masterVolume.connect(ctx.destination)

// check for key presses
$(window).keydown(function (ev) {
  // console.log('keydown', ev.which)
  $('[data-type=oscillator][data-keycode=' + ev.which + ']').each(function (_, el) {
    createOscillator(el)
  })
  if (ev.which === masterVolDnKeyCode) {
    $('#mastervolume').val(function (_, v) {
      v = parseInt(v)
      return v > 0 ? v - 1 : 0
    }).change()
  }
  if (ev.which === masterVolUpKeyCode) {
    $('#mastervolume').val(function (_, v) {
      v = parseInt(v)
      return v < 11 ? v + 1 : 11
    }).change()
  }
  $('[data-keycode=' + ev.which + ']').addClass('pressed')
}).keyup(function (ev) {
  $('[data-keycode=' + ev.which + ']').removeClass('pressed')
  $('[data-type=oscillator][data-keycode=' + ev.which + ']').each(function (_, el) {
    destroyOscillator(el)
  })
})
