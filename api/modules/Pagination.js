module.exports = (page = 1, onPage) => {
	page = Number(page);
	onPage = Number(onPage);
    let start, end;
    start = (page - 1) * onPage;
    end = (page - 1) * onPage + onPage;

    return {start : start, end : end};
}