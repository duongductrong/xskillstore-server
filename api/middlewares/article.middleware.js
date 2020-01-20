const ARTICLE_MODEL = require("../models/articles.model");
const USER_MODEL = require("../models/user.model");
const Notification = require("../modules/Notification");
const Checking = require("../modules/Checking");
const Application = require("../modules/Application");

module.exports.checkGetAll = async (req, res, next) => {
    try {
        const { page = 1, onpage = 9 } = req.query;
        const ARTICLES = await ARTICLE_MODEL.find().sort({_id: "desc"});

        if(Number.isNaN(Number(page)) || Number.isNaN( Number(onpage))) {
            res.json(Notification.message("Trang hoặc số bài viết hiển thị trên trang không chính xác", "error", 400));
            return;
        }
        //Convert ID Author to Author JSON data
        for(let i = 0; i < ARTICLES.length; i++) {
            ARTICLES[i].author = await Application.AuthorJSON(ARTICLES[i].author);
        }

        res.locals.page = page;
        res.locals.onPage = onpage;
        res.locals.articles = ARTICLES;
        next();
    }
    catch(err) {
        console.error(err);
        res.json(Notification.message("Không truy vấn được bài viết nào", "error", 400));
    }
}

module.exports.checkGetOne = async (req, res, next) => {
    const { url } = req.params;
    let ARTICLE;
    let author;
    try {
        ARTICLE = await ARTICLE_MODEL.findOne({url: url});
    }
    catch(err) {
        res.json(Notification.message("Có lỗi xảy ra! Bài viết này không tồn tại", "error", 404));
        return;
    }

    if(Checking.isNull(ARTICLE)) {
        res.json(Notification.message("Lỗi ! Bài viết này không tồn tại", "error", 404));
        return;
    }

    author = await Application.AuthorJSON(ARTICLE.author);
    ARTICLE.author = author;

    res.locals.article = ARTICLE;
    next();
}

module.exports.checkCreate = async (req, res, next) => {
    let errors = {};
    const { userLogin } = res.locals; //Get user detail from CheckAuth in user middleware to handling data for article
    let { title, url, paragraph, thumbnail, author, tags, created} = req.body;
    //Kiểm tra tiêu đề
    if(Checking.isNull(title)) {
        errors.title = Notification.message("Tiêu đề không được để trống", "error", 404);
    }
    //Kiểm tra paragraph
    if(Checking.isNull(paragraph)) {
        errors.paragraph = Notification.message("Đoạn văn không được để trống", "error", 404);
    }

    //Kiểm tra url
    if(Checking.isNull(url)) {
        errors.url = Notification.message("Đường dẫn bài viết không được để trống", "error", 404);
    }
    else {
        if(!Checking.isUrl(url)) {
            errors.url = Notification.message("Đường dẫn không được tồn tại khoảng trống, ký tự đặc biệt bị cấm", "error", 400);
        }
        else {
            if((await Checking.isExists(url, ARTICLE_MODEL ,"url")).exists) {
                errors.url = Notification.message("Đường dẫn này đã tồn tại", "error", 400);
            }
        }
    }

    //Kiểm tra thumbnail
    if(Checking.isNull(thumbnail)) {
        errors.thumbnail = Notification.message("Ảnh bài viết không được để trống", "error", 404);
    }
    else {
        if(!Checking.isImage(thumbnail)) {
            errors.thumbnail = Notification.message("Ảnh bài viết phải là hình ảnh hoặc gif", "error", 400);
        }
    }

    //Kiem tra tags
    if(Checking.isNull(tags)) {
        errors.tags = Notification.message("Thẻ thể loại không được để trống", "error", 404);
    }

    //Add user logining to writer post
    author = userLogin._id;

    if(Checking.testError(errors)) {
        res.json(Notification.message("Có lỗi xảy ra", "error", 400, { errors: errors }))
        return;
    }

    res.locals.article = {
        title: title,
        url: url,
        paragraph: paragraph,
        tags: tags,
        author: author,
        thumbnail: thumbnail
    };

    next();
}

//Doing
module.exports.checkPut = async (req, res, next) => {
    const urlArticle = req.params.url;
    const { userLogin } = res.locals; //Get user detail from CheckAuth in user middleware to handling data for article
    let errors = {};
    let { title, url, paragraph, thumbnail, tags} = req.body;

    let ARTICLE = await ARTICLE_MODEL.findOne({url: urlArticle});

    if(Checking.isNull(ARTICLE)) {
        res.json(Notification.message("Bài viết này không tồn tại", "error", 404));
        return;
    }
    //Check quyền cập nhật bài viết [Pass]
    if(!Checking.updateAllowed(userLogin, ARTICLE)) {
        res.json(Notification.message("Bạn không có quyền cập nhật bài viết này", "error", 400))
        return;
    }
    
    //Kiểm tra tiêu đề
    if(Checking.isNull(title)) {
        errors.title = Notification.message("Tiêu đề không được để trống", "error", 404);
    }
    //Kiểm tra paragraph
    if(Checking.isNull(paragraph)) {
        errors.paragraph = Notification.message("Đoạn văn không được để trống", "error", 404);
    }

    //Kiểm tra url
    //If url new != url old, then handling, if not to passed
    if(!Checking.compare(url, ARTICLE.url)) {
        if(Checking.isNull(url)) {
            errors.url = Notification.message("Đường dẫn bài viết không được để trống", "error", 404);
        }
        else {
            if(!Checking.isUrl(url)) {
                errors.url = Notification.message("Đường dẫn không được tồn tại khoảng trống, ký tự đặc biệt bị cấm", "error", 400);
            }
            else {
                if((await Checking.isExists(url, ARTICLE_MODEL ,"url")).exists) {
                    errors.url = Notification.message("Đường dẫn này đã tồn tại", "error", 400);
                }
            }
        }
    }

    //Kiểm tra thumbnail
    if(Checking.isNull(thumbnail)) {
        errors.thumbnail = Notification.message("Ảnh bài viết không được để trống", "error", 404);
    }
    else {
        if(!Checking.isImage(thumbnail)) {
            errors.thumbnail = Notification.message("Ảnh bài viết phải là hình ảnh hoặc gif", "error", 400);
        }
    }

    //Kiem tra tags
    if(Checking.isNull(tags)) {
        errors.tags = Notification.message("Thẻ thể loại không được để trống", "error", 404);
    }

    if(Checking.testError(errors)) {
        res.json(Notification.message("Có lỗi xảy ra", "error", 400, { errors: errors }))
        return;
    }

    res.locals.article = {
        id: ARTICLE._id,
        title: title,
        url: url,
        paragraph: paragraph,
        tags: tags,
        thumbnail: thumbnail
    };

    next();
}

module.exports.checkDelete = async (req, res, next) => {
    const { userLogin } = res.locals;
    const { url } = req.params;
    //Checking url have a exists inside ARTICLE_MODEL with field url
    let article = await Checking.isExists( url, ARTICLE_MODEL, "url" );
    if(!article.exists) {
        res.json(Notification.message("Bài viết này không tồn tại", "error", 400));
        return;
    }
    //Kiểm tra quyền để xóa bài viết [admin = true] [member = checking]
    if(!Checking.updateAllowed(userLogin, ARTICLE_MODEL)) {
        res.json(Notification.message("Bài viết này không phải của bạn, bạn không có quyền xóa", "error", 403));
        return;
    }
    res.locals.article = article.data;
    next();
}