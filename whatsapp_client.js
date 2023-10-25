const qrcode = require("qrcode-terminal");
const lambda_functions_urls = require("./configs/lambda_functions_urls");
const reactions = require("./configs/reactions");
const { Client, LocalAuth } = require("whatsapp-web.js");
const { payment_message_parser } = require("./tools/message_tools/main");
const { APPROVER_NUMBERS } = require("./configs/numbers");
const { message_handler } = require("./tools/utils/message_handler");

class WhatsappClient {
  constructor() {
    this.tech_total_amount_paid_lambda_function_url =
      lambda_functions_urls.TECH_TOTAL_PAID_LAMBDA_FUNCTION;
    this.whatsapp_invoices_receiver_lambda_function_url =
      lambda_functions_urls.WHATSAPP_INVOICES_RECEIVER;
    this.reactions = reactions;
    this.incoming_messages_id_object_mapping = {};
    this.reply_messages_id_object_mapping = {};
    this.reply_messages_id_text_mapping = {};
    this.incomming_to_reply_mapping = {};
    this.timestamp_mappings = {};
    this.client = new Client({
      puppeteer: {
        args: ["--no-sandbox"],
      },
      authStrategy: new LocalAuth(),
    });
    this.initialize_listeners();
  }
  whatsapp_raw_message_to_json(message) {
    // Input data
    var inputString = message;
    // Split the input string into key-value pairs
    for (let element of [
      "tech_name",
      "tech_phone",
      "additional_tech_name",
      "payment_method",
      "payment_address",
      "payment_tag",
      "amount",
      "total_amount",
      "note",
      "warnings",
    ]) {
      inputString = inputString.replace(element, `/#SEPARATOR#${element}`);
    }
    var keyValuePairs = inputString.split("/#SEPARATOR#");

    // Create an empty object to store the key-value pairs
    var dataObject = {};

    // Iterate through the key-value pairs and populate the object
    for (var i = 0; i < keyValuePairs.length; i += 1) {
      var curr_element = keyValuePairs[i].split(":");
      var key = curr_element[0];
      var value = curr_element[1].replace("\n", "");
      dataObject[key] = value === "null" ? null : value;
    }

    // Convert the object to JSON
    // return JSON.stringify(dataObject);
    return JSON.stringify(dataObject);
  }

  async get_tech_total_paid(tech_name) {
    const response = await fetch(
      `${this.tech_total_amount_paid_lambda_function_url}?tech_name=${tech_name}`,
      {
        method: "GET",
      }
    );
    const result = await response.json();
    return result[0];
  }
  async send_message_to_lambda_functions(message, delete_request = false) {
    try {
      if (delete_request === true) {
        const response = await fetch(
          this.whatsapp_invoices_receiver_lambda_function_url,
          {
            method: "DELETE",
            body: JSON.stringify(message),
          }
        );
      } else {
        const response = await fetch(
          this.whatsapp_invoices_receiver_lambda_function_url,
          {
            method: "POST",
            body: this.whatsapp_raw_message_to_json(message),
          }
        );
        console.log(response);
      }
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
      await message_handler(this, message);
    });
  }
  edit_message_listener() {
    this.client.on("message_edit", async (message) => {
      try {
        console.log(message.id["id"]);
        const reply_id =
          this.incomming_to_reply_mapping[message.id["id"]][
            this.incomming_to_reply_mapping[message.id["id"]].length - 1
          ].id["id"];
        await this.incomming_to_reply_mapping[message.id["id"]][0].delete(true);

        delete this.incoming_messages_id_object_mapping[message.id["id"]];
        delete this.incomming_to_reply_mapping[message.id["id"]];
        delete this.reply_messages_id_text_mapping[reply_id];
        delete this.reply_messages_id_object_mapping[reply_id];
        await message_handler(this, message);
      } catch (e) {
        console.log(e);
      }
    });
  }

  reaction_listener() {
    this.client.on("message_reaction", async (message) => {
      // console.log(message);
      if (
        APPROVER_NUMBERS.includes(
          message.id["participant"].replace("@c.us", "")
        ) &&
        message.reaction === reactions.thumbs_up
      ) {
        let message_object = await this.get_chat_message(
          message.msgId["_serialized"]
        );
        this.send_message_to_lambda_functions(message_object.body);
      } else if (
        APPROVER_NUMBERS.includes(message.id["remote"].replace("@c.us", "")) &&
        message.reaction === reactions.remove
      ) {
        this.send_message_to_lambda_functions(
          this.reply_messages_id_text_mapping[message.msgId["id"]],
          true
        );
      }
    });
  }
  delete_listener() {
    this.client.on("message_revoke_everyone", (message) => {
      try {
        if (message.from.startsWith("13055035308@c.us")) {
          return;
        }
        this.timestamp_mappings[message.timestamp][
          this.timestamp_mappings[message.timestamp].length - 1
        ].delete(true);
        delete this.timestamp_mappings[message.timestamp];
      } catch (e) {
        console.log(e);
      }
    });
  }
  async get_chats() {
    console.log(await this.client.getChats());
  }
  async get_chat_message(message_id) {
    return await this.client.getMessageById(message_id);
  }
  initialize_listeners() {
    this.qr_code_listener();
    this.client_ready_listener();
    this.message_listener();
    this.edit_message_listener();
    this.reaction_listener();
    this.delete_listener();

    this.client.initialize();
  }
}

new WhatsappClient();
