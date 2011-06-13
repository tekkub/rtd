var recheck_trains

$(function() {
  function teklog() {
    if (location.host == "localhost") {
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
        teklog("Hiding SB " + this_time, this_time < now_time, past_midnight, this_time >= 400)
        $(this).hide()
        $("#show_all").show()
        $("#show_next").hide()
      }
    })
    $("#southbound tr:visible:gt(3)").hide()

    var this_day = now.getDay()
    var is_weekend = (this_day == 6 || this_day == 0 || this_day == 1 && past_midnight)
    teklog("Weekend: "+ is_weekend)
    if (!is_weekend) $(".bonus").hide();

    // Never have an empty table
    if ($("#southbound tr:visible").size() < 2) {
      teklog("Don't want empty table")
      $("#southbound tr:lt(4)").show()
      if ($("#southbound tr.bonus:visible").size() == 0) $(".bonus").hide();
    }
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
      teklog("Rechecking")
      showNext()
    }
  }
  setInterval("recheck_trains()",'10000')
})