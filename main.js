var recheck_trains

$(function() {
  function showNext() {
    var now = new Date()
    var now_time = now.getHours()*100 + now.getMinutes()
    var past_midnight = now_time < 400

    // n+2 to skip the header row
    $("#southbound tr:nth-child(n+2)").each(function() {
      // eq(1) checks the SECOND column, so we don't miss a train that's between 20th and 16th
      var this_time = Number($(this).find("td:eq(1)").text())
      if (this_time < now_time || (past_midnight && this_time >= 400)) {
        console.log("Hiding SB " + this_time, this_time < now_time, past_midnight, this_time >= 400)
        $(this).hide()
        $("#show_all").show()
        $("#show_next").hide()
      }
    })

    var this_day = now.getDay()
    var is_weekend = (this_day == 6 || this_day == 0 || this_day == 1 && past_midnight)
    console.log("Weekend: "+ is_weekend)
    if (!is_weekend) $(".bonus").hide();
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
      console.log("Rechecking")
      showNext()
    }
  }
  setInterval("recheck_trains()",'10000')
})