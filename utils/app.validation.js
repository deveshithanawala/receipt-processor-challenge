function isValidDate(dateString) {
    return !isNaN(new Date(dateString).getTime());
  }
  
  function isValidTime(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return !isNaN(hours) && !isNaN(minutes) && hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
  }
  
  module.exports = {
    isValidDate,
    isValidTime,
  };
  