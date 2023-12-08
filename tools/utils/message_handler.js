const { APPROVER_NUMBERS } = require("../../configs/numbers");
const { payment_message_parser } = require("../message_tools/main");
const getexistingPaymentTag = require("../../tools/message_tools/get_payments");
const getTotalAmounts = require("../../tools/message_tools/getTotalAmounts");
const numbres = require("../../configs/group_numbers");
const LambdaHandler = require("./lambda_requests");
const lambda_handler_instance = new LambdaHandler();
async function message_handler(this_object, message) {
  // try {

  //   } catch (e) {
  //     console.log(e);
  //   }
  let isBkr = false;
  if (message.from === numbres.bkr_num) {
    isBkr = true;
  }
  let regex =
    /\(\-\?\$\-?[\d,]+\.\d{1,3}\)|\(\-\?\$\-?[\d,]+\)|\$\-?[\d,]+\.\d{1,3}|\$\-?[\d,]+/g;
  if (regex.test(message.body)) {
    regex = /\((\$-?[\d,]+\.\d{1,3}|\$-?[\d,]+)\)/g;
    message.body = message.body.replace(regex, "-$1");
    console.log(message.body);
  }
  if (message.body.startsWith("PP")) {
    let { output, data } = await payment_message_parser(message.body, isBkr);
    if (!output.startsWith("Format")) {
      const wo_number_data =
        await lambda_handler_instance.get_work_order_by_wo_number(
          data["wo_number"].trim()
        );
      if (wo_number_data.length === 0) {
        message.reply(
          `WARNING: WO with wo number ${data[
            "wo_number"
          ].trim()} not found in clickup.`
        );
      }
      const company_name_from_db = wo_number_data[0].filter((element) => {
        return element === "BKR" || element === "Alpha Fixers";
      })[0];
      if (
        message.from === numbres.bkr_num &&
        company_name_from_db === "Alpha Fixers"
      ) {
        message.reply(
          `WARNING: Payment correlated to work order number ${data["wo_number"]} should be sent from Alpha Fixers payment group`
        );
        return;
      } else if (
        message.from === numbres.alpha_fixers_num &&
        company_name_from_db === "BKR"
      ) {
        message.reply(
          `WARNING: Payment correlated to work order number ${data["wo_number"]} should be sent from BKR payment group`
        );
        return;
      }
    }
    let tech_total_paid = await this_object.get_tech_total_paid(
      data["tech_name"]?.trim()
    );
    let additional_tech_total_paid = await this_object.get_tech_total_paid(
      data["additional_tech_name"]?.trim()
    );
    if (
      (tech_total_paid > 600 || additional_tech_total_paid > 600) &&
      !data["warnings"].includes("Please include w9")
    ) {
      data["warnings"] = "Please include w9";
    }

    !output.startsWith("Duplicate") &&
      !output.startsWith("Format") &&
      (output = `${output}tech_total_paid:${
        tech_total_paid !== null ? tech_total_paid : 0
      }\n`);
    if (data["additional_tech_name"] !== null) {
      let trimmed_data = data["additional_tech_name"]?.trim();
      if (
        trimmed_data !== "" &&
        trimmed_data !== "null" &&
        trimmed_data !== "None"
      ) {
        !output.startsWith("Duplicate") &&
          !output.startsWith("Format") &&
          (output = `${output}additional_tech_total_paid:${
            additional_tech_total_paid !== null ? additional_tech_total_paid : 0
          }\n`);
      }
    }
    if (!output.startsWith("Format")) {
      console.log(this_object);
      let x;
      if (message.from === numbres.alpha_fixers_num) {
        x = await getexistingPaymentTag.getexistingPaymentTag(
          data["payment_tag"],
          data["wo_number"],
          false
        );
      }
      if (message.from === numbres.bkr_num) {
        x = await getexistingPaymentTag.getexistingPaymentTag(
          data["payment_tag"],
          data["wo_number"],
          true
        );
      }

      if (x) {
        output = "Duplicate payment tag detected";
      }
      let totalAmount = 0;
      console.log(data["additional_tech_name"]);
      if (data["additional_tech_name"]) {
        if (message.from === numbres.alpha_fixers_num) {
          totalAmount = await getTotalAmounts.getTotalAmounts(
            data["additional_tech_name"],
            data["wo_number"],
            false
          );
        }
        if (message.from === numbres.bkr_num) {
          totalAmount = await getTotalAmounts.getTotalAmounts(
            data["additional_tech_name"],
            data["wo_number"],
            true
          );
        }
      } else {
        if (message.from === numbres.alpha_fixers_num) {
          totalAmount = await getTotalAmounts.getTotalAmounts(
            data["tech_name"],
            data["wo_number"],
            false
          );
        }
        if (message.from === numbres.bkr_num) {
          totalAmount = await getTotalAmounts.getTotalAmounts(
            data["tech_name"],
            data["wo_number"],
            true
          );
        }
      }
      console.log(data["total_amount"]);
      if (data["total_amount"] && totalAmount !== data["total_amount"]) {
        await message.reply(
          `The calculated total amount for ${
            data["additional_tech_name"]
              ? data["additional_tech_name"]
              : data["tech_name"]
          }for work order ${data["wo_number"]} is ${totalAmount}$`
        );
      }
    }

    const reply = await message.reply(output);
    if (output?.startsWith("Format") === false) {
      this_object.incoming_messages_id_object_mapping[message.id["id"]] =
        message;
      this_object.reply_messages_id_object_mapping[reply.id["id"]] = reply;
      this_object.reply_messages_id_text_mapping[reply.id["id"]] = data;
      this_object.incomming_to_reply_mapping[message.id["id"]] = [reply];
      this_object.timestamp_mappings[message.timestamp] = [reply];
    }
  } else if (message.body.startsWith("RR")) {
    let isBkr = false;
    if (message.from === numbres.bkr_num) {
      isBkr = true;
    }
    const { output, data } = payment_message_parser(message.body, isBkr);
    const reply = await message.reply(output);
    if (output?.startsWith("Format") === false) {
      this_object.incoming_messages_id_object_mapping[message.id["id"]] =
        message;
      this_object.reply_messages_id_object_mapping[reply.id["id"]] = reply;
      this_object.reply_messages_id_text_mapping[reply.id["id"]] = data;
      this_object.incomming_to_reply_mapping[message.id["id"]] = [reply];
      this_object.timestamp_mappings[message.timestamp] = [reply];
    }
  }
}
module.exports = {
  message_handler,
};
