var recheck_trains
var rebuild_timetables
var last_loaded = new Date()


$(function() {
  function teklog() {
    if (location.host == "localhost" || location.host == "") {
      console.log.apply(console, arguments)
    }
  }


  function buildTimetable(schedule, timeFunc) {
    var now = new Date()
    var in24hr = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    var year = now.getFullYear()
    var month = now.getMonth()
    var day = now.getDate()

    var timetable = []

    $.each([-24, 0, 24], function(i,offset) {
      $.each(schedule, function(j,v) {
        var hour = v[0] / 100
        var min = v[0] % 100
        var todayTime = new Date(year, month, day, hour, min, 0, 0)
        var baseTime = new Date(todayTime.getTime() + offset * 60 * 60 * 1000)
        var weekend = (baseTime.getDay() == 0 || baseTime.getDay() == 6)

        for (t = 0; t < v[1]; t++) {
          var thisTime = new Date(baseTime.getTime() + t * v[2] * 60 * 1000)
          if (thisTime >= now && thisTime < in24hr && (!v[3] || weekend)) timetable.push(timeFunc(thisTime));
        }
      })
    })

    timetable.sort(function(a,b) { return a["oxford"].getTime() - b["oxford"].getTime() });
    return timetable
  }


  // Northbound
  // Theatre = oxford + 19min
  // 16th & cali = oxford + 21min
  // 18th & cali = oxford + 24min
  // 20th & welton = oxford + 26min
  function getNorthboundTimes(baseTime) {
    return {
      "oxford": baseTime,
      "sixcali": new Date(baseTime.getTime() + 21 * 60 * 1000),
      "eightcali": new Date(baseTime.getTime() + 24 * 60 * 1000),
    }
  }
  var northSchedule = [
    [ 555, 61, 15], // 05:00 - 20:55 every 15
    [2123,  8, 30], // 21:23 - 00:53 every 30
  ]


  // Southbound
  // 20th & welton = 16 - 4min
  // 18th & stout = 16th - 1min
  // Theatre = 16th + 2min
  // oxford = 16th + 20min
  function getSouthboundTimes(baseTime) {
    return {
      "twentywelton": new Date(baseTime.getTime() - 4 * 60 * 1000),
      "sixstout": baseTime,
      "oxford": new Date(baseTime.getTime() + 20 * 60 * 1000),
    }
  }
  var southSchedule = [
    [2216,  8, 30], // 22:16 - 01:46 every 30
    [ 525, 67, 15], // 05:25 - 21:55 every 15
    [ 216,  1, 15, true],
  ]


  // And the good stuff
  var nb = Tempo.prepare("northbound")
  var sb = Tempo.prepare("southbound")
  rebuild_timetables = function() {
    teklog("Rebuilding timetable", (new Date()))

    $("#northbound tr, #southbound tr").remove()

    nb.render(buildTimetable(northSchedule, getNorthboundTimes))
    sb.render(buildTimetable(southSchedule, getSouthboundTimes))
  }
  rebuild_timetables()
  setInterval("rebuild_timetables()",'10000')


  // Table toggle
  $("#north").click(function() {
    $(".north").hide()
    $(".south").show()
  })
  $("#south").click(function() {
    $(".north").show()
    $(".south").hide()
  })


  // Ditch the addy bar on android
  window.scrollTo(0,1)


  var measure = document.createElement('div')
  measure.style.height = '10em'
  document.body.appendChild(measure)
  var size = measure.offsetHeight/10
  document.body.removeChild(measure)
  if (size != 24) {
    teklog("Attempting to adjust size", size)
    $("html").css("font-size", (24.0 / size * 0.625) + "%")
  }
})