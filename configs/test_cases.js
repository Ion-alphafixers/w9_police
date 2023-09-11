const { payment_message_parser } = require("../tools/message_tools/main");

let correct_test_messages = [
  "PP: Jon Doe/ (803)991-8877/Cashapp/ $johnDoe / 151488-T-A/ $50 / $100",
  "PP: DISCOUNT FLOORING AND SUPPLY,LLC/ 770 676 0164/ Credit Card/ 152564-T-M/ $3,005.10/ $3080.10",
  "PP: Osceola Air LLC/ (407) 439-1995/  Credit Card / https://client.housecallpro.com/pay_invoice/43e46deb2efbdcc64ee0be0a06c02a08b5d7c369ee94ea2a1a70bf61d7cf0e36_e9142c3990e632ca80a97841983c930bcd81116455b128698285224d476ff99a/ 152632-T-J / $309.75 ",
  "PP: Jon Doe/ (803)991-8877/Cashapp/ $johnDoe / 151488-T-A0.5/ $50",
  "PP: Jon Doe/(803)991-8877/ Kate Doe/Zelle / +16783321134/ 151488-T-J/ $500/ $720 //Paid his wife Kate",
  "PP: Jon Doe/ 512-981-3033/ AB plumbing/Credit/704465-D-A+J/ $300",
  "PP: AB plumbing/512-981-3033/ Credit/704465-D-A+J/ $300",
  "PP: Jon Doe/ (803)991-8877/Cashapp/ $johnDoe / 151488-T-A/ $50 / $100",
  "PP: Joe Garcia/ (803)457-3409/Venmo/ @Jgarc/ 151488-T-A2/ $75 /$175",
  "PP: Abe Bon/ 512-981-3033/ AB plumbing/Credit/704465-D-A+J/ $300",
  "PP: DISCOUNT FLOORING AND SUPPLY,LLC/ 770 676 0164/ Credit Card/ 152564-T-M/ $3,005.10/ $3080.10",
  "PP: Jake Silva/ (678)332-1134/ ACH/ (Rout#026027315, Acct #63103380)/132649-A-R/ $1,200.02",
  "PP: John Smith/ (555)555-5555/Zelle/ johnsmith@email.com/ 123-T-A/ $100",
  "PP: Mary Johnson/ (555)456-7890/Venmo/ @maryj/ 456-T-A2/ $75 /$175",
  "PP: Alex Hernandez/ (987)654-3210/Paypal/ alexh@email.com/ 789-T-A/ $50 / $150 // Paid for services",
  "PP: XYZ Inc./ (555)222-3333/Credit/ 123456-D-M/ $3,000",
  "PP: Susan Davis/ (888)777-8888/ACH/ Rout# 02607315, Acct# 63103380/ 987654-D-A+J0.1/ $1,200.50",
  "PP: John Doe/ (555)456-7890/Check/ 7 Main St, New York, NY 10001 / 5555-T-M/ $1,000",
  "PP: ABC Services/ (555)555-5555/Zelle/ abc@email.com/ 111-T-A/ $200 // For repairs",
  "PP: Jane Johnson/ (222)333-4444/Cashapp/ $janej/ 222-T-J2/ $125 /$275",
  "PP: Sarah Smith/ (999)999-9999/Venmo/ @sarahs/ 999-T-A/ $60 / $160 // Payment for groceries",
  "PP: James Brown/ (444)444-4444/Credit/ www.example.com/ 444-T-A/ $5000",
];

