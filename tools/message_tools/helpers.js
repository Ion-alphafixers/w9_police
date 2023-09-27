const validators = require("./sections_validators");

function data_initializer() {
  return {
    wo_number: null,
    tech_name: null,
    tech_phone: null,
    additional_tech_name: null,
    payment_method: null,
    payment_address: null,
    payment_tag: null,
    amount: null,
    total_amount: null,
    note: null,
    warnings: "",
  };
}
function extract_url_controller(data, message) {
  const extract_url_from_string = validators.extract_link(message);
  message = extract_url_from_string["remainder"];
  data["payment_address"] = extract_url_from_string["url"];
  return { message, data };
}
function extracted_amounts_resolver(
  data,
  extracted_amounts,
  message,
  
) {
  if (
    extracted_amounts["amount"] === null &&
    extracted_amounts["total_amount"] === null
  ) {
    return validators.check_for_amounts_with_no_currency_symbol(message);
  } else if (
    extracted_amounts["amount"] !== null &&
    extracted_amounts["total_amount"] === null
  ) {
    data["amount"] = extracted_amounts["amount"];
  } else if (
    extracted_amounts["amount"] !== null &&
    extracted_amounts["total_amount"] !== null
  ) {
    data["amount"] = extracted_amounts["amount"];
    data["total_amount"] = extracted_amounts["total_amount"];
  }
  if (data["amount"] >= 5000) {
    data["warnings"] +=
      "warning: payment amount exceeds $5,000, proceed with caution/";
  }
}
function capitalizeFirstLetter(inputString) {
  // Check if the inputString is empty or null
  if (!inputString) return inputString;

  // Capitalize the first letter and concatenate it with the rest of the string
  return inputString.charAt(0).toUpperCase() + inputString.slice(1).toLowerCase();
}

module.exports = {
  capitalizeFirstLetter,
  data_initializer,
  extract_url_controller,
  extracted_amounts_resolver,
};
