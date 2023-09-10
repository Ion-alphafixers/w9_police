function is_valid_payment_tag(paymentTag) {
  const purpose_test = validate_purpose(paymentTag.split("-")[2]);
  let fm_test = paymentTag.split("-")[1].length <= 2;
  return { purpose_test, fm_test };
}
function validate_purpose(purpose) {
  const regex = /^[AMJR](\d+|\d*\.\d{1})?$/;
  const elements = purpose.split("+");

  for (const element of elements) {
    if (!regex.test(element)) {
      return false; // Return false if any element doesn't match the regex
    }
  }

  return true; // Return true if all elements match the regex
}

console.log(is_valid_payment_tag("  152632-T-J"));
