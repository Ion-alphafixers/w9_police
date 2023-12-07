class LambdaHandler {
  constructor() {
    this.db_connector_url =
      "https://i3gzeqflqihryswsazg6cf7eja0xqysp.lambda-url.us-east-2.on.aws/";
  }
  async do_request(url, method, query) {
    return await fetch(url, {
      method: method,
      body: JSON.stringify({
        query: query,
      }),
    }).then(async (res) => await res.json());
  }
  async get_work_order_by_wo_number(wo_number) {
    return await this.do_request(
      this.db_connector_url,
      "POST",
      `SELECT * FROM work_orders WHERE wo_number = '${wo_number}'`
    );
  }
}

module.exports = LambdaHandler;
