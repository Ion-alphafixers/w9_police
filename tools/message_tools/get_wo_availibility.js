const getexistingPayments = async (wo_number, is_Bkr) => {
  console.log(wo_number);
  console.log(is_Bkr);
  q = is_Bkr
    ? `SELECT * FROM rbk_invoices where work_order_number = '${wo_number}'`
    : `SELECT * FROM payments where work_order_number = '${wo_number}'`;
  try {
    const response = await fetch(
      "https://i3gzeqflqihryswsazg6cf7eja0xqysp.lambda-url.us-east-2.on.aws/",
      {
        method: "POST",
        body: JSON.stringify({
          query: q,
        }),
      }
    );
    console.log(response);

    let data = await response.json();

    if (data.length !== 0) {
      return true;
    }
    return false;
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  getexistingPayments,
};
