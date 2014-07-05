$('#fileupload').fileupload({
  done: function(event, data) {
    console.log('File has been uploaded');
  },
  progressall: function (e, data) {
    var progress = parseInt(data.loaded / data.total * 100, 10);
    $('.progress-bar').css('width', progress + '%');
  }
});

//Post the invite
var $form = $('.form-inline'),
    data = $form.find( "#emailInvite" ).val(),
    btn = $form.find("button");

btn.on('click', function(){
  $.ajax({
    type: "POST",
    url: '/invite',
    data: data,
    success: function(){
      $form.append('<div class="alert alert-success" role="alert"><strong>Well done!</strong> Comming soon.</div>');
    }
  });
})