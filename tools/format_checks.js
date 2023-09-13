const payment_methods = require("../configs/payment_methods");
const { data_initializer } = require("./message_tools/helpers");

function format_check(entry_value, entry_name) {
  if (Object.keys(data_initializer()).includes(entry_name) === false) {
    throw new Error(
      `Invalid entry name ${entry_name} check format_check function`
    );
  }
  switch (entry_name) {
    case "tech_name":
      if (/^[^/]*$/.test(entry_value)) {
        return true;
      } else {
        return false;
      }
    case "tech_phone":
      if (/^[\d()+\- ]+$/.test(entry_value)) {
        return true;
      } else {
        return false;
      }
    case "additional_tech_name":
      if (/^[^/]*$/.test(entry_value)) {
        return true;
      } else {
        return false;
      }
    case "payment_method":
      if (payment_methods.includes(entry_value)) {
        return true;
      } else {
        return false;
      }
    case "payment_address":
      if (/^[\s\S]*$/.test(entry_value)) {
        return true;
      } else {
        return false;
      }
    case "payment_tag":
      if (/^[\w-]+-[A-Za-z]{1,2}-[A-Za-z\d_.+-]+$/.test(entry_value)) {
        return true;
      } else {
        return false;
      }
    case "amount":
      if (/^\$[0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})?$/.test(entry_value)) {
        return true;
      } else {
        return false;
      }
    case "total_amount":
      if (/^\$[0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})?$/.test(entry_value)) {
        return true;
      } else {
        return false;
      }
  }
}
module.exports = {
  format_check,
};
