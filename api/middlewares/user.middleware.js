const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const USER_MODEL = require("../models/user.model");
const Notification = require("../modules/Notification");
const Checking = require("../modules/Checking");
const HashPass = require("../modules/HashPass");
const SetPermission = require("../modules/SetPermission");
const Pagination = require("../modules/Pagination");

module.exports.checkGetUsers = async (req, res, next) => {
    const { page = 1, onpage = 9 } = req.query;         
    let USERS = await USER_MODEL.find().sort({_id: "desc", });
    const countAllUsers = await USER_MODEL.count();
    if(Number.isNaN(Number(page)) || Number.isNaN( Number(onpage))) {
        res.json(Notification.message("Trang hoặc số hiển thị không chính xác", "error", 400));
        return;
    }

    let pagination = Pagination(page, onpage);

    USERS = USERS.slice(pagination.start, pagination.end);

    res.locals.users = USERS;
    res.locals.page = page;
    res.locals.onPage = onpage;
    res.locals.total = countAllUsers;
    next();
}
module.exports.checkGetUser = async (req, res, next) => {
    const {id} = req.params;

    //Find user with ID
    try {
        let USER = await USER_MODEL.findById({_id: id});

        if(!USER) {
            res.json(Notification.message("Người dùng này không tồn tại", "error", 404));
            return;
        }

        res.locals.user = {
            username: USER.username,
            address: USER.address,
            firstname: USER.firstname,
            lastname: USER.lastname,
            email: USER.email,
            number_phone: USER.number_phone,
            permission: USER.permission,
            created: USER.created
        };
        next();
    }
    catch(err) {
        res.json(
            Notification.message(
            "Không tìm thấy ID người dùng này.",
            "error", 
            404,
            {user: {}})
        );
        return;
    }
}

module.exports.checkCreate = async (req, res, next) => {
    const USERS = await USER_MODEL.find();
    let errors = new Object;
    let hash;
    let { username, 
        password, 
        firstname, 
        lastname, 
        address, 
        email, 
        number_phone, 
        permission } = req.body;

    //Check username
    if(Checking.isNull(username)) {
        errors.username = Notification.message("Tên người dùng không được để trống", "error", 400);
    }
    else {
        if((await Checking.isExists(username, USER_MODEL, "username")).exists) {
            errors.username = Notification.message("Tên người dùng đã tồn tại", "error", 400);
        }
    }

    //Check password
    if(Checking.isNull(password)) {
        errors.password = Notification.message("Mật khẩu không được để trống", "error", 404)
    }
    else {
        if(!Checking.isPassword(password)) {
            errors.password = Notification.message("Mật khẩu không hợp lệ, phải có đầy đủ ký tự hoa, thường, số", "error", 400)
        }
        else {
            hash = HashPass(10,password);
        }
    }

    //Check name
    if(Checking.isNull(firstname)) {
        errors.firstname = Notification.message("Họ tên không được để trống", "error", 400);
    }
    if(Checking.isNull(lastname)) {
        errors.lastname = Notification.message("tên không được để trống", "error", 400)
    }

    if(!address) {
        address = "";
    }

    //Check Email
    if(Checking.isNull(email)) {
        errors.email = Notification.message("Email không được để trống","error", 404);
    }
    else {
        if(!Checking.isEmail(email)) {
            errors.email = Notification.message("Email không hợp lệ, vui lòng nhập lại", "error", 400);
        }
        else {
            if((await Checking.isExists(email, USER_MODEL, "email")).exists) {
                errors.email = Notification.message("Email này đã tồn tại", "error", 400);
            }
        }
    }

    //Check number phone
    if(Checking.isNull(number_phone)) {
        errors.number_phone = Notification.message("Số điện thoại không được để trống", "error", 404);
    }
    else {
        if(!Checking.isNumberPhone(number_phone)) {
            errors.number_phone = Notification.message("Số điện thoại không hợp lệ", "error", 400);
        }
    }

    //Set permission
    req.body.permission = await SetPermission();

    //Checking error exists
    if(Checking.testError(errors)) {
        res.json(Notification.message("Có lỗi xảy ra", "error", 400, { errors: errors }))
    }
    else {
        req.body.password = await hash;
        res.locals.user = req.body;
        next();
    }
}

