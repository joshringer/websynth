import $ from 'jquery'

var ctx = new (window.AudioContext || window.webkitAudioContext)()

function setAudioParam (param, value) {
  // console.log('setAudioParam', param, value)
  if (isNaN(value)) value = param.defaultValue
  else if (value < param.minValue) value = param.minValue
  else if (value > param.maxValue) value = param.maxValue
  param.value = value
}

function configureOscillator (el) {
  var osc = $(el).data('osc')
  osc.type = $(el).find('.type').text()
  setAudioParam(osc.frequency, $(el).find('.freq').text())
  setAudioParam(osc.detune, $(el).find('.detune').text())
}

$('.key[data-type=oscillator]').each(function (_, el) {
  var osc = ctx.createOscillator()
  var vol = ctx.createGain()
  osc.connect(vol)
  vol.connect(ctx.destination)
  $(el).data({ osc: osc, vol: vol })
  configureOscillator(el)
  vol.gain.value = 0
  osc.start()
})

$(window).keydown(function (ev) {
  // console.log('down', ev.which)
  $('.key[data-keycode=' + ev.which + ']').each(function (_, el) {
    setAudioParam($(el).data('vol').gain, $(el).find('.vol').text() / 100)
  })
}).keyup(function (ev) {
  $('.key[data-keycode=' + ev.which + ']').each(function (_, el) {
    $(el).data('vol').gain.value = 0
  })
})
