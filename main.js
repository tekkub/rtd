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

    $.each(schedule, function(i,v) {
      var hour = v[0] / 100
      var min = v[0] % 100
      var baseTime = new Date(year, month, day, hour, min, 0, 0)

      for (t = 0; t <= v[1]; t++) {
        var thisTime = new Date(baseTime.getTime() + t * v[2] * 60 * 1000)
        if (thisTime >= now && thisTime < in24hr) timetable.push(timeFunc(thisTime));
      }
    })

    $.each(schedule, function(i,v) {
      var hour = v[0] / 100
      var min = v[0] % 100
      var todayTime = new Date(year, month, day, hour, min, 0, 0)
      var baseTime = new Date(todayTime.getTime() + 24 * 60 * 60 * 1000)

      for (t = 0; t <= v[1]; t++) {
        var thisTime = new Date(baseTime.getTime() + t * v[2] * 60 * 1000)
        if (thisTime >= now && thisTime < in24hr) timetable.push(timeFunc(thisTime));
      }
    })

    return timetable
  }


  // Northbound
  // Theatre = oxford + 19min
  // 16th & cali = oxford + 21min
  // 18th & cali = oxford + 24min
  // 20th & welton = oxford + 26min
  function getNorthboundTimes(baseTime) {
    var six   = new Date(baseTime.getTime() + 21 * 60 * 1000)
    var eight = new Date(baseTime.getTime() + 24 * 60 * 1000)
    return {
      "oxford": baseTime,
      "sixcali": six,
      "eightcali": eight,
    }
  }
  var northSchedule = [
    [  23,  1, 30], // 00:23 - 00:53 every 30
    [ 555, 60, 15], // 05:00 - 20:55 every 15
    [2123,  5, 30], // 21:23 - 23:53 every 30
  ]
  var northTimetable = buildTimetable(northSchedule, getNorthboundTimes)


  // Southbound
  // 20th & welton = 16 - 4min
  // 18th & stout = 16th - 1min
  // Theatre = 16th + 2min
  // oxford = 16th + 20min
  function getSouthboundTimes(baseTime) {
    var twenty = new Date(baseTime.getTime() - 4 * 60 * 1000)
    var eight  = new Date(baseTime.getTime() - 1 * 60 * 1000)
    var oxford = new Date(baseTime.getTime() + 20 * 60 * 1000)
    return {
      "oxford": oxford,
      "sixstout": baseTime,
      "twentywelton": twenty,
    }
  }
  var southSchedule = [
    [  16,  3, 30], // 00:16 - 01:46 every 30
    [ 525, 66, 15], // 05:25 - 21:55 every 15
    [2216,  3, 30], // 22:16 - 23:46 every 30
  ]
  var southTimetable = buildTimetable(southSchedule, getSouthboundTimes)


  // And the good stuff
  var nb = Tempo.prepare("northbound")
  var sb = Tempo.prepare("southbound")
  rebuild_timetables = function() {
    var now = new Date()
    if ((now.getTime() - last_loaded.getTime()) >= 60 * 60 * 1000) {
      // Reload the page, it's been more than an hour
      window.location.reload()
    }

    teklog("Rebuilding timetable", now)
    $("#northbound tr:gt(0), #southbound tr:gt(0)").remove()
    nb.render(northTimetable)
    sb.render(southTimetable)
  }
  rebuild_timetables()
  setInterval("rebuild_timetables()",'10000')


  // Table toggle
  $("#north").click(function() {
    $("#north, #northbound").hide()
    $("#south, #southbound").show()
  })
  $("#south").click(function() {
    $("#north, #northbound").show()
    $("#south, #southbound").hide()
  })
})