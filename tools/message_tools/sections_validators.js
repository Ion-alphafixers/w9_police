const payment_methods = require("../../configs/payment_methods");
const validators = require("./validator_lib_validators");

function check_number_of_slashes(message) {
  message = message.split("//");
  //clean the message from https:// coming from payment addresses of credit
  if (message.length > 1 && message[1].split("/").length > 1) {
    return "Format error: consecutive forward slashes (//) only allowed for note specification";
  }
  message = message[0].split("/");
  if (message.length < 4) {
    return "Format error: too few fields, please make sure payment instruction includes all elements separated by /";
  } else if (message.length > 8) {
    return "Format error: too many fields, please make sure payment instruction includes all elements separated by /";
  } else {
    return true;
  }
}
function remove_from_left(message) {
  const parts = message.split("/");
  const firstPart = parts.shift(); // Get the first part
  const restOfTheString = parts.join("/");
  return {
    first_part: firstPart,
    rest_of_the_string: restOfTheString,
  };
}
function extract_link(message) {
  const urlPattern = /(https?:\/\/[^\s]+)/;
  const matches = message.match(urlPattern);

  if (matches && matches.length > 0) {
    const extractedUrl = matches[0];
    const remainder = message.replace(extractedUrl, "").trim();
    return {
      url: extractedUrl,
      remainder: remainder,
    };
  } else {
    // If no URL found, return the original input string
    return {
      url: null,
      remainder: message,
    };
  }
}
function extract_note(message) {
  const splitted_text = message.split("//");

  if (splitted_text.length === 1) {
    return {
      note: null,
      message: message,
    };
  }
  if (splitted_text[1].length === 0) {
    return "Format error: empty note";
  }
  return {
    note: splitted_text[1],
    message: splitted_text[0],
  };
}
function check_for_negative_amounts(
  number_of_matches,
  inputString,
  is_rr_message
) {
  let splitted_input = inputString.split("/");
  if (number_of_matches === 0) {
    return "Format error: No dollar amount found";
  } else if (number_of_matches === 1 && is_rr_message) {
    if (splitted_input[splitted_input.length - 1].includes("-") === false) {
      return "Format error: RR payment should have a negative amount";
    }
    splitted_input[splitted_input.length - 1] = splitted_input[
      splitted_input.length - 1
    ].replace("-", "");
  } else if (number_of_matches === 2 && is_rr_message) {
    if (splitted_input[splitted_input.length - 1].includes("-") === true) {
      return "Format error: RR total amount cannot be a negative amount";
    } else if (
      splitted_input[splitted_input.length - 2].includes("-") === false
    ) {
      return "Format error: RR payment should have a negative amount";
    }
    splitted_input[splitted_input.length - 1] = splitted_input[
      splitted_input.length - 1
    ].replace("-", "");
  }

  try {
    return {
      inputString: splitted_input.join("/"),
    };
  } catch (e) {
    console.log();
  }
}
function extract_amounts_and_message(inputString, is_rr_message) {
  const regex = /\$[\d,]+\.\d{1,3}|\$[\d,]+/g;
  // if (/^\d{1,3}(?:,\d{3})*(?![\d,])$/.test(inputString) === false) {
  //   return "Format error: , separator should define a thousand separator";
  // }
  if (!/\$\d/.test(inputString)) {
    return "Format error: No dollar amounts found";
  }

  // Match consecutive dollar amounts with or without cents
  let amounts_with_no_currency_symbol_check =
    check_for_amounts_with_no_currency_symbol(inputString);
  if (typeof amounts_with_no_currency_symbol_check === "string") {
    return amounts_with_no_currency_symbol_check;
  }
  const matches = inputString.match(regex);

  if (!matches) {
    return {
      amount: null,
      total_amount: null,
      message: inputString.trim(),
    }; // No matches found, treat the whole string as the message
  }

  if (matches.length === 2) {
    const negative_amount_checker = check_for_negative_amounts(
      matches.length,
      inputString,
      is_rr_message
    );
    if (typeof negative_amount_checker === "string") {
      return negative_amount_checker;
    } else {
      inputString = negative_amount_checker["inputString"];
    }
    let message = inputString.split("$");
    message.pop();
    message.pop();
    const splitted_message_with_poped_amounts = [...message];
    message = message.join("$");
    message = message.slice(0, -1);

    // Replace trailing "/ /" with "/"
    message = message.replace(/\/\s*\/$/, "/");

    if (
      is_valid_payment_tag(matches[0]) &&
      is_valid_payment_tag(
        splitted_message_with_poped_amounts[
          splitted_message_with_poped_amounts.length - 1
        ]
      ) === false
    ) {
      return "Format error: dollar sign not allowed inside payment-tag";
    }
    const regex =
      /\$(\d{1,3}(?:,\d{3})*(\.\d{1,3})?)\s*\/\s*\$(\d{1,3}(?:,\d{3})*(\.\d{1,3})?)/g;
    if (!regex.test(inputString)) {
      return "Format error: the dollar amount should be separated by / only";
    }
    const [amount, totalAmount] = matches.map((match) =>
      parseFloat(match.replace(/\$/g, "").replace(/,/g, ""))
    );

    return {
      amount,
      total_amount: totalAmount,
      message,
    };
  } else if (matches.length === 1) {
    const negative_amount_checker = check_for_negative_amounts(
      matches.length,
      inputString,
      is_rr_message
    );
    if (typeof negative_amount_checker === "string") {
      return negative_amount_checker;
    } else {
      inputString = negative_amount_checker["inputString"];
    }
    const amount = parseFloat(matches[0].replace(/\$/g, "").replace(/,/g, ""));
    let message = inputString.replace(matches[0], "").trim();

    // Replace trailing "/ /" with "/"
    message = message.replace(/\/\s*\/$/, "/");

    return {
      amount,
      total_amount: null,
      message,
    };
  } else {
    return {
      amount: null,
      total_amount: null,
      message: inputString.trim(),
    }; // No matches found or insufficient matches found
  }
}
function check_for_amounts_with_no_currency_symbol(message) {
  const splitted_message = message.split("/");
  const lastIndex = splitted_message.length - 1;
  const secondToLastIndex = lastIndex - 1;

  if (lastIndex >= 0 && secondToLastIndex >= 0) {
    const lastItem = parseFloat(splitted_message[lastIndex]);
    let secondToLastItem = parseFloat(splitted_message[secondToLastIndex]);
    if (/[^0-9]/.test(splitted_message[secondToLastIndex])) {
      secondToLastItem = NaN;
    }
    if (
      isNaN(lastItem) === false &&
      isNaN(secondToLastItem) &&
      splitted_message[secondToLastIndex].includes("$")
    ) {
      // $500/720 test case
      return "Format error: payment total amount should be dollar amount. Example: $50/$150";
    } else if (
      isNaN(secondToLastItem) === false &&
      isNaN(lastItem) &&
      splitted_message[lastIndex].includes("$") &&
      splitted_message[secondToLastIndex].includes("$") === false
    ) {
      // 500/$720 test case
      return "Format error: payment amount should be dollar amount. Example: $50";
    } else if (
      isNaN(secondToLastItem) &&
      isNaN(lastItem) &&
      splitted_message[lastIndex].includes("$") === true &&
      splitted_message[secondToLastIndex].includes("$") === false
    ) {
      // 151488-T-J/$720 test case
      return;
    } else if (
      isNaN(secondToLastItem) === false &&
      isNaN(lastItem) === false &&
      splitted_message[lastIndex].includes("$") === false &&
      splitted_message[secondToLastIndex].includes("$") === false
    ) {
      // 500/720 test case
      return "Format error: payment amount and total amount should be dollar amount. Example: $50/$150";
    } else if (
      isNaN(secondToLastItem) &&
      isNaN(lastItem) &&
      splitted_message[lastIndex].includes("$") &&
      splitted_message[secondToLastIndex].includes("$")
    ) {
      // $500/$720 test case
      return;
    } else if (
      isNaN(secondToLastItem) &&
      isNaN(lastItem) === false &&
      splitted_message[lastIndex].includes("$") === false &&
      splitted_message[secondToLastIndex].includes("$") === false
    ) {
      // $500/$720 test case
      return "Format error: payment amount should be dollar amount. Example: $50";
    } else if (
      splitted_message.length === 5 &&
      isNaN(secondToLastItem) &&
      splitted_message[secondToLastIndex].includes("$")
    ) {
      return;
    }
  } else {
    return "Format error: Payment message not constructed correctly";
  }
  return "Format error: Payment message not constructed correctly";
}
function is_valid_payment_tag(paymentTag) {
  try {
    const splitted_payment_tag = paymentTag.split("-");
    const purpose_test = validate_purpose(
      splitted_payment_tag[splitted_payment_tag.length - 1]
    );
    let fm_test = splitted_payment_tag[splitted_payment_tag - 2].length <= 2;
    return { purpose_test, fm_test };
  } catch (e) {
    return "Format error: payment tag wrongly formatted";
  }
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

function extract_payment_tag(message) {
  message = message.split("/");
  let payment_tag = message.pop().trim();
  let payment_tag_validation = is_valid_payment_tag(payment_tag);
  var count_of_separators = (payment_tag.match(/-/g) || []).length;
  if (count_of_separators < 2) {
    return "Format error: payment tag should contain 3 parts";
  }
  if (
    payment_tag_validation["purpose_test"] === false &&
    payment_tag_validation["fm_test"] === false
  ) {
    return "Format error: payment purpose and fm not recognized";
  }
  if (payment_tag_validation["purpose_test"] === false) {
    return "Format error: payment purpose not recognized";
  }
  if (payment_tag_validation["fm_test"] === false) {
    return "Format error: FM not recognized";
  }

  return {
    payment_tag,
    message: message.join("/"),
  };
}
function check_for_additional_tech_name(message) {
  message = message.split("/");
  if (payment_methods.includes(message[0].trim().toLowerCase())) {
    return {
      additional_tech_name: null,
      message: message.join("/"),
    };
  } else {
    return {
      additional_tech_name: message.shift(),
      message: message.join("/"),
    };
  }
}

function assert_ach_payment_info(payment_address) {
  function common_assertions(
    info,
    identifier,
    mathematical_operation,
    identifier_length
  ) {
    info = info.split("#");
    if (info.length !== 2) {
      return false;
    }
    if (info[0].trim() !== identifier) {
      return false;
    }
    if (mathematical_operation === "=") {
      return info[1].trim().length === identifier_length;
    } else if (mathematical_operation === "<=") {
      return info[1].trim().length <= identifier_length;
    }
  }
  payment_address = payment_address.replace("(", "");
  payment_address = payment_address.replace(")", "");
  let payment_infos = payment_address.split(",");
  let route_info = payment_infos[0];
  let acc_info = payment_infos[1];
  return (
    common_assertions(route_info, "Rout", "=", 9) &&
    common_assertions(acc_info, "Acct", "<=", 17)
  );
}
function extract_payment_method_and_payment_address(message) {
  message = message.split("/");
  if (message.length === 0) {
    return "Format Error: Payment message not constructed correctly";
  } else if (message.length === 1) {
    if (
      message[0].trim().toLowerCase() === "credit" ||
      message[0].trim().toLowerCase() === "credit card"
    ) {
      return {
        payment_method: message[0].trim(),
        payment_address: null,
      };
    } else if (payment_methods.includes(message[0].trim().toLowerCase())) {
      return "Format Error: Payment adress not defined correctly";
    } else if (
      payment_methods.includes(message[0].trim().toLowerCase()) === false
    ) {
      return `Format error: payment method not recognized, payment method has to be one of the following ${payment_methods.join(
        ", "
      )}`;
    }
  } else if (message.length === 2) {
    if (payment_methods.includes(message[0].trim().toLowerCase()) === false) {
      return `Format error: payment method not recognized, payment method has to be one of the following ${payment_methods.join(
        ", "
      )}`;
    }
    if (message[0].trim().toLowerCase() === "zelle") {
      if (
        (validators.email_validator(message[1].trim().toLowerCase()) ||
          validators.phone_validator(message[1].trim().toLowerCase())) === true
      ) {
        return {
          payment_method: message[0].trim(),
          payment_address: message[1].trim(),
        };
      } else {
        return "Warning: payment address for Zelle should be phone number or email address";
      }
    } else if (message[0].trim().toLowerCase() === "ach") {
      const payment_address = message[1].trim();

      if (assert_ach_payment_info(payment_address) === true) {
        return {
          payment_method: message[0].trim(),
          payment_address: message[1].trim(),
        };
      } else {
        return "warning: payment address for ACH should be of the format Rout# xxxxxx, Acct # xxxxxx;  where routing numbers are 9 digits long and acct numbers up to 17 digits";
      }
    } else if (message[0].trim().toLowerCase() === "cashapp") {
      const payment_address = message[1].trim();
      if (payment_address.startsWith("$") === false) {
        return "warning: payment address for Cashapp has to start with $";
      }
      return {
        payment_method: message[0].trim(),
        payment_address: message[1].trim(),
      };
    } else if (message[0].trim().toLowerCase() === "venmo") {
      const payment_address = message[1].trim();
      if (payment_address.startsWith("@") === false) {
        return "warning: payment address for Venmo has to start with @";
      }
      return {
        payment_method: message[0].trim(),
        payment_address: message[1].trim(),
      };
    } else {
      return {
        payment_method: message[0].trim(),
        payment_address: message[1].trim(),
      };
    }
  }
}
module.exports = {
  extract_payment_tag,
  validate_purpose,
  is_valid_payment_tag,
  check_for_amounts_with_no_currency_symbol,
  extract_amounts_and_message,
  extract_note,
  extract_link,
  remove_from_left,
  check_number_of_slashes,
  check_for_additional_tech_name,
  extract_payment_method_and_payment_address,
};
