require("dotenv").config();
const message_identifier = async () => {
    
    const res = await fetch(
      `https://api.clickup.com/api/v2/folder/90050890353/list?archived=false`,
      {
        method: "GET",
        headers: {
          Authorization: "pk_81917863_O0ND2Q40ST3A7EX27WZXYC6LQMGELKVU",
        },
      }

    );
    const response = await res.json()

    const alpha_fixers_account_managers = response.lists.map(account_manager=>account_manager.id)
    let allTasks = []
    for(let i = 0 ;  i < alpha_fixers_account_managers.length ; i++){
      console.log(
        `https://api.clickup.com/api/v2/list/${alpha_fixers_account_managers[i]}/task?archived=false&page=0`
      );
        const resp = await fetch(
          `https://api.clickup.com/api/v2/list/${alpha_fixers_account_managers[i]}/task?archived=false&page=0`,
          {
            method: "GET",
            headers: {
              Authorization: "pk_81917863_O0ND2Q40ST3A7EX27WZXYC6LQMGELKVU",
            },
          }
        );
        const response = await resp.json();
        allTasks.push(response);
      };   
      console.log(allTasks)
};

message_identifier()