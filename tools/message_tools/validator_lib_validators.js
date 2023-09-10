var validator = require("validator");

function phone_validator(string_to_check) {
  return validator.isMobilePhone(string_to_check, "any", {
    strictMode: false, //used to enforce country code
  });
}
function email_validator(string_to_check) {
  return validator.isEmail(string_to_check);
}
module.exports = {
  phone_validator,
  email_validator,
};