module.exports.checkUpdate = async (req, res, next) => {
    const { id } = req.params;
    const { userLogin } = res.locals;
    let USER;
    let errors = new Object;
    let hash;
    let { username, 
        password, 
        firstname, 
        lastname, 
        address, 
        email, 
        number_phone, 
        permission } = req.body
    
    //Testing user have a exists
    try {
        USER = await USER_MODEL.findById({_id: id});
    }
    catch(err) {
        res.json(Notification.message("Người dùng không tồn tại", "error", 400));
        return;
    }

    //Checking user just can change us detail
    if((userLogin._id != USER._id) && userLogin.permission === "member") {
        res.json(Notification.message("Thành viên chỉ có thể cập nhật tài khoản của chính mình", "error", 403));
        return;
    }

    //Checking username
    //Nếu là [admin] cho phép cập nhật dữ liệu username
    if(userLogin.permission === "admin") {
        //Check username
        if(Checking.isNull(username)) {
            errors.username = Notification.message("Tên người dùng không được để trống", "error", 404);
        }
        else {
            if(!Checking.compare(username, USER.username)) {
                if((await Checking.isExists(username, USER_MODEL, "username")).exists) {
                    errors.username = Notification.message("Tên người dùng cập nhật đã tồn tại", "error", 400)
                }
            }
        }
        //Check permission
        if(Checking.isNull(permission)) {
            errors.permission = Notification.message("Quyền cho người dùng không được để trống", "error", 404);
        }
        else {
            if(!Checking.compare("admin", permission) && !Checking.compare("member", permission) && !Checking.compare("tester", permission)) {
                errors.permission = Notification.message("Just have a permission admin or member or tester", "error", 400);
            }
        }
    }
    //Nếu là [member] không cho phép cập nhật username
    if(username && username !== USER.username && userLogin.permission === "member") {
        errors.username = Notification.message("Không được cập nhật tên người dùng", "error", 400);
    }

    //Checking pass
    if( userLogin.permission !== "admin" ) {
        if(Checking.isNull(password)) {
            errors.password = Notification.message("Mật khẩu không được để trống", "error", 404);
        }
        else {
            if(!Checking.isPassword(password)) {
                errors.password = Notification.message("Mật khẩu không hợp lệ, phải có đầy đủ ký tự hoa, thường, số", "error", 400)
            }
            else {
                hash = HashPass(10,password);
            }
        }
    }

    //Check name
    if(Checking.isNull(firstname)) {
        errors.firstname = Notification.message("Họ tên không được để trống", "error", 400);
    }
    if(Checking.isNull(lastname)) {
        errors.lastname = Notification.message("tên không được để trống", "error", 400)
    }

    if(!address) {
        address = "";
    }

    //Check Email
    if(Checking.isNull(email)) {
        errors.email = Notification.message("Email không được để trống","error", 404);
    }
    else {
        if(!Checking.compare(email,USER.email)) {
            if(!Checking.isEmail(email)) {
                errors.email = Notification.message("Email không hợp lệ, vui lòng nhập lại", "error", 400);
            }
            else {
                if((await Checking.isExists(email, USER_MODEL, "email")).exists) {
                    errors.email = Notification.message("Email này đã tồn tại", "error", 400);
                }
            }
        }
    }

    //Check number phone
    if(Checking.isNull(number_phone)) {
        errors.number_phone = Notification.message("Số điện thoại không được để trống", "error", 404);
    }
    else {
        if(!Checking.compare(number_phone, USER.number_phone)) {
            if(!Checking.isNumberPhone(number_phone)) {
                errors.number_phone = Notification.message("Số điện thoại không hợp lệ", "error", 400);
            }
        }
    }

    //Checking error exists
    if(Checking.testError(errors)) {
        res.json(Notification.message("Có lỗi xảy ra", "error", 400, { errors: errors }))
    }
    else {
        let newProfile = {
            username: username,
            address: address,
            number_phone: number_phone,
            email: email,
            firstname: firstname,
            lastname: lastname,
            permission: permission
        }
        req.body.password = await hash;
        userLogin.permission !== "admin" ? res.locals.user = req.body : res.locals.user = newProfile;
        res.locals.userId = USER._id;
        next();
    }
}

