const { APPROVER_NUMBERS } = require("../../configs/numbers");
const { payment_message_parser } = require("../message_tools/main");
const getexistingPaymentTag = require("../../tools/message_tools/get_payments");
const getexistingPayments = require("../../tools/message_tools/get_wo_availibility");
const numbres = require("../../configs/group_numbers");
const getTotalAmounts = require("../../tools/message_tools/getTotalAmounts");
const checkPhoneNumber = require("../../tools/message_tools/check_existing_phone_number");
const check_if_name_matches_phone_number = require("../../tools/message_tools/check_if_name_matches_phone_number");
const addRecipientAndAddressToTechsDB = require("../../tools/message_tools/add_recipient_to_tech");
const check_if_name_already_in_db = require("../../tools/message_tools/check_if_name_already_in_db");
const add_tech_to_db = require("../../tools/message_tools/add_tech_to_db");

const LambdaHandler = require("./lambda_requests");
const lambda_handler_instance = new LambdaHandler();
const check_if_inputed_fm_is_correct = require("../message_tools/check_if_inputed_fm_is_correct");
const getClickupCode = require("../message_tools/get_clickup_code");
async function message_handler(this_object, message) {
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
  if (message.body.startsWith("PP:")) {
    let { output, data } = await payment_message_parser(message.body, isBkr);
    if (!output.startsWith("Format")) {
      let name_already_in_db =
        await check_if_name_already_in_db.check_if_name_already_in_db(
          data["tech_name"].trim()
        );
      const {
        existingPhoneNUmber,
        tech_name,
        recipient_1,
        recipient_1_address,
        recipient_2,
        recipient_2_address,
        recipient_3,
        recipient_3_address,
      } = await checkPhoneNumber.checkPhoneNumber(data["tech_phone"]);
      if (existingPhoneNUmber !== false) {
        if (data["tech_name"].trim() === tech_name.trim()) {
          if (data["additional_tech_name"] !== null) {
            let payment_address = data["payment_address"].trim();
            let message_recipient = data["additional_tech_name"].trim();
            if (recipient_1_address.trim() === payment_address) {
              if (
                recipient_1.trim().toLowerCase() !==
                message_recipient.toLowerCase()
              ) {
                await message.reply(
                  `The name of the recipient does not match payment address`
                );
                return;
              }
            } else if (recipient_2_address.trim() === payment_address) {
              if (
                recipient_2.trim().toLowerCase() !==
                message_recipient.toLowerCase()
              ) {
                await message.reply(
                  `The name of the recipient does not match payment address`
                );
                return;
              }
            } else if (recipient_3_address.trim() === payment_address) {
              if (
                recipient_3.trim().toLowerCase() !==
                message_recipient.toLowerCase()
              ) {
                await message.reply(
                  `The name of the recipient does not match payment address`
                );
                return;
              }
            } else if (recipient_3_address.trim() === payment_address) {
              if (
                recipient_3.trim().toLowerCase() !==
                message_recipient.toLowerCase()
              ) {
                await message.reply(
                  `The name of the recipient does not match payment address`
                );
                return;
              }
            } else if (
              recipient_3_address.trim() !== "None" &&
              recipient_3_address.trim() !== "None" &&
              recipient_3_address.trim() !== "None"
            ) {
              await message.reply(
                `The tech exceeded allowed number of recipients , kindly contact admin`
              );
              return;
            } else {
              let added_recipient =
                await addRecipientAndAddressToTechsDB.addRecipientAndAddressToTechsDB(
                  recipient_1.trim(),
                  recipient_2.trim(),
                  recipient_3.trim(),
                  message_recipient,
                  payment_address,
                  data["tech_phone"].trim()
                );
              added_recipient &&
                (await message.reply(
                  `${message_recipient} has been added as a recipient for ${data["tech_name"]}, under payment address ${payment_address}`
                ));
            }
          }
        } else {
          await message.reply(
            `The tech name ${data['tech_name']} in the message does not match the tech name ${tech_name.trim()} in the data base for the phone number ${
              data["tech_phone"]
            }`
          );
          return;
        }
      } else if (name_already_in_db) {
        await message.reply(
          `${data["tech_name"]} is already in tech database under number ${name_already_in_db}, please update tech name/number or ask Admin to update tech database`
        );
        return;
      } else {
        let message_recipient =
          data["additional_tech_name"] !== null
            ? data["additional_tech_name"].trim()
            : null;
        if (message_recipient === null) {
          const tech_added_to_techs_db = await add_tech_to_db.add_tech_to_db(
            data["tech_name"].trim(),
            data["tech_phone"].trim(),
            data["payment_address"].trim(),
            data["payment_method"].trim()
          );
          tech_added_to_techs_db &&
            (await message.reply(
              `${data["tech_name"]} - ${data["tech_phone"]} successfully added to tech database; for any changes to tech database, please consult admin`
            ));
        }
      }
      const wo_number_data =
        await lambda_handler_instance.get_work_order_by_wo_number(
          data["wo_number"].trim()
        );
      // if (wo_number_data.length === 0) {
      //   await message.reply(
      //     `WARNING: WO with wo number ${data[
      //       "wo_number"
      //     ].trim()} not found in clickup.`
      //   );
      //   // await message.reply(output);
      // }

      const company_name_from_db = wo_number_data[0]?.filter((element) => {
        return element === "BKR" || element === "Alpha Fixers";
      })[0];
      if (
        message.from === numbres.bkr_num &&
        company_name_from_db === "Alpha Fixers"
      ) {
        await message.reply(
          `WARNING: Payment correlated to work order number ${data["wo_number"]} should be sent from Alpha Fixers payment group`
        );
        return;
      } else if (
        message.from === numbres.alpha_fixers_num &&
        company_name_from_db === "BKR"
      ) {
        await message.reply(
          `WARNING: Payment correlated to work order number ${data["wo_number"]} should be sent from BKR payment group`
        );
        return;
      }
    }
    // const found_name_from_phone_number =
    //   await checkPhoneNumber.checkPhoneNumber(data["tech_phone"]);
    // const message_tech_name = data["tech_name"].trim();
    // let name_matches =
    //   found_name_from_phone_number !== false
    //     ? check_if_name_matches_phone_number.check_if_name_matches_phone_number(
    //         message_tech_name,
    //         found_name_from_phone_number
    //       )
    //     : true;
    // if (!name_matches) {
    //   await message.reply(
    //     `Error: Tech name does not match ${data["tech_phone"]}, please update name to ${found_name_from_phone_number}`
    //   );
    //   return;
    // }
    let fm = data["payment_tag"].split("-");
    fm = fm[fm.length - 2];
    const paymentCodeMap = await getClickupCode.get_fm_code_map();
    console.log(paymentCodeMap);

    let isFmPresent = false;
    paymentCodeMap.forEach((value) => {
      if (value.trim() === fm.trim()) {
        isFmPresent = true;
      }
    });
    if (!isFmPresent) {
      await message.reply(`Error: The FM is not recognized`);
      return;
    }
    const clickupFM =
      await check_if_inputed_fm_is_correct.check_if_inputed_fm_is_correct(
        data["wo_number"].trim()
      );
    if (clickupFM === false) {
      await message.reply(
        `Error: The Wo number enterd is not available on clickup`
      );
      return;
    }
    if (!Object.keys(paymentCodeMap).includes(clickupFM)) {
      await message.reply(
        `${clickupFM} not configured in mappings. Kindly consider fixing the clickup fms mappings.`
      );
      return;
    }
    if (paymentCodeMap.get(clickupFM).trim() !== fm.trim()) {
      await message.reply(
        `Error: The FM found in clickup for work order ${
          data["wo_number"]
        } is ${paymentCodeMap.get(clickupFM)} and not ${fm}`
      );
      return;
    }

    !output.startsWith("Duplicate") &&
      !output.startsWith("Format") &&
      (output = `${output}`);

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
      totalAmount =
        data["additional_tech_name"] === null
          ? await getTotalAmounts.getTotalAmounts(data["tech_phone"], false)
          : await getTotalAmounts.getTotalAmounts(
              data["additional_tech_name"],
              true
            );
      console.log(totalAmount);
      let isPaymentAvailable = false;
      if (message.from === numbres.bkr_num) {
        isPaymentAvailable = await getexistingPayments.getexistingPayments(
          data["wo_number"],
          true
        );
      } else {
        isPaymentAvailable = await getexistingPayments.getexistingPayments(
          data["wo_number"],
          false
        );
      }

      if (data["total_amount_from_message"] === null && isPaymentAvailable) {
        await message.reply(
          `WO_recognized , Total amount missing from the message.`
        );
      }
      totalAmount =
        data["additional_tech_name"] === null
          ? await getTotalAmounts.getTotalAmounts(data["tech_phone"], false)
          : await getTotalAmounts.getTotalAmounts(
              data["additional_tech_name"],
              true
            );
      let wo_number_total_amount_lookup =
        await getTotalAmounts.wo_number_total_amount_lookup(data["wo_number"]);
      if (
        data["total_amount_from_message"] !== null &&
        data["total_amount_from_message"] !==
          data["amount"] + wo_number_total_amount_lookup
      ) {
        await message.reply(
          `Tech total including amount to be paid is ${
            data["amount"] + wo_number_total_amount_lookup
          }$ not ${data["total_amount_from_message"]}$`
        );
      }

      await message.reply(
        `The calculated total amount for ${
          data["additional_tech_name"]
            ? data["additional_tech_name"]
            : data["tech_name"]
        } including amount to be paid is ${
          totalAmount +
          (data["amount"] !== null ? parseFloat(data["amount"]) : 0)
        }$`
      );
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
