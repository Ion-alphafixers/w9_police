const qrcode = require("qrcode-terminal");
const lambda_functions_urls = require("./configs/lambda_functions_urls");
const reactions = require("./configs/reactions");
const { Client, LocalAuth } = require("whatsapp-web.js");
const { payment_message_parser } = require("./tools/message_tools/main");

class WhatsappClient {
  constructor() {
    this.whatsapp_invoices_receiver_lambda_function_url =
      lambda_functions_urls.WHATSAPP_INVOICES_RECEIVER;
    this.reactions = reactions;

    this.client = new Client({
      puppeteer: {
        args: ["--no-sandbox"],
      },
      authStrategy: new LocalAuth(),
    });
    this.initialize_listeners();
  }
  async send_message_to_lambda_functions(message) {
    const response = await fetch(
      this.whatsapp_invoices_receiver_lambda_function_url,
      {
        method: "POST",
        body: JSON.stringify(message),
      }
    );
    console.log(response);
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
          message.reply(payment_message_parser(message.body));
        } else if (message.body.startsWith("RR")) {
          message.reply(payment_message_parser(message.body));
        } else if (
          message.body.includes("PP") &&
          message.body.startsWith("PP") === false
        ) {
          message.reply("Format Error: Payment message should start with PP");
        } else if (
          message.body.includes("RR") &&
          message.body.startsWith("RR") === false
        ) {
          message.reply("Format Error: Refund message should start with RR");
        }
      } catch (e) {
        console.log(e);
      }
    });
  }
  edit_message_listener() {
    this.client.on("message_edit", async (message) => {
      console.log(message);
      message.react(this.reactions.thumbs_up);
    });
  }
  reaction_listener() {
    this.client.on("message_reaction", (message) => {
      console.log(message);
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
