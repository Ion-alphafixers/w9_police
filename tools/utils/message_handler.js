const { APPROVER_NUMBERS } = require("../../configs/numbers");
const { payment_message_parser } = require("../message_tools/main");
async function message_handler(this_object, message) {
  // try {

  //   } catch (e) {
  //     console.log(e);
  //   }
  if (message.body.startsWith("PP")) {
    let { output, data } = payment_message_parser(message.body);
    let tech_total_paid = await this_object.get_tech_total_paid(
      data["tech_name"].trim()
    );
    let additional_tech_total_paid = await this_object.get_tech_total_paid(
      data["additional_tech_name"].trim()
    );
    output = `${output}tech_total_paid:${
      tech_total_paid !== null ? tech_total_paid : 0
    }\n`;
    if (data["additional_tech_name"] !== null) {
      let trimmed_data = data["additional_tech_name"].trim();
      if (
        trimmed_data !== "" &&
        trimmed_data !== "null" &&
        trimmed_data !== "None"
      ) {
        output = `${output}additional_tech_total_paid:${
          additional_tech_total_paid !== null ? additional_tech_total_paid : 0
        }\n`;
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
    const { output, data } = payment_message_parser(message.body);
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
