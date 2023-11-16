const checkTag = (tag)=>{
    tag = tag.split("+")
    for(let i of tag){
        if(+i[1]>1){
            return false
        }
    }
    return true
}


module.exports = {
    checkTag
}