var recheck_trains
var rebuild_timetables
var last_loaded = new Date()


$(function() {
  function teklog() {
    if (location.host == "localhost" || location.host == "") {
      console.log.apply(console, arguments)
    }
  }

  function showNext() {
    var now = new Date()
    var now_time = now.getHours()*100 + now.getMinutes()
    var past_midnight = now_time < 400

    // gt(0) to skip the header row
    $("#southbound tr:gt(0)").each(function() {
      // eq(1) checks the SECOND column, so we don't miss a train that's between 20th and 16th
      var this_time = Number($(this).find("td:eq(1)").text())
      if (this_time < now_time || (past_midnight && this_time >= 400)) {
        // teklog("Hiding SB " + this_time, this_time < now_time, past_midnight, this_time >= 400)
        $(this).hide()
        $("#show_all").show()
        $("#show_next").hide()
      }
    })
    $("#southbound tr:visible:gt(3)").hide()

    var this_day = now.getDay()
    var is_weekend = (this_day == 6 || this_day == 0 || this_day == 1 && past_midnight)
    // teklog("Weekend: "+ is_weekend)
    if (!is_weekend) $(".bonus").hide();

    // Never have an empty table
    if ($("#southbound tr:visible").size() < 2) {
      // teklog("Don't want empty table")
      $("#southbound tr:lt(4)").show()
    }

    if ($("#southbound tr.bonus:visible").size() == 0) $(".bonus").hide();
  }

  $("#show_next").click(showNext)
  $("#show_all").click(function() {
    $("#southbound tr, .bonus").show()
    $("#show_all").hide()
    $("#show_next").show()
  })

  showNext()

  recheck_trains = function() {
    if ($("#show_all").is(':visible')) {
      // teklog("Rechecking")
      showNext()
    }
  }
  setInterval("recheck_trains()",'10000')


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
  var schedule = [
    [  23,  1, 30], // 00:23 - 00:53 every 30
    [ 555, 60, 15], // 05:00 - 20:55 every 15
    [2123,  5, 30], // 21:23 - 23:53 every 30
  ]
  var northTimetable = []
  var now = new Date()
  var in24hr = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  var year = now.getFullYear()
  var month = now.getMonth()
  var day = now.getDate()

  $.each(schedule, function(i,v) {
    var hour = v[0] / 100
    var min = v[0] % 100
    var baseTime = new Date(year, month, day, hour, min, 0, 0)

    for (t = 0; t <= v[1]; t++) {
      var thisTime = new Date(baseTime.getTime() + t * v[2] * 60 * 1000)
      if (thisTime >= now && thisTime < in24hr) northTimetable.push(getNorthboundTimes(thisTime));
    }
  })

  $.each(schedule, function(i,v) {
    var hour = v[0] / 100
    var min = v[0] % 100
    var todayTime = new Date(year, month, day, hour, min, 0, 0)
    var baseTime = new Date(todayTime.getTime() + 24 * 60 * 60 * 1000)

    for (t = 0; t <= v[1]; t++) {
      var thisTime = new Date(baseTime.getTime() + t * v[2] * 60 * 1000)
      if (thisTime >= now && thisTime < in24hr) northTimetable.push(getNorthboundTimes(thisTime));
    }
  })

  var nb = Tempo.prepare("northbound")
  rebuild_timetables = function() {
    var now = new Date()
    if ((now.getTime() - last_loaded.getTime()) >= 60 * 60 * 1000) {
      // Reload the page, it's been more than an hour
      window.location.reload()
    }

    teklog("Rebuilding timetable", now)
    $("#northbound tr:gt(0)").remove()
    nb.render(northTimetable)
  }
  rebuild_timetables()
  setInterval("rebuild_timetables()",'10000')
})