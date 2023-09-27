const { APPROVER_NUMBERS } = require("../../configs/numbers");
const { payment_message_parser } = require("../message_tools/main");
async function message_handler(this_object,message){
    try {
        if (message.body.startsWith("PP")) {
          const { output, data } = payment_message_parser(message.body);
          const reply = await message.reply(output);
          if (output?.startsWith("Format") === false) {
            this_object.incoming_messages_id_object_mapping[message.id["id"]] =
              message;
            this_object.reply_messages_id_object_mapping[reply.id["id"]] = reply;
            this_object.reply_messages_id_text_mapping[reply.id["id"]] = data;
            this_object.incomming_to_reply_mapping[message.id["id"]] = [reply];
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
          }
        }
      } catch (e) {
        console.log(e);
      }
}
module.exports = {
    message_handler
}