module.exports.checkDelete = async (req, res, next) => {
    const { id } = req.params;
    if(!(await Checking.isExists(id, USER_MODEL, "_id")).exists) {
        res.json(Notification.message("Người dùng này không tồn tại", "error", 400));
        return;
    }

    res.locals.userId = id;
    next();
}

module.exports.checkLogin = async (req, res, next) => {
    const { username, password } = req.body;
    if(Checking.isNull(username)) {
        res.json(Notification.message("Tên tài khoản không được để trống", "error", 400));
        return;
    }
    else {
        if(!(await Checking.isExists(username,USER_MODEL,"username")).exists) {
            res.json(Notification.message("Tên tài khoản không tồn tại", "error", 400));
            return;
        }
    }
    //Account was verified, query to password to compare
    const USER = await USER_MODEL.findOne({username: username});
    const verifyPass = bcrypt.compare(password, USER.password);
    if(Checking.isNull(password)) {
        res.json(Notification.message("Mật khẩu không được để trống", "error", 400));
        return;
    }
    else {
        //Bắt sự kiện async verify pass không đồng bộ để kiểm chứng, [optimize time]
        if(await verifyPass) {
            res.locals.user = USER 
            next()
        }
        else {
            res.json(Notification.message("Mật khẩu không chính xác", "error", 400));
        }
    }
}

module.exports.checkResetFromAdmin = async (req, res, next) => {
    let { password } = req.body;
    const { id } = req.params;
    const user = await Checking.isExists(id, USER_MODEL, "_id");
    if(!user.exists) {
        res.json(Notification.message("Người dùng này không còn tồn tại hoặc không tồn tại", "error", 404));
        return;
    }

    if(Checking.isNull(password)) {
        res.json(Notification.message("Mật khẩu không được để trống", "error", 400));
        return;
    }
    else {
        if(!Checking.isPassword(password)) {
            res.json(Notification.message("Mật khẩu không hợp lệ, phải bao gồm chữ Hoa, chữ thường và số", "error", 400));
            return;
        }
        else {
            password = await HashPass(10,password);
        }
    }

    res.locals.user = user;
    res.locals.id = id;
    res.locals.password = password;
    next();
}

module.exports.checkIsAdmin = async (req, res, next) => {
    //Nhận biến user vào biến user từ checkAuth (CheckIsAdmin <=> checkAuth)
    const { userLogin } = res.locals;
    /* Bước kiểm tra */
    if(!Checking.permiss("admin", userLogin.permission)) {
        res.json(Notification.message("Bạn không có quyền này, chỉ ADMINISTRATOR có quyền", "error", 400))
        return
    }
    /* Successfully */
    next();
}

module.exports.checkIsAdminOrTester = async (req, res, next) => {
    //Nhận biến user vào biến user từ checkAuth (CheckIsAdmin <=> checkAuth)
    const { userLogin } = res.locals;
    /* Bước kiểm tra */
    if(!Checking.permiss("admin", userLogin.permission) && !Checking.permiss("tester", userLogin.permission)) {
        res.json(Notification.message("Bạn không có quyền này, chỉ ADMINISTRATOR có quyền", "error", 400))
        return
    }
    /* Successfully */
    next();
}

module.exports.checkAuth = async (req, res, next) => {
    let header = req.headers.authorization;
    if(!header) {
        res.json(Notification.message("Yêu cầu xác thực thất bại, không nhận được mã xác thực, vui lòng đăng nhập", "error", 403));
        return;
    }
    header = req.headers.authorization.split(" ");
    let WATCHMAN = header[0];
    let token = header[1];
    if(WATCHMAN === "Bearer") {
        jwt.verify(token, process.env.PRIVATE_KEY,(err, decode) => {
            if(err) {
                res.json(Notification.message("Xác thực thất bại, đăng nhập lại","error", 403));
                return;
            }
            //Chuyễn dữ liệu người dùng đăng nhập cho middleware, controller tiếp theo
            res.locals.userLogin = decode.data;
            next();
        })
    }
    else {
        res.json(Notification.message("Xác thực thất bại","error", 400));
    }
}