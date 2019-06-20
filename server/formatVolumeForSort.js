const numeral = require('numeral');
// Formatting search volume from strings to numbers
module.exports = function formatVolumeForSort(volume) {
  const splitNumbers = volume.split('-');
  const formattedNumbers = splitNumbers.map((number) => {
    const { _value } = numeral(number.toLowerCase().replace('+', ''));
    return _value;
  });
  if (formattedNumbers.length === 2) {
    return (formattedNumbers[0] + formattedNumbers[1]) / 2;
  }
  return formattedNumbers[0];
};
