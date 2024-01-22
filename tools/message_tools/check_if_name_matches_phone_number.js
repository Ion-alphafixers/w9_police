const check_if_name_matches_phone_number = (message_name , actual_name)=>{
    if(message_name.toLowerCase().trim() === actual_name.toLowerCase().trim()){
        return true
    }else{
        return false
    }
}

module.exports = {
    check_if_name_matches_phone_number  
}