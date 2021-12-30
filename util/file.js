const fs = require('fs');
//code to delete the images when its product get deleted 
const deleteFile = (filePath)=>{
    fs.unlink(filePath,(err)=>{
        if(err){
            throw (err)
        }
    })
}

exports.deleteFile = deleteFile;