function calcPageCount(count, itemPerPage) {
  if (count === 0) {
    return 1;
  }

  const fullPageCount = count / itemPerPage;
  const intPageCount = parseInt(fullPageCount);
  const pagesCount = fullPageCount === intPageCount ? intPageCount : intPageCount + 1;

  return pagesCount || 1;
}

module.exports = {
  calcPageCount,
}