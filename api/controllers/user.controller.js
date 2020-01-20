const jwt = require('jsonwebtoken');
const USER_MODEL = require("../models/user.model");
const Notification = require("../modules/Notification");

module.exports.users = (req, res) => {
    const { users, page, onPage, total } = res.locals;
    res.json(Notification.message(`Có ${users.length} người dùng được tìm thấy.`,"ok",200, {users: users, page: page, onPage: onPage, total: total}))
}

module.exports.user = (req, res) => {
    const { user } = res.locals;
    res.json(Notification.message("Đã tìm thấy người dùng","ok",200, {user: user}))
}

module.exports.create = async (req, res) => {
    const { user } = res.locals;

    try {
        const newUser = await USER_MODEL.create(user);
        res.json(Notification.message("Tạo tài khoản thành công", "ok", 200, { user: newUser }));
    }
    catch(err) {
        res.json(Notification.message("Có lỗi xảy ra trong lúc khởi tạo","error",400, { error: err }))
    }
}

module.exports.put = async (req, res) => {
    const { user, userId } = res.locals;
    try {
        const newUpdateUser = await USER_MODEL.updateOne({_id: userId},{$set: user});
        res.json(Notification.message("Cập nhật tài khoản thành công", "ok", 200));
    }
    catch(err) {
        res.json(Notification.message("Có lỗi xảy ra trong lúc khởi tạo","error",400, { error: err }))
    }
}

module.exports.delete = (req, res) => {
    const { userId } = res.locals;

    USER_MODEL.deleteOne({_id: userId},(err, result) => {
        //have error
        if(err) {
            res.json(Notification.message("Có lỗi xảy ra, không thể xóa", "error", 400, { error: err }));
            return;
        }
        //Successfully delete user
        if(result.deleteCount !== 0) {
            res.json(Notification.message("Xóa người dùng thành công", "ok", 200));
        }
        else {
            res.json(Notification.message("Người dùng vẫn chưa được xóa hoặc đã xóa..", "ok", 200));
        }
    })
}

module.exports.login = (req, res) => {
    const { user } = res.locals;

    jwt.sign(
        {
            data: user //Data
        },
        process.env.PRIVATE_KEY, //Private
        { expiresIn: '1h' }, //expires
        (err, token) => {
            if(err) {
                res.json(Notification.message("Không tạo được token, có lỗi xảy ra", "error", 400));
            }
            else {
                res.json(Notification.message("Đăng nhập thành công", "ok", 200, { token: token, userId: user._id }))
            }
        }
    )
}

module.exports.resetPasswordFromAdmin = (req, res) => {
    const { user, password, id } = res.locals;
    USER_MODEL.updateOne({_id: id}, {$set: { password: password }}, (err, result) => {
        if(err) {
            res.json(Notification.message("Có lỗi xảy ra ! Không thể tạo mới mật khẩu với mật khẩu này", "error", 400));
            return;
        }
        if(result.n >= 1) {
            if(result.nModified !== 0) {
                res.json(Notification.message("Cập nhật mật khẩu mới thành công", "ok", 200));
            }
            else {
                res.json(Notification.message("Lỗi ! Mật khẩu mới chưa được cập nhật", "error", 400));
            }
        }
        else {
            res.json(Notification.message("Cập nhật mật khẩu mới thất bại, vui lòng kiểm tra lại", "error", 400));
        }
    })
}