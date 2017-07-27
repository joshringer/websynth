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
  // create nodes
  var osc = $(el).data('osc')
  var toStart = !osc
  osc = osc || ctx.createOscillator()
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
  // if already created, we do not start again
  if (toStart) osc.start()
}

function updateOscillator (el, property, value) {
  var node = $(el).data((property === 'gain') ? 'vol' : 'osc')
  // console.log('update', node, property, node[property], 'to', value)

  // check for node since we are creating on demand
  if (node) {
    if (node[property] instanceof window.AudioParam) {
      value = setAudioParam(node[property], value)
    } else {
      if (property === 'type' && value === 'custom') {
        // we are hoping customWave data has been created by this point
        node.setPeriodicWave($(el).data('customWave'))
      } else {
        node[property] = value
      }
      value = node[property]
    }
  }
  $(el).find('.' + property).text(value)
}

function destroyOscillator (el) {
  // stop oscillator
  $(el).data('osc').stop()
  // delete nodes
  $(el).removeData(['osc', 'vol'])
}

function createCustomWave (paramsel) {
  var real = new Float32Array(
    $(paramsel).find('[data-param=real]').map(function (_, el) {
      return $(el).val()
    }).get()
  )
  var imag = new Float32Array(
    $(paramsel).find('[data-param=imag]').map(function (_, el) {
      return $(el).val()
    }).get()
  )
  return ctx.createPeriodicWave(real, imag)
}

// check for volume change & initialise
$('#mastervolume').change(function (ev) {
  // console.log('mastervolume change', ev.target)

  var volume = parseInt($(ev.target).val())
  setAudioParam(masterVolume.gain, volume / 10)
  $('#mastervolumedisplay [data-level]').each(function (_, el) {
    if (volume < $(el).data('level')) {
      $(el).removeClass('on')
    } else {
      $(el).addClass('on')
    }
  })
}).change()
masterVolume.connect(ctx.destination)

$('#oscillatortype,#customoscillator input').change(function () {
  var type = $('#oscillatortype').val()
  if (type === 'custom') {
    $('#customoscillator input').prop('disabled', false)
    var wave = createCustomWave('#customoscillator')
    $('[data-type=oscillator]').each(function (_, el) {
      $(el).data('customWave', wave)
      updateOscillator(el, 'type', 'custom')
    })
  } else {
    $('#customoscillator input').prop('disabled', true)
    $('[data-type=oscillator]').each(function (_, el) {
      updateOscillator(el, 'type', type)
    })
  }
}).change()

// check for key presses
$(window).keydown(function (ev) {
  // console.log('keydown', ev.which)

  // process oscillators
  $('[data-type=oscillator][data-keycode=' + ev.which + ']').each(function (_, el) {
    createOscillator(el)
  })
  // process master volume
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
  // add key press class
  $('[data-keycode=' + ev.which + ']').addClass('pressed')
}).keyup(function (ev) {
  // remove key press class
  $('[data-keycode=' + ev.which + ']').removeClass('pressed')
  // process oscillators
  $('[data-type=oscillator][data-keycode=' + ev.which + ']').each(function (_, el) {
    destroyOscillator(el)
  })
})
