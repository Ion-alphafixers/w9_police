const qrcode = require("qrcode-terminal");
const lambda_functions_urls = require("./configs/lambda_functions_urls");
const reactions = require("./configs/reactions");
const { Client, LocalAuth } = require("whatsapp-web.js");
const { payment_message_parser } = require("./tools/message_tools/main");
const { APPROVER_NUMBERS } = require("./configs/numbers");

class WhatsappClient {
  constructor() {
    this.whatsapp_invoices_receiver_lambda_function_url =
      lambda_functions_urls.WHATSAPP_INVOICES_RECEIVER;
    this.reactions = reactions;
    this.messages_mapping = {};

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
      try {
        if (message.body.startsWith("PP")) {
          const {output,data} = payment_message_parser(message.body);
          if (output.startsWith("Format") === false) {
            this.messages_mapping[message.id] = data;
          }
          const reply = await message.reply(output);
          this.messages_mapping[reply.id["id"]] = output;
        } else if (message.body.startsWith("RR")) {
          const {output,data} = payment_message_parser(message.body);
          if (output.startsWith("Format") === false) {
            this.messages_mapping[message.id];
          }
          const reply = await message.reply(output);
          this.messages_mapping[reply.id["id"]] = data;
        }
      } catch (e) {
        console.log(e);
      }
    });
  }
  edit_message_listener() {
    this.client.on("message_edit", async (message) => {
      // console.log(message);
      // message.react(this.reactions.thumbs_up);
    });
  }
  reaction_listener() {
    this.client.on("message_reaction", (message) => {
      // console.log(message);

      if (
        APPROVER_NUMBERS.includes(
          message.id["participant"].replace("@c.us", "")
        )
      ) {
        this.send_message_to_lambda_functions(
          this.messages_mapping[message.msgId["id"]]
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
