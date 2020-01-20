module.exports.message = (msgVi, status, code,...arg) => {
    let newError = new Object;
    newError = {
        msgVi: msgVi,
        status: status,
        code: code
    }
    arg.map((item) => {
        if(typeof item === "object" && !Array.isArray(item)) {
            newError = {
                msgVi: msgVi,
                status: status,
                code: code,
                ...item
            }
        }
    })
    return newError;
}