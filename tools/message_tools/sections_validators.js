const payment_methods = require("../../configs/payment_methods");
const validators = require("./validator_lib_validators");

function check_number_of_slashes(message) {
  //clean the message from https:// coming from payment addresses of credit
  message = message.split("//")[0];
  message = message.split("/");
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
  return {
    note: splitted_text[1],
    message: splitted_text[0],
  };
}
function extract_amounts_and_message(inputString) {
  const regex = /\$\d+(?:,\d{3})*(?:\.\d{2})?/g; // Match dollar amounts (e.g., $500 or $720.45)
  const matches = inputString.match(regex);

  if (!matches) {
    return {
      amount: null,
      total_amount: null,
      message: inputString.replace(/\$\d+(?:,\d{3})*(?:\.\d{2})?/g, "").trim(),
    }; // No matches found, treat the whole string as the message
  }

  if (matches.length === 2) {
    const [amount, totalAmount] = matches.map((match) =>
      parseFloat(match.replace(/\$/g, "").replace(/,/g, ""))
    );
    let message = inputString.replace(regex, "").trim();

    // Replace trailing "/ /" with "/"
    message = message.replace(/\/\s*\/$/, "/");

    return {
      amount,
      total_amount: totalAmount,
      message,
    };
  } else if (matches.length === 1) {
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
      message: inputString.replace(/\$\d+(?:,\d{3})*(?:\.\d{2})?/g, "").trim(),
    }; // No matches found or insufficient matches found
  }
}
function check_for_amounts_with_no_currency_symbol(message) {
  const splitted_message = message.split("/");
  const lastIndex = splitted_message.length - 1;
  const secondToLastIndex = lastIndex - 1;

  if (lastIndex >= 0 && secondToLastIndex >= 0) {
    const lastItem = parseInt(splitted_message[lastIndex]);
    const secondToLastItem = parseInt(splitted_message[secondToLastIndex]);
    if (lastItem === NaN && secondToLastItem === NaN) {
      return "Format error: No amount specified, please enter the required amount to be paid";
    } else if (typeof lastItem === "number" && secondToLastItem === NaN) {
      return "Format error: payment amount should be dollar amount. Example: $50";
    } else if (
      typeof secondToLastItem === "number" &&
      typeof lastItem === "number"
    ) {
      return "Format error: payment amount and total amount should be dollar amount. Example: $50/$150";
    }
  } else {
    return "Format error: Payment message not constructed correctly";
  }
  return "Format error: Payment message not constructed correctly";
}
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

function extract_payment_tag(message) {
  message = message.split("/");
  let payment_tag = message.pop().trim();
  var count_of_separators = (payment_tag.match(/-/g) || []).length;
  if (count_of_separators != 2) {
    return "Format error: payment tag should contain 3 parts";
  }
  let payment_tag_validation = is_valid_payment_tag(payment_tag);
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
  if (payment_methods.includes(message[0].trim())) {
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
      return info[1].length === identifier_length;
    } else if (mathematical_operation === "<=") {
      return info[1].length <= identifier_length;
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
    if (message[0].trim() === "Credit" || message[0].trim() === "Credit Card") {
      return {
        payment_method: message[0].trim(),
        payment_address: null,
      };
    } else {
      return "Format Error: Payment adress not defined";
    }
  } else if (message.length === 2) {
    if (payment_methods.includes(message[0].trim()) === false) {
      return `Format error: payment method not recognized, payment method has to be one of the following ${payment_methods.join(
        ", "
      )}`;
    }
    if (message[0] === "Zelle") {
      if (
        (validators.email_validator(message[1]) ||
          validators.phone_validator(message[1])) === true
      ) {
        return {
          payment_method: message[0],
          payment_address: message[1],
        };
      } else {
        return "Warning: payment address for Zelle should be phone number or email address";
      }
    } else if (message[0] === "ACH") {
      const payment_address = message[1];

      if (assert_ach_payment_info(payment_address) === true) {
        return {
          payment_method: message[0],
          payment_address: message[1],
        };
      } else {
        return "warning: payment address for ACH should be of the format Rout# xxxxxx, Acct # xxxxxx;  where routing numbers are 9 digits long and acct numbers up to 17 digits";
      }
    } else {
      return {
        payment_method: message[0],
        payment_address: message[1],
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
