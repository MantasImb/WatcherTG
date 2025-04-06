function getAge(timestamp) {
  let difference = new Date().getTime() - timestamp * 1000;

  let totalSeconds = Math.floor(difference / 1000);
  if (totalSeconds <= 59) return `${totalSeconds} secs`;

  let totalMinutes = Math.floor(difference / (1000 * 60));
  if (totalMinutes <= 59) return `${totalMinutes} mins`;

  let totalHours = Math.floor(difference / (1000 * 3600));
  if (totalHours <= 23) return `${totalHours} hours`;

  let totalDays = Math.floor(difference / (1000 * 3600 * 24));
  if (totalDays <= 89) return `${totalDays} days`;

  let totalMonths = Math.floor(difference / (1000 * 3600 * 24 * 30));
  if (totalMonths <= 23) return `${totalMonths} months`;

  let totalYears = Math.floor(difference / (1000 * 3600 * 24 * 30 * 365));
  return `${totalYears} years`;
}

// function getAgeTest(timeNow, timestamp) {
//   let difference = timeNow - timestamp * 1000
//   console.log(difference)
//   let TotalYears = Math.ceil(difference / (1000 * 3600 * 24 * 30 * 365))
//   let TotalMonths = Math.ceil(difference / (1000 * 3600 * 24 * 30))
//   let TotalDays = Math.ceil(difference / (1000 * 3600 * 24))
//   let TotalHours = Math.ceil(difference / (1000 * 3600))
//   let TotalMinutes = Math.ceil(difference / (1000 * 60))
//   let TotalSeconds = Math.ceil(difference / 1000)

//   console.log(
//     `Y:${TotalYears} M:${TotalMonths} D:${TotalDays}, H:${TotalHours}, M:${TotalMinutes}, S:${TotalSeconds}`
//   )
// }

module.exports = getAge;
