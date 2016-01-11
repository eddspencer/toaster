const VoiceBox = function (state) {
  this.debugFlag = false;

  this.debug = function (txt) {
    if (this.debugFlag) {
      console.log(txt);
    }
  };

};

module.exports = VoiceBox;