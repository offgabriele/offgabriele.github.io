$('#uploadFirmwareFile').change(function() {
    var file = $('#uploadFirmwareFile')[0].files[0];    
    readFile(file);
  });