let wrong_test_messages = [
  "PP: Eduardo Garcia/ (678)444-1244/ Check/ 7 main street, Miami, FL 32054 / TMG-AWS-213-Ti-R/ $783 // This is our second recall for this job",
  "PP: Jon Doe/(555)555-5555 / Kate Doe/Zelle / +16783321134/ 151488-T-J/ $500/ 720",
  "PP: Jon Doe/ 80399-8877/ Home Depot/ Credit/ 151488-T-M/ $45/ $220",
  "PP: Jon Doe/ 8039918877/ / Cashapp/ $johnDoe / 151488-T-A0.5/ $50",
  "PP: Jon Doe/(803)991-8877-124 / Kate Doe/Zelle / +16783321134/ 151488-T-J/ $500/ $720",

  "PP: Jon Doe/(803)991-8877 / Kate Doe/Zelle / +16783321134/ 151488-T-J/ $5.001/ $720",
  "PP: Jon Doe/(803)991-8877 / Kate Doe/Zelle / +16783321134/ 151488-T-J/ $500, $720",
  "PP: Jon Doe (803)991-8877 / Kate Doe/Zelle / +16783321134/ 151488-T-J/ $500/ $720",
  "PP: Jon Doe / (803)991-8877 / Kate Doe/Zelle / 151488-T-J/ $500/ $720",
  "PP: Jon Doe / (803)991-8877 / Kate Doe//Zelle / +16783321134 / 151488-T-J/ $500/ $720",
  "PP: Osceola Air LLC/ (407) 439-1995/ Credit Card / https://client.housecallpro.com/pay_invoice/43e46deb2efbdcc64ee0be0a06c02a08b5d7c369ee94ea2a1a70bf61d7cf0e36_e9142c3990e632ca80a97841983c930bcd81116455b128698285224d476ff99a/ 152632-T-J / 309.75",
  "PP: ABC Company / (123)456-7890 / InvalidMethod / InvalidAddress / 123-T-A / $100",
  "PP: John Doe/ (555)555-5555/Zelle/ johnsmith@email.com/ 123-T-A/ 100",
  "PP: Mary Johnson/ (123)456-7890/Venmo/ @maryj/ 456-T-A2/ -$75 /$175",
  "PP: Alex Hernandez/ (987)654-3210/Paypal/ alexh@email.com/ 789-T-A/ $50 / 150",
  "PP: XYZ Inc./ (111)222-3333/Credit/ 123456-D-M/ $3,000.50",
  "PP: Susan Davis/ (888)777-8888/ACH/ Rout#02607315, Acct #63103380/ 987654-D-A+J/ $1,200.50",
  "PP: John Doe/ (123)456-7890/Check/ 7 Main St / 5555-T-M/ $1,000",
  "PP: ABC Services/ (555)555-5555/Zelle/ abc@email.com/ 111-T-A/ $200 / $150",
  "PP: Jane Johnson/ (222)333-4444/Cashapp/ janej/ 222-T-J2/ $125 /$275",
  "PP: Sarah Smith/ (999)999-9999/Paypal/ @sarahs/ 999-T-A/ $60 / $160",
  "PP: James Brown/ (444)444-4444/InvalidMethod/ www.example.com/payment/ 444-T-A/ $5000",
];
function run_test_cases(correct_test_cases_flag, wrong_test_cases_flag) {
  if (correct_test_cases_flag) {
    console.log(
      "############################# Correct Test Cases #############################"
    );
    correct_test_messages.map((element) => {
      console.log(element);
      console.log(payment_message_parser(element));
    });
    console.log(
      "############################# Correct Test Cases End #############################"
    );
  }
  if (wrong_test_cases_flag) {
    console.log(
      "############################# Wrong Test Cases #############################"
    );
    wrong_test_messages.map((element) => {
      console.log(element);
      console.log(payment_message_parser(element));
    });
    console.log(
      "############################# Wrong Test Cases End #############################"
    );
  }
}
run_test_cases(true, false);
module.exports = {
  correct_test_messages,
  wrong_test_messages,
};
/*
To fix:
    1- the payment address should be trimed to pass this test case=> PP: John Smith/ (555)555-5555/Zelle/ johnsmith@email.com/ 123-T-A/ $100
    2- the tech_phone and payment-tag should be trimmed to pass this test case=>PP: Jon Doe/(803)991-8877 / Kate Doe/Zelle / +16783321134/ 151488-T-J/ $500/ $720
*/
