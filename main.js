// Read the file chosen by the user.
function readFile(file) {
    // Open the file and start reading it.
    var reader = new FileReader();
    reader.onloadend = function() {      
      readMetadata(file, reader.result);
    }
    reader.readAsArrayBuffer(file);
  }
  // Extract the version string from the given file data.
  function getFirmwareVersion(data) {
    var enc = new TextDecoder("utf-8");
    var s = enc.decode(data);
    var re = new RegExp("__MaGiC__ [^_]+ ___");
    var result = re.exec(s);
    if (result == null) {
      return null;
    }
    return result[0];
  }
  // Called when we're done reading the file data.
  function readMetadata(file, data) {
    version = getFirmwareVersion(data);
    if (version == null) {
      console.log("Could not extract magic string from binary.");
      return;
    }
    // Upload firmware binary to Firebase Cloud Storage.
    // We use the version string as the filename, since
    // it's assumed to be unique.
    var uploadRef = storageRef.child(version); 
    uploadRef.put(file).then(function(snapshot) {
      // Upload completed. Get the URL. 
      uploadRef.getDownloadURL().then(function(url) {
        saveMetadata(file.name, version, url);
      });
    });
  }
  // Save the metadata to Realtime Database.
  function saveMetadata(filename, version, url) {
    var dbRef = firebase.database().ref('firmware/' + version);
    var metadata = {
      // This bit of magic causes Firebase to write the
      // server timestamp when the data is written to the
      // database record.
      dateUploaded: firebase.database.ServerValue.TIMESTAMP,
      filename: filename,
      url: url,
    };
    dbRef.set(metadata).then(function() {
      console.log("Success!");
    })
    .catch(function(error) {
      console.log("Error: " + error.message);
    });
  }