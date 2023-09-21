const { data_initializer, extracted_amounts_resolver } = require("./helpers");
const validators = require("./sections_validators");
const validators_lib = require("./validator_lib_validators");
function payment_message_parser(message) {
  let data = data_initializer();
  const is_rr_message = message.includes("RR") && message.startsWith("RR");
  // console.log(message);
  if (
    message ==
    "RR: Jon Doe/ (803)555,5555/Zelle / +16783321134/ 151488-T-J/ $500"
  ) {
    console.log();
  }
  if (
    message.startsWith("PP") === false &&
    message.startsWith("RR") === false
  ) {
    return;
  }
  message = message.replace("PP:", "").trim();
  message = message.replace("RR:", "").trim();

  const extract_url_from_string = validators.extract_link(message);
  message = extract_url_from_string["remainder"];
  data["payment_address"] = extract_url_from_string["url"];
  const message_length_check = validators.check_number_of_slashes(message);
  if (message_length_check !== true) {
    // console.log(message_length_check);
    return{output: message_length_check,data:{}}
  }
  let left_pop = validators.remove_from_left(message);
  // Test if the string contains an integer
  if (validators_lib.phone_validator(left_pop["first_part"].trim())) {
    return{output: "Format error: tech name not found",data:{}}
  } else if (/-?\d+/.test(left_pop["first_part"]) === true) {
    return{output: "Format error: tech name or phone number wrongly formatted",data:{}}
  }

  data["tech_name"] = left_pop["first_part"];
  left_pop = validators.remove_from_left(left_pop["rest_of_the_string"]);
  left_pop["first_part"] = left_pop["first_part"].replace(",", "-");
  if (validators_lib.phone_validator(left_pop["first_part"].trim()) === false) {
    return{output: "Format error: tech/vendor phone number not found, please enter 9 digit tech phone number",data:{}}
  } else {
    data["tech_phone"] = left_pop["first_part"];
  }
  const extracted_note = validators.extract_note(
    left_pop["rest_of_the_string"]
  );
  if (typeof extracted_note === "string") {
    return{output: extracted_note,data:{}}
  }
  data["note"] = extracted_note["note"];
  // if (isNaN(parseInt(message[message.length - 1]))) {
  //   return{output: "Format error: payment text should end with dollar amount",data:{}}
  // }
  const extracted_amounts = validators.extract_amounts_and_message(
    extracted_note["message"],
    is_rr_message
  );
  if (typeof extracted_amounts === "string") {
    return{output: extracted_amounts,data:{}}
  }
  let resolved_amounts = extracted_amounts_resolver(
    data,
    extracted_amounts,
    message
  );
  if (typeof resolved_amounts === "string") {
    return{output: resolved_amounts,data:{}}
  } else if (parseFloat(data["amount"]) > parseFloat(data["total_amount"])) {
    return{output: "Format error: amount larger than total amount",data:{}}
  }
  const extracted_payement_tag = validators.extract_payment_tag(
    extracted_amounts["message"].replace(/\/+$/, "")
  );
  if (typeof extracted_payement_tag === "string") {
    console.log(extracted_payement_tag);
    return{output: extracted_payement_tag,data:{}}
  }
  data["payment_tag"] = extracted_payement_tag["payment_tag"];
  data["wo_number"] = extracted_payement_tag["payment_tag"].split("-")[0];
  // REMOVE THE BELOW LOGIC TO TURN OFF THE TEST CASE 2 MENTIONED IN THE NOTION DISCUSSION

  let extracted_tech_additional_name =
    validators.check_for_additional_tech_name(
      extracted_payement_tag["message"]
    );
  data["additional_tech_name"] =
    extracted_tech_additional_name["additional_tech_name"];

  // REMOVE THE ABOVE LOGIC TO TURN OFF THE TEST CASE 2 MENTIONED IN THE NOTION DISCUSSION

  const extracted_payment_info =
    validators.extract_payment_method_and_payment_address(
      extracted_tech_additional_name["message"]
    );
  if (typeof extracted_payment_info === "string") {
    return{output: extracted_payment_info,data:{}}
  }
  data["payment_method"] = extracted_payment_info["payment_method"];
  data["payment_address"] =
    data["payment_address"] === null
      ? extracted_payment_info["payment_address"]
      : data["payment_address"];
  // console.log(extracted_tech_additional_name["message"]);
  // console.log(data);
  let output = "";

  for (const [key, value] of Object.entries(data)) {
    output += `${key}: ${value}\n`;
  }
  return {output,data};
}
let test_messages = [
  "PP: Osceola Air LLC/ (407) 439-1995/  Credit Card / https://client.housecallpro.com/pay_invoice/43e46deb2efbdcc64ee0be0a06c02a08b5d7c369ee94ea2a1a70bf61d7cf0e36_e9142c3990e632ca80a97841983c930bcd81116455b128698285224d476ff99a/ 152632-T-J / $309.75 ",
  "PP: Jon Doe/ (803)991-8877/Cashapp/ $johnDoe / 151488-T-A0.5/ $50",
  "PP: Jon Doe/(803)991-8877/ Kate Doe/Zelle / +16783321134/ 151488-T-J/ $500/ $720 //Paid his wife Kate",
  "PP: Jon Doe/ 512-981-3033/ AB plumbing/Credit/704465-D-A+J/ $300",
  "PP: AB plumbing/512-981-3033/ Credit/704465-D-A+J/ $300",
  "PP: Jon Doe/ (803)991-8877/Cashapp/ $johnDoe / 151488-T-A/ $50 / $100",
  "PP: Joe Garcia/ (803)457-3409/Venmo/ @Jgarc/ 151488-T-A2/ $75 /$175",
  "PP: Jon Doe/ 80399-8877/ Home Depot/ Credit/ 151488-T-M/ $45/ $220",
  "PP: Abe Bon/ 512-981-3033/ AB plumbing/Credit/704465-D-A+J/ $300",
  "PP: DISCOUNT FLOORING AND SUPPLY,LLC/ 770 676 0164/ Credit Card/ 152564-T-M/ $3,005.10/ $3080.10",
  "PP: Jake Silva/ (678)332-1134/ ACH/ (Rout#026027315, Acct #63103380)/132649-A-R/ $1,200.02",
  "PP: Eduardo Garcia/ (678)444-1244/ Check/ 7 main street, Miami, FL 32054 / TMG-AWS-213-Ti-R/ $783 // This is our second recall for this job",
];
// test_messages.forEach((message) => {
//   payment_message_parser(message);
//   console.log("======================");
// });
module.exports = {
  payment_message_parser,
};
