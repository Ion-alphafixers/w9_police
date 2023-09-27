const qrcode = require("qrcode-terminal");
const lambda_functions_urls = require("./configs/lambda_functions_urls");
const reactions = require("./configs/reactions");
const { Client, LocalAuth } = require("whatsapp-web.js");
const { payment_message_parser } = require("./tools/message_tools/main");
const { APPROVER_NUMBERS } = require("./configs/numbers");
const { message_handler } = require("./tools/utils/message_handler");

class WhatsappClient {
  constructor() {
    this.whatsapp_invoices_receiver_lambda_function_url =
      lambda_functions_urls.WHATSAPP_INVOICES_RECEIVER;
    this.reactions = reactions;
    this.incoming_messages_id_object_mapping = {};
    this.reply_messages_id_object_mapping = {};
    this.reply_messages_id_text_mapping = {};
    this.incomming_to_reply_mapping = {};
    this.client = new Client({
      puppeteer: {
        args: ["--no-sandbox"],
      },
      authStrategy: new LocalAuth(),
    });
    this.initialize_listeners();
  }
  async send_message_to_lambda_functions(message) {
    try {
      const response = await fetch(
        this.whatsapp_invoices_receiver_lambda_function_url,
        {
          method: "POST",
          body: JSON.stringify(message),
        }
      );
      console.log(response);
      console.log("Request sent");
    } catch (e) {
      console.log(e);
    }
  }
  //////////////////////////// Client methods

  async get_message_by_id(id) {
    return await this.client.getMessageById(id);
  }

  //////////////////////////////

  qr_code_listener() {
    this.client.on("qr", (qr) => {
      qrcode.generate(qr, { small: true });
    });
  }
  client_ready_listener() {
    this.client.on("ready", () => {
      console.log("Client is ready!");
    });
  }
  message_listener() {
    this.client.on("message", async (message) => {
      //   console.log(message);
      console.log(message.body);
      await message_handler(this, message);
    });
  }
  edit_message_listener() {
    this.client.on("message_edit", async (message) => {
      const reply_id =
        this.incomming_to_reply_mapping[message.id["id"]][
          this.incomming_to_reply_mapping[message.id["id"]].length - 1
        ].id["id"];

      this.incomming_to_reply_mapping[message.id["id"]][
        this.incomming_to_reply_mapping[message.id["id"]].length - 1
      ].delete(true);

      delete this.incoming_messages_id_object_mapping[message.id["id"]];
      delete this.incomming_to_reply_mapping[message.id["id"]];
      delete this.reply_messages_id_text_mapping[reply_id];
      delete this.reply_messages_id_object_mapping[reply_id];
      await message_handler(this, message);
    });
  }
  reaction_listener() {
    this.client.on("message_reaction", (message) => {
      // console.log(message);

      if (
        APPROVER_NUMBERS.includes(
          message.id["participant"].replace("@c.us", "")
        ) &&
        message.reaction === reactions.thumbs_up
      ) {
        this.send_message_to_lambda_functions(
          this.reply_messages_id_text_mapping[message.msgId["id"]]
        );
      }
    });
  }
  initialize_listeners() {
    this.qr_code_listener();
    this.client_ready_listener();
    this.message_listener();
    this.edit_message_listener();
    this.reaction_listener();

    this.client.initialize();
  }
}

new WhatsappClient();
