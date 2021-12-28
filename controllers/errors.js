exports.get400=(req,res,next)=>{
    // res.status(404).sendFile(path.join(rootDir,'views','404.html'));
    res.status(404).render('404',{
        pageTitle:'Page Not Found',
        path:'/404',
        isAuthenticate: req.session.isLoggedIn
    });
}

exports.get500=(req,res,next)=>{
    // res.status(404).sendFile(path.join(rootDir,'views','404.html'));
    res.status(500).render('500',{
        pageTitle:'Error!',
        path:'/500',
        isAuthenticate: req.session.isLoggedIn
    });
}

// Status Code:
// Sucess: {
//     200: Operation Successfull,
//     201: Resource created sucessfully
// },
// Redirect:{
//     301: moved Permanently
// },
// Client-Side-Error:{
//     401: Not Authenticated,
//     403; Not Authorized,
//     404: Not Found,
//     422: Invalid input
// },
// Server-Side-Error:{
//     500: Server-Side-Error
// }
