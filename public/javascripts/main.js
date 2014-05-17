$('#fileupload').fileupload({
  done: function(event, data) {
    console.log('File has been uploaded');
  },
  progressall: function (e, data) {
    var progress = parseInt(data.loaded / data.total * 100, 10);
    console.log(progress);
    $('.progress-bar').css('width', progress + '%');
  }